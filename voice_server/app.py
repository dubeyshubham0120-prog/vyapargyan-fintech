# Real-Time Hindi Voice Agent Server (FastAPI + Gemini Live API)

import os
import io
import time
import json
import wave
import base64
import asyncio
import logging
import traceback
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from dotenv import load_dotenv

# Google Gemini Live API client
try:
    from google import genai
    from google.genai import types as genai_types
except Exception as e:
    raise ImportError("google-genai SDK is required for Gemini Live integration")

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("gyan_voice_server")

# ---------------------------------------------------------------------------
# Configuration (environment variables)
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_LIVE_MODEL = os.getenv("GEMINI_LIVE_MODEL", "gemini-3.8-live")
GEMINI_VOICE_NAME = os.getenv("GEMINI_VOICE_NAME", "Puck")

# VAD settings for fast latency
VAD_SILENCE_DURATION_MS = int(os.getenv("VAD_SILENCE_DURATION_MS", "350"))
VAD_START_SENSITIVITY = getattr(
    genai_types.StartSensitivity,
    os.getenv("VAD_START_SENSITIVITY", "START_SENSITIVITY_HIGH"),
    genai_types.StartSensitivity.START_SENSITIVITY_HIGH,
)
VAD_END_SENSITIVITY = getattr(
    genai_types.EndSensitivity,
    os.getenv("VAD_END_SENSITIVITY", "END_SENSITIVITY_HIGH"),
    genai_types.EndSensitivity.END_SENSITIVITY_HIGH,
)

SYSTEM_PROMPT_FILE = os.getenv(
    "SYSTEM_PROMPT_FILE",
    os.path.join(os.path.dirname(__file__), "system_prompt.txt"),
)
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:8000,http://127.0.0.1:8000,http://localhost:8080,http://127.0.0.1:8080",
).split(",")

if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not set - Gemini Live sessions will fail")

# Load system prompt
def get_system_prompt() -> str:
    candidates = [
        SYSTEM_PROMPT_FILE,
        os.path.join(os.path.dirname(__file__), "gyan_prompt.py"),
    ]
    for path in candidates:
        if os.path.isfile(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                    if "GYAN_SYSTEM_PROMPT" in content:
                        import importlib.util
                        spec = importlib.util.spec_from_file_location("gyan_prompt", path)
                        mod = importlib.util.module_from_spec(spec)
                        spec.loader.exec_module(mod)
                        return getattr(mod, "GYAN_SYSTEM_PROMPT", content)
                    return content
            except Exception as e:
                logger.warning(f"Error reading prompt file {path}: {e}")
    return (
        "You are Gyan, a friendly Hindi & vernacular financial advisor for rural entrepreneurs in India.\n"
        "Greet the user only once at the start of the conversation. After that, never introduce yourself or say Namaste again.\n"
        "Answer the user's question directly in the first sentence. Keep replies to 1-2 short sentences."
    )

SYSTEM_PROMPT = get_system_prompt()

# ---------------------------------------------------------------------------
# FastAPI app initialisation
# ---------------------------------------------------------------------------
app = FastAPI(title="Gyan Hindi Voice Agent Server (Gemini Live)", version="2.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def pcm_to_wav_base64(pcm_data: bytes, sample_rate: int = 24000) -> str:
    """Encodes raw 16-bit mono PCM bytes to WAV format and returns base64 string."""
    try:
        wav_io = io.BytesIO()
        with wave.open(wav_io, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(pcm_data)
        return base64.b64encode(wav_io.getvalue()).decode("utf-8")
    except Exception as err:
        logger.error(f"Error encoding PCM to WAV: {err}")
        return ""

# ---------------------------------------------------------------------------
# Health endpoints
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "status": "online",
        "model": GEMINI_LIVE_MODEL,
        "voice": GEMINI_VOICE_NAME,
        "vad_silence_duration_ms": VAD_SILENCE_DURATION_MS,
        "gemini_api_configured": bool(GEMINI_API_KEY),
    }

@app.get("/favicon.ico")
async def favicon():
    return Response(status_code=204)

# ---------------------------------------------------------------------------
# WebSocket endpoint - Persistent Single Gemini Live Session per Browser Connection
# ---------------------------------------------------------------------------
@app.websocket("/ws/voice")
async def voice_agent_endpoint(websocket: WebSocket):
    client_ip = websocket.client.host if websocket.client else "127.0.0.1"
    await websocket.accept()
    logger.info(f"[WebSocket accepted] Client IP: {client_ip}")

    client = genai.Client(
        api_key=GEMINI_API_KEY,
        http_options=genai_types.HttpOptions(api_version="v1alpha"),
    )

    # Fast-latency Live configuration with tuned Automatic Activity Detection
    live_config = genai_types.LiveConnectConfig(
        response_modalities=[genai_types.Modality.AUDIO],
        input_audio_transcription=genai_types.AudioTranscriptionConfig(),
        output_audio_transcription=genai_types.AudioTranscriptionConfig(),
        speech_config=genai_types.SpeechConfig(
            voice_config=genai_types.VoiceConfig(
                prebuilt_voice_config=genai_types.PrebuiltVoiceConfig(
                    voice_name=GEMINI_VOICE_NAME
                )
            )
        ),
        realtime_input_config=genai_types.RealtimeInputConfig(
            automatic_activity_detection=genai_types.AutomaticActivityDetection(
                silence_duration_ms=VAD_SILENCE_DURATION_MS,
                start_of_speech_sensitivity=VAD_START_SENSITIVITY,
                end_of_speech_sensitivity=VAD_END_SENSITIVITY,
            )
        ),
        system_instruction=genai_types.Content(
            parts=[genai_types.Part.from_text(text=SYSTEM_PROMPT)]
        ),
    )

    # Tracking turn state and timing latency per turn
    greeted = False
    turn_counter = 0
    turn_start_time: Optional[float] = None
    first_chunk_sent = False

    try:
        logger.info(
            f"[Opening Gemini Live Session] model={GEMINI_LIVE_MODEL}, voice={GEMINI_VOICE_NAME}, "
            f"silence_ms={VAD_SILENCE_DURATION_MS}, start_sens={VAD_START_SENSITIVITY}, end_sens={VAD_END_SENSITIVITY}"
        )
        async with client.aio.live.connect(model=GEMINI_LIVE_MODEL, config=live_config) as session:
            logger.info(f"[Gemini session opened] Model: {GEMINI_LIVE_MODEL} (Single persistent session active)")

            # Send welcome greeting EXACTLY ONCE at the start of conversation
            if not greeted:
                greeting_text = (
                    "Namaste! Main Gyan hoon, aapka vyapar aur loan sahayak. "
                    "Aap mujhse bolkar ya likhkar kuch bhi pooch sakte hain."
                )
                await websocket.send_json({
                    "type": "agent_response",
                    "text": greeting_text,
                    "is_greeting": True,
                })
                greeted = True
                logger.info("[Greeting Sent] Initial greeting dispatched once to browser.")

            async def browser_to_gemini():
                nonlocal turn_start_time, first_chunk_sent, turn_counter
                try:
                    while True:
                        msg = await websocket.receive()
                        if "bytes" in msg and msg["bytes"]:
                            audio_bytes = msg["bytes"]
                            turn_start_time = time.perf_counter()
                            first_chunk_sent = False
                            # Forward real-time audio chunk directly into the active session
                            blob = genai_types.Blob(data=audio_bytes, mime_type="audio/webm")
                            await session.send_realtime_input(media=blob)
                        elif "text" in msg and msg["text"]:
                            text_str = msg["text"]
                            try:
                                data = json.loads(text_str)
                            except Exception:
                                data = {"type": "text", "text": text_str}

                            msg_type = data.get("type", "text")
                            if msg_type in ["text", "text_query"]:
                                query_text = data.get("text") or data.get("query") or ""
                                if query_text:
                                    turn_counter += 1
                                    turn_start_time = time.perf_counter()
                                    first_chunk_sent = False
                                    logger.info(
                                        f"[Turn #{turn_counter}] [Browser -> Gemini Live] Forwarding text: '{query_text}'"
                                    )
                                    # Trigger turn immediately without waiting for audio silence
                                    await session.send_client_content(
                                        turns=genai_types.Content(
                                            role="user",
                                            parts=[genai_types.Part.from_text(text=query_text)],
                                        ),
                                        turn_complete=True,
                                    )
                            elif msg_type == "interrupt":
                                logger.info("[Interruption] Client requested turn reset")
                                await session.send_realtime_input(activity_end=genai_types.ActivityEnd())

                except (WebSocketDisconnect, RuntimeError):
                    logger.info(f"[Browser disconnected] IP: {client_ip}")
                except Exception as err:
                    logger.error(f"[browser_to_gemini error] {err}\n{traceback.format_exc()}")

            async def gemini_to_browser():
                nonlocal turn_start_time, first_chunk_sent, turn_counter
                pcm_buffer = bytearray()
                accumulated_text = []

                try:
                    while True:
                        async for response in session.receive():
                            sc = getattr(response, "server_content", None)
                            if not sc:
                                continue

                            # Model audio output
                            mt = getattr(sc, "model_turn", None)
                            if mt:
                                for part in mt.parts:
                                    if getattr(part, "inline_data", None):
                                        pcm_chunk = part.inline_data.data
                                        pcm_buffer.extend(pcm_chunk)

                                        if not first_chunk_sent and turn_start_time is not None:
                                            latency_ms = (time.perf_counter() - turn_start_time) * 1000
                                            logger.info(
                                                f"[Turn #{turn_counter} Latency] Time to first audio chunk: {latency_ms:.1f} ms"
                                            )
                                            first_chunk_sent = True

                                        await websocket.send_bytes(pcm_chunk)

                                    if getattr(part, "text", None):
                                        accumulated_text.append(part.text)

                            # Output transcription chunks
                            ot = getattr(sc, "output_transcription", None)
                            if ot and getattr(ot, "text", None):
                                transcript_piece = ot.text
                                accumulated_text.append(transcript_piece)
                                await websocket.send_json({
                                    "type": "agent_transcript",
                                    "text": transcript_piece,
                                })

                            # Turn completion
                            if getattr(sc, "turn_complete", False):
                                full_text = "".join(accumulated_text).strip()
                                wav_b64 = pcm_to_wav_base64(bytes(pcm_buffer)) if pcm_buffer else None

                                total_turn_time_ms = (
                                    (time.perf_counter() - turn_start_time) * 1000
                                    if turn_start_time is not None
                                    else 0.0
                                )
                                logger.info(
                                    f"[Turn #{turn_counter} Complete] Total reply latency: {total_turn_time_ms:.1f} ms | "
                                    f"Text: '{full_text[:80]}...' | Audio WAV: {len(wav_b64) if wav_b64 else 0} b64 chars"
                                )

                                await websocket.send_json({
                                    "type": "agent_response",
                                    "text": full_text or "Samajh gaya. Main aapki kya madad kar sakta hoon?",
                                    "audio_b64": wav_b64,
                                })

                                pcm_buffer.clear()
                                accumulated_text.clear()
                                first_chunk_sent = False

                            # Interruption handling
                            if getattr(sc, "interrupted", False):
                                logger.info(f"[Turn #{turn_counter} Interrupted]")
                                pcm_buffer.clear()
                                accumulated_text.clear()
                                first_chunk_sent = False
                                await websocket.send_json({"type": "interrupted"})

                except (WebSocketDisconnect, RuntimeError):
                    logger.info(f"[Client disconnected from stream] IP: {client_ip}")
                except Exception as err:
                    logger.error(f"[gemini_to_browser error] {err}\n{traceback.format_exc()}")
                    try:
                        await websocket.send_json({"type": "error", "message": str(err)})
                    except Exception:
                        pass

            browser_task = asyncio.create_task(browser_to_gemini())
            gemini_task = asyncio.create_task(gemini_to_browser())
            done, pending = await asyncio.wait(
                [browser_task, gemini_task], return_when=asyncio.FIRST_COMPLETED
            )
            for p in pending:
                p.cancel()

    except Exception as exc:
        logger.error(f"[Gemini Live Session Exception] {exc}\n{traceback.format_exc()}")
        try:
            await websocket.send_json({"type": "error", "message": f"Gemini Error: {str(exc)}"})
        except Exception:
            pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
        logger.info(f"[WebSocket session ended] IP: {client_ip}")
