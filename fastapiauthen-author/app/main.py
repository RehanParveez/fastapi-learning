from fastapi import FastAPI
from app.routers import auth, users, tasks, notes
from app.middleware.logging import LoggingMiddleware, SecurityHeadersMiddleware
from fastapi.middleware.cors import CORSMiddleware
from app.websocket.router import router as ws_router
from datetime import datetime, timezone

app = FastAPI()

@app.get("/health")
def health_check():
  return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

app.add_middleware(LoggingMiddleware)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],)
app.add_middleware(SecurityHeadersMiddleware)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(notes.router)
app.include_router(ws_router)
