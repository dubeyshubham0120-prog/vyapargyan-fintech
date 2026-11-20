# ElevenLabs Conversational AI Integration Client

import os
import httpx
import logging
from elevenlabs_agent_config import (
    ELEVENLABS_VOICE_ID,
    ELEVENLABS_MODEL_ID,
    GYAN_ELEVENLABS_PROMPT,
    get_elevenlabs_agent_payload
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("elevenlabs_client")

class ElevenLabsVoiceEngine:
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY", "").strip()
        self.agent_id = os.getenv("ELEVENLABS_AGENT_ID", "").strip()
        self.voice_id = ELEVENLABS_VOICE_ID
        self.model_id = ELEVENLABS_MODEL_ID
        self.base_url = "https://api.elevenlabs.io/v1"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    async def get_signed_url(self) -> dict:
        """
        Generates a secure, temporary signed WebSocket URL from ElevenLabs API.
        Protects ELEVENLABS_API_KEY from client-side exposure.
        """
        self.api_key = os.getenv("ELEVENLABS_API_KEY", "").strip()
        self.agent_id = os.getenv("ELEVENLABS_AGENT_ID", "").strip()

        if not self.is_configured():
            logger.info("[ElevenLabs] API key not set. Using local server fallback.")
            return {"success": False, "signed_url": None, "reason": "ELEVENLABS_API_KEY missing"}

        if not self.agent_id:
            created_id = await self.create_agent_if_needed()
            if created_id:
                self.agent_id = created_id
                os.environ["ELEVENLABS_AGENT_ID"] = created_id
            else:
                return {
                    "success": False,
                    "signed_url": None,
                    "reason": "ElevenLabs API key is missing 'convai_read' / 'convai_write' permissions or is on a Free Plan for Library Voices. Please check ElevenLabs Dashboard permissions."
                }

        url = f"{self.base_url}/convai/conversation/get_signed_url?agent_id={self.agent_id}"
        headers = {"xi-api-key": self.api_key}

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                res = await client.get(url, headers=headers)
                res.raise_for_status()
                data = res.json()
                signed_url = data.get("signed_url")
                logger.info(f"[ElevenLabs Signed URL Generated Successfully for Agent {self.agent_id}]")
                return {"success": True, "signed_url": signed_url, "agent_id": self.agent_id}
            except Exception as e:
                logger.error(f"[ElevenLabs Signed URL Error]: {e}")
                return {"success": False, "signed_url": None, "error": str(e)}

    async def create_agent_if_needed(self) -> str:
        """
        Queries existing agents or creates a new ElevenLabs Conversational AI Agent with Armaan voice & eleven_flash_v2_5.
        """
        if not self.api_key:
            return ""

        headers = {"xi-api-key": self.api_key}

        # Step 1: Check existing agents
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                list_res = await client.get(f"{self.base_url}/convai/agents", headers=headers)
                if list_res.status_code == 200:
                    agents_data = list_res.json().get("agents", [])
                    if len(agents_data) > 0:
                        first_agent_id = agents_data[0].get("agent_id", "")
                        logger.info(f"[ElevenLabs Existing Agent Found]: {first_agent_id}")
                        return first_agent_id
                elif list_res.status_code == 401:
                    logger.warn("[ElevenLabs API Key Permission Error]: Key missing 'convai_read' permission.")
                    return ""
            except Exception as e:
                logger.warn(f"[ElevenLabs Agent List Warning]: {e}")

        # Step 2: Create new agent payload if none exist
        url = f"{self.base_url}/convai/agents/create"
        headers["Content-Type"] = "application/json"
        payload = get_elevenlabs_agent_payload("Gyan VyaparGyan Advisor")

        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                res = await client.post(url, headers=headers, json=payload)
                res.raise_for_status()
                data = res.json()
                agent_id = data.get("agent_id", "")
                logger.info(f"[ElevenLabs Agent Created Successfully]: {agent_id}")
                return agent_id
            except Exception as e:
                logger.error(f"[ElevenLabs Agent Create Error]: {e}")
                return ""
