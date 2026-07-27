from fastapi.security import OAuth2PasswordBearer
from app.db.session import SessionLocal
from fastapi import Depends, HTTPException, status
from app.auth import decode_access_token
from app.schemas import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl = "/auth/login")

def get_db():
  db = SessionLocal()      
  try:
    yield db             
  finally:
    db.close()

def get_current_user(token: str = Depends(oauth2_scheme)):
  credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = "cant validate credentials",
    headers={"WWW-Authenticate": "Bearer"})

  try:
    payload = decode_access_token(token)
    email = payload.get("sub")
    role = payload.get("role")
    if email is None:
      raise credentials_exception
    return TokenData(email=email, role=role)
  except Exception:
      raise credentials_exception

def get_current_admin(current_user = Depends(get_current_user)):
  if current_user.role != "admin":
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = 'Admin only')
  return current_user