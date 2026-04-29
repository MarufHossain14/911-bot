# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from api.websocket import websocket_endpoint

app = FastAPI(title="SafeGuard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST routes
app.include_router(router)

# WebSocket
app.add_websocket_route("/ws/dispatch", websocket_endpoint)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)