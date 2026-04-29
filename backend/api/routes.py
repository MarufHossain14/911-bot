# api/routes.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from pipeline.call_session import process_call
from db.supabase_client import get_call_records

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