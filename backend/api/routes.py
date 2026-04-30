from fastapi import APIRouter, UploadFile, File, HTTPException
from pipeline.call_session import process_call
from db.supabase_client import get_call_records, save_call_record
import httpx
from config import ELEVENLABS_API_KEY

router = APIRouter()

@router.post("/process")
async def process_audio(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    try:
        return await process_call(audio_bytes)
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/calls")
async def get_calls():
    try:
        return await get_call_records()
    except Exception as e:
        raise HTTPException(500, str(e))

@router.get("/fetch-transcripts")
async def fetch_transcripts():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.elevenlabs.io/v1/convai/conversations",
                headers={"xi-api-key": ELEVENLABS_API_KEY},
            )
            data = response.json()
            conversations = data.get("conversations", [])

            # 存進 Supabase
            for conv in conversations:
                await save_call_record(
                    original_text=conv.get("transcript", ""),
                    translated_text="",
                    language_code=conv.get("metadata", {}).get("language_code", "unknown"),
                    language_name=conv.get("metadata", {}).get("language_name", "Unknown"),
                )

            return conversations
    except Exception as e:
        raise HTTPException(500, str(e))