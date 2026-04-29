from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect
from twilio.twiml.voice_response import VoiceResponse, Connect, Stream
from pipeline.call_session import process_call
from db.supabase_client import save_call_record
import json

router = APIRouter()

# 存放所有連線中的 WebSocket（用來即時推送）
active_connections = []

# Twilio 打來時觸發
@router.post("/voice")
async def voice(request: Request):
    response = VoiceResponse()
    connect = Connect()
    # 串流音訊到我們的 WebSocket
    connect.stream(url="wss://你的公開網址/stream")
    response.append(connect)
    return str(response)

# 即時音訊串流處理
@router.websocket("/stream")
async def stream(websocket: WebSocket):
    await websocket.accept()
    audio_buffer = bytearray()

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            if msg["event"] == "media":
                # 收到音訊 chunk
                import base64
                chunk = base64.b64decode(msg["media"]["payload"])
                audio_buffer.extend(chunk)

            elif msg["event"] == "stop":
                # 通話結束，處理完整音訊
                if audio_buffer:
                    result = await process_call(bytes(audio_buffer))
                    # 推給所有前端
                    await broadcast(result)

    except WebSocketDisconnect:
        pass

# 推送給前端
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