from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from pipeline.call_session import process_call
from db.supabase_client import get_call_records, supabase

router = APIRouter()

@router.post("/webhook/elevenlabs")
async def elevenlabs_webhook(request: Request):
    data = await request.json()
    event_type = data.get("type")
    
    # ElevenLabs event types: conversation_initiated, conversation_terminated
    conversation_id = data.get("conversation_id")
    
    if event_type == "conversation_initiated":
        # Get caller ID if available (from metadata or payload)
        metadata = data.get("metadata", {})
        caller_number = metadata.get("caller_id") or "Incoming Call"
        
        supabase.table("active_calls").insert({
            "conversation_id": conversation_id,
            "caller_number": caller_number,
            "status": "ringing"
        }).execute()
        
    elif event_type == "conversation_terminated":
        supabase.table("active_calls").update({
            "status": "ended"
        }).eq("conversation_id", conversation_id).execute()
        
    return {"status": "ok"}

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