from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.models.user import User
from app.db.session import get_db
from fastapi import Depends, HTTPException, status
from jose import jwt, JWTError
from app.core.config import settings
from app.repositories import user_repository
from app.models.user import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl = "auth/login")

def get_current_user(
  token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
  credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = "could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"})
  try:
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    user_id = payload.get("sub")
    if user_id is None:
      raise credentials_exception
  except JWTError:
    raise credentials_exception

  user = user_repository.get_user_by_id(db, int(user_id))
  if user is None:
    raise credentials_exception
  return user

def require_role(*allowed_roles: UserRole):
  def role_checker(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in allowed_roles:
      raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
        detail=f"This action requires one of these roles: {[r.value for r in allowed_roles]}")
    return current_user
  return role_checker