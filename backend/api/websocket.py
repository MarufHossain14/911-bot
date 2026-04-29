# api/websocket.py
from fastapi import WebSocket, WebSocketDisconnect
from pipeline.call_session import process_call

async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    audio_buffer = bytearray()

    try:
        while True:
            message = await websocket.receive()

            # front end send the chunk（binary）
            if "bytes" in message:
                audio_buffer.extend(message["bytes"])
                await websocket.send_json({
                    "status": "receiving",
                    "bytes": len(audio_buffer)
                })

            # front end say "process" (text)
            elif "text" in message:
                if message["text"] == "PROCESS":
                    await websocket.send_json({"status": "processing"})

                    result = await process_call(bytes(audio_buffer))
                    await websocket.send_json(result)

                    audio_buffer.clear()
                    await websocket.send_json({"status": "ready"})

    except WebSocketDisconnect:
        print("Client disconnected")