from sqlalchemy.orm import Session
from app.websocket.manager import manager
from app.repositories import user_repository
from app.notifications.adapter import notification_adapter

def notify_user(db: Session, user_id: int, event: str, data: dict) -> None:
  manager.notify(user_id, event, data)  
  user = user_repository.get_user_by_id(db, user_id)
  notification_adapter.send(user_id, user.phone if user else None, event, data)