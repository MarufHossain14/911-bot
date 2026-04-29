# services/translate.py
import httpx
from config import ELEVENLABS_API_KEY

async def translate(text: str, source_lang: str, target_lang: str = "en") -> str:
    """
    return translated text using ElevenLabs API
    """
    # all translate logic goes here
    # return the translated text
    translated_text = "..."  
    return translated_text