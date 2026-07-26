from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from app.auth import decode_access_token
from app.schemas import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl = "/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
  credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = "cant validate credentials",
    headers={"WWW-Authenticate": "Bearer"})

  try:
    payload = decode_access_token(token)
    email = payload.get("sub")
    role = payload.get("role")
    if email is None:
      raise credentials_exception
    token_data = TokenData(email=email, role=role)
  except Exception:
      raise credentials_exception
  return token_data

def get_current_admin(current_user = Depends(get_current_user)):
  if current_user.role != "admin":
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = 'Admin only')
  return current_user