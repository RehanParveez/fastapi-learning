from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from jose import JWTError, jwt
from app.repositories import user_repository
from app.core.config import settings
from app.websocket.manager import manager

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...), db: Session = Depends(get_db)):
  try:
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    user_id = payload.get("sub")
  except JWTError:
    user_id = None

  user = user_repository.get_user_by_id(db, int(user_id)) if user_id else None
  if not user:
    await websocket.close(code=4401)
    return

  await manager.connect(user.id, websocket)
  try:
    while True:
      await websocket.receive_text()
  except WebSocketDisconnect:
   manager.disconnect(user.id, websocket)