from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect
from db.supabase_client import save_call_record, get_call_records
import httpx
from config import ELEVENLABS_API_KEY
import json

router = APIRouter()

# 存放前端 WebSocket 連線
active_connections = []

# ElevenLabs push transcript to this endpoint 
#after receiving, save to supabase and broadcast to all connected frontends
@router.post("/webhook/transcript")
async def receive_transcript(request: Request):
    data = await request.json()
    print("received transcript:", data)  # this should show the transcript and metadata in the backend console
    
    await save_call_record(
        original_text=data.get("transcript", ""),
        translated_text=data.get("translated_transcript", ""),
        language_code=data.get("language_code", "unknown"),
    )
    
    # push to frontend via WebSocket
    await broadcast(data)
    return {"status": "ok"}

# WebSocket endpoint for frontend to receive live updates
@router.websocket("/ws/live")
async def ws_live(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.remove(websocket)

async def broadcast(data: dict):
    for ws in active_connections:
        try:
            await ws.send_json(data)
        except:
            active_connections.remove(ws)