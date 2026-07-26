from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM
from datetime import datetime, timedelta, timezone
from jose import jwt

def create_access_token(data: dict, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES):
  to_encode = data.copy()
  expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
  to_encode.update({"exp": expire})
  return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
  return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])