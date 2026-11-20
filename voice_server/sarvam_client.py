# Sarvam AI Async Client Wrapper (STT Saaras, TTS Bulbul, Chat LLM 105B)

import os
import base64
import httpx
import logging
from gyan_prompt import GYAN_SYSTEM_PROMPT, check_guardrails_text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sarvam_client")

class SarvamVoiceEngine:
    def __init__(self):
        self.api_key = os.getenv("SARVAM_API_KEY", "").strip()
        self.stt_url = "https://api.sarvam.ai/speech-to-text"
        self.tts_url = "https://api.sarvam.ai/text-to-speech"
        self.chat_url = "https://api.sarvam.ai/v1/chat/completions"
        self.male_speaker = os.getenv("SARVAM_TTS_SPEAKER", "arvind")

    def is_api_key_set(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    async def transcribe_audio(self, audio_bytes: bytes, filename: str = "input.wav") -> str:
        """
        Transcribes input audio using Sarvam Saaras STT API (saaras:v1).
        Fallback to mock transcription if API key is not set.
        """
        if not self.is_api_key_set():
            logger.info("[Mock STT] API key not set. Using mock speech recognition.")
            return "Trust Score kya hai aur yeh kaise nikalte hain?"

        headers = {"api-subscription-key": self.api_key}
        files = {"file": (filename, audio_bytes, "audio/wav")}
        data = {"model": "saaras:v1", "language_code": "hi-IN"}

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                res = await client.post(self.stt_url, headers=headers, files=files, data=data)
                res.raise_for_status()
                json_data = res.json()
                transcript = json_data.get("transcript", "").strip()
                logger.info(f"[Sarvam STT Output]: {transcript}")
                return transcript
            except Exception as e:
                logger.error(f"[Sarvam STT Error]: {e}")
                return "Trust Score kaise calculate hota hai?"

    async def generate_llm_response(self, user_transcript: str, chat_history: list = None) -> dict:
        """
        Generates conversational response using Sarvam Chat API (sarvam-105b) with Gyan persona and knowledge base.
        """
        # 1. Guardrail check first
        guard_result = check_guardrails_text(user_transcript)
        if guard_result["triggered"]:
            return {
                "text": guard_result["response"],
                "guardrail_type": guard_result["type"],
                "handoff": guard_result["type"] == "human_handoff"
            }

        # 2. Real LLM Call using sarvam-105b model
        if self.is_api_key_set():
            headers = {
                "api-subscription-key": self.api_key,
                "Content-Type": "application/json"
            }

            messages = [{"role": "system", "content": GYAN_SYSTEM_PROMPT}]
            if chat_history:
                messages.extend(chat_history[-4:]) # Context window
            messages.append({"role": "user", "content": user_transcript})

            payload = {
                "model": "sarvam-105b",  # Correct Sarvam LLM model name
                "messages": messages,
                "max_tokens": 120,
                "temperature": 0.5
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                try:
                    res = await client.post(self.chat_url, headers=headers, json=payload)
                    if res.status_code == 200:
                        json_data = res.json()
                        choices = json_data.get("choices", [])
                        if choices and "message" in choices[0]:
                            reply_text = choices[0]["message"].get("content", "")
                            if reply_text:
                                reply_text = reply_text.strip()
                                logger.info(f"[Sarvam 105B LLM Output]: {reply_text[:60]}...")
                                return {
                                    "text": reply_text,
                                    "guardrail_type": None,
                                    "handoff": False
                                }
                    else:
                        logger.warn(f"[Sarvam LLM Non-200 Response]: {res.status_code} {res.text}")
                except Exception as e:
                    logger.error(f"[Sarvam LLM Error]: {e}")

        # 3. Knowledge Base Offline NLP Engine (for unanswered queries or network fallback)
        text_lower = user_transcript.lower()

        # Question: What is Trust Score & how is it calculated?
        if any(w in text_lower for w in ["calculate", "calculated", "nikalte", "kaise banta", "how is it"]):
            reply = "Trust Score (300-900) aapke UPI QR transactions, harvest season, community vouching aur bill payments se calculate hota hai. Isse bina CIBIL ke loan milta hai!"
        
        elif any(w in text_lower for w in ["what is trust score", "trust score kya", "ट्रस्ट स्कोर क्या"]):
            reply = "Trust Score rural entrepreneurs ke liye ek alternative credit score hai. Yeh aapke real cashflow aur vyapar ko bankable profile mein badalta hai."

        # Question: Can I get a loan without credit history?
        elif any(w in text_lower for w in ["credit history", "cibil", "bina bank", "no credit", "without credit"]):
            reply = "Haan! VyaparGyan par bina kisi CIBIL ya bank credit history ke loan milta hai. Aapka dukan QR cashflow hi aapka credit proof hai."

        # Government Schemes & Subsidies
        elif any(w in text_lower for w in ["scheme", "government", "yojana", "योजना", "mudra", "pmegp", "svanidhi", "sarkari", "subsidy"]):
            reply = "Aapke business ke liye PMEGP yojana aur PM SVANidhi (₹10,000-50,000 zero-collateral loan) sabse behtar hain. Isme 15%-35% tak sarkari subsidy milti hai!"

        # Working Capital & Loan Amount
        elif any(w in text_lower for w in ["loan", "लोन", "capital", "वर्किंग", "paisa", "borrow", "credit"]):
            reply = "Aapki dukan ke stock ke liye ₹50,000 tak ka working capital loan pre-approved hai. Iski kist har hafte sirf ₹590 hoti hai."

        # Interest Rates & Moneylender Math
        elif any(w in text_lower for w in ["interest", "vyaj", "ब्याज", "rate", "mahajan", "moneylender", "bank"]):
            reply = "Mahajan har mahine 5% leta hai jo saal ka 60% banta hai! Bank ka 12% annual rate mahajan se 5 guna sasta hai."

        # Kisan & Harvest Credit
        elif any(w in text_lower for w in ["kisan", "crop", "fasal", "फसल", "mandi", "farmer", "harvest"]):
            reply = "Kisan harvest credit mein fasal ugne ke dauran koi kist nahi deni hoti. Mandi mein fasal bechne ke baad bhugtan karein."

        # Shop Insurance
        elif any(w in text_lower for w in ["insurance", "bima", "बीमा", "aag", "chori", "protect"]):
            reply = "Suraksha Dukan insurance aapke stock ko aag, pani aur chori se bachata hai. Iska premium sirf ₹3/day hai."

        # Documents & KYC
        elif any(w in text_lower for w in ["doc", "document", "aadhaar", "kagaj", "kyc"]):
            reply = "Aapko physical paperwork ki zaroorat nahi hai. Baseline verification dukan ki UPI QR statement camera se scan karke ho jati hai."

        # English / Language Switch Queries
        elif "english" in text_lower or "speak english" in text_lower:
            reply = "Sure! I can speak English. How can I help you with your business Trust Score or loans today?"
        elif "marathi" in text_lower or "मराठी" in text_lower:
            reply = "नमस्कार! मी ज्ञान आहे. तुमच्या दुकानाच्या किंवा शेतीच्या ट्रस्ट स्कोरबद्दल मी कशी मदत करू शकतो?"

        # Default query handler
        else:
            clean_q = user_transcript.replace('?', '').strip()
            reply = f"Aapke sawaal '{clean_q}' ke liye: TrustScore (300-900) aapke UPI cashflow se banta hai aur aap bina CIBIL ke ₹50,000 loan ke liye eligible hain."

        logger.info(f"[Offline Knowledge Engine Reply]: {reply}")
        return {
            "text": reply,
            "guardrail_type": None,
            "handoff": False
        }

    async def synthesize_speech(self, text: str) -> str:
        """
        Synthesizes text into spoken Hindi audio using Sarvam Bulbul TTS API (bulbul:v1).
        Returns base64 encoded audio string.
        """
        if not self.is_api_key_set():
            logger.info("[Mock TTS] Using fallback base64 audio signal.")
            return ""

        headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json"
        }

        payload = {
            "inputs": [text],
            "target_language_code": "hi-IN",
            "speaker": self.male_speaker,
            "pitch": 0,
            "pace": 0.95,
            "loudness": 1.5,
            "speech_sample_rate": 22050,
            "enable_preprocessing": True,
            "model": "bulbul:v1"
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                res = await client.post(self.tts_url, headers=headers, json=payload)
                res.raise_for_status()
                json_data = res.json()
                audio_b64 = json_data.get("audios", [""])[0]
                return audio_b64
            except Exception as e:
                logger.error(f"[Sarvam TTS Error]: {e}")
                return ""
