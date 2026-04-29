# services/text_to_speech.py
import httpx
from config import ELEVENLABS_API_KEY, DISPATCHER_VOICE_ID

async def speak(text: str) -> bytes:
    #import text and return audio bytes using ElevenLabs API
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{DISPATCHER_VOICE_ID}",
            headers={
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json"
            },
            json={
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": 0.7,
                    "similarity_boost": 0.8,
                }
            },
        )
        response.raise_for_status()

    return response.content  # MP3 bytes