import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import JWTError, jwt
from app.core.config import settings
from app.repositories import user_repository
from app.websocket.manager import manager
from app.db.session import SessionLocal

logger = logging.getLogger("kisanlink.ws")
router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    await websocket.accept()
    logger.info("WS: connection accepted")
    
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = payload.get("sub")
        logger.info(f"WS: token decoded, user_id={user_id}")
    except JWTError as e:
        logger.warning(f"WS: JWT invalid - {e}")
        await websocket.close(code=4401)
        return

    if not user_id:
        logger.warning("WS: no user_id in token")
        await websocket.close(code=4401)
        return

    db = SessionLocal()
    user = None
    try:
        user = user_repository.get_user_by_id(db, int(user_id))
        logger.info(f"WS: DB lookup success={user is not None}")
    except Exception as e:
        logger.error(f"WS: DB lookup error - {e}")
    finally:
        db.close()

    if not user:
        logger.warning(f"WS: user {user_id} not found in DB")
        await websocket.close(code=4401)
        return
    try:
        await manager.connect(user.id, websocket)
        logger.info(f"WS: user {user.id} registered successfully")
    except Exception as e:
        logger.error(f"WS: manager.connect failed - {e}")
        return
    try:
        while True:
            data = await websocket.receive_text()
            logger.debug(f"WS: received from user {user.id}: {data}")
    except WebSocketDisconnect:
        logger.info(f"WS: user {user.id} disconnected cleanly")
        manager.disconnect(user.id, websocket)
    except Exception as e:
        logger.error(f"WS: loop error for user {user.id} - {e}")
        manager.disconnect(user.id, websocket)