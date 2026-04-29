import httpx
from config import ELEVENLABS_API_KEY

async def transcribe(audio_bytes: bytes)->dict:
    # Transcribe audio using ElevenLabs API
    async with httpx.AsyncClient(timeout = 30) as client:
        response = await client.post(
            "https://api.elevenlabs.io/v1/speech-to-text",
            headers={"xi-api-key": ELEVENLABS_API_KEY},
            files={"audio": ("audio.webm", audio_bytes, "audio/webm")},
            data = {"model_id": "scribe_v1"}
        )
        response.raise_for_status()
        data = response.json()
    return {
        "text": data.get("text", ""),
        "language_code": data.get("language_code", "unknown"),
        "language_name": data.get("language_name", "unknown"),
    }
    