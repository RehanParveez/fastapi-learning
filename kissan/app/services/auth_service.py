from sqlalchemy.orm import Session
from app.schemas.user import UserCreate
from app.models.user import User
from app.repositories import user_repository
from fastapi import HTTPException, status
from app.core.security import hash_password, verify_password

def register_user(db: Session, user_in: UserCreate) -> User:
  existing = user_repository.get_user_by_phone(db, user_in.phone)
  if existing:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A user with this phone number already exists")

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