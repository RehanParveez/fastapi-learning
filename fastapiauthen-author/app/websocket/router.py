from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.auth import decode_access_token
from app.db.session import SessionLocal
from app.db import crud
from app.websocket.manager import manager

router = APIRouter(prefix="/ws", tags=["websocket"])

@router.websocket("/")
async def websocket_endpoint(websocket: WebSocket, token: str):
  try:
    payload = decode_access_token(token)
    email = payload.get("sub")
    if email is None:
      await websocket.close(code=4001, reason = "wrong token")
      return
  except Exception:
    await websocket.close(code=4001, reason = "wrong token")
    return

  db = SessionLocal()
  try:
    user = crud.get_user_by_email(db, email=email)
    if user is None or not user.is_active:
      await websocket.close(code=4001, reason = "the user is not pres or inactive")
      return
  
  finally:
    db.close()
    await manager.connect(websocket, user_id=user.id)
    await manager.send_to_user(user_id=user.id, message={"type": "connection_established",
      "data": {"message": f"Welcome {user.username}! Real-time connection active."}})

    try:
      while True:
        data = await websocket.receive_text()  
        await manager.send_to_user(user_id=user.id, message={"type": "echo", "data": {"received": data}})    
    except WebSocketDisconnect:
      manager.disconnect(websocket, user_id=user.id)