# api/routes.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from pipeline.call_session import process_call

router = APIRouter()

@router.post("/process")
async def process_audio(audio: UploadFile = File(...)):
    #testing: upload the audio file directly
    audio_bytes = await audio.read()
    try:
        return await process_call(audio_bytes)
    except Exception as e:
        raise HTTPException(500, str(e))