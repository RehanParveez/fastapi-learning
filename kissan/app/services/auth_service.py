from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate
from app.models.user import User
from app.repositories import user_repository
from fastapi import HTTPException, status
from app.core.security import hash_password, verify_password
import secrets

def register_user(db: Session, user_in: UserCreate) -> User:
  existing = user_repository.get_user_by_phone(db, user_in.phone)
  if existing:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A user with this phone number already exists")
  
  if user_in.username:
    existing_username = user_repository.get_user_by_username(db, user_in.username)
    if existing_username:
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "username already taken")
    
  hashed = hash_password(user_in.password)
  return user_repository.create_user(db, phone=user_in.phone, email=user_in.email, hashed_password=hashed, role=user_in.role)

def authenticate_user(db: Session, phone: str, password: str) -> User:
  user = user_repository.get_user_by_phone(db, phone)
  if not user or not verify_password(password, user.hashed_password):
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = "wrong phone or password",
      headers={"WWW-Authenticate": "Bearer"})
  if not user.is_active:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "this account has been deactivated")
  return user

def forgot_password(db: Session, phone: str) -> tuple[User, str]:
  user = user_repository.get_user_by_phone(db, phone)
  if not user:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "if this phone exists, a reset link has been sent")
  
  token = secrets.token_urlsafe(32)
  expires = datetime.now(timezone.utc) + timedelta(hours=1)
  user.reset_token = token
  user.reset_token_expires = expires
  user_repository.save_user(db, user)
  
  return user, token

def reset_password(db: Session, token: str, new_password: str) -> User:
  user = user_repository.get_user_by_reset_token(db, token)
  if not user:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "wrong or expired reset token")
  if not user.reset_token_expires or user.reset_token_expires < datetime.now(timezone.utc):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "reset token has expired")
  
  hashed = hash_password(new_password)
  return user_repository.update_password(db, user, hashed)