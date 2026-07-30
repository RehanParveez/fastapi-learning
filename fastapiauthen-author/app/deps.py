from fastapi.security import OAuth2PasswordBearer
from app.db.session import SessionLocal
from fastapi import Depends, HTTPException, status, Request
import time
from app.auth import decode_access_token
from collections import defaultdict
from sqlalchemy.orm import Session
from app.db import crud
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl = "/auth/login")

def get_db():
  db = SessionLocal()      
  try:
    yield db             
  finally:
    db.close()

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
  credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = "cant validate credentials",
    headers={"WWW-Authenticate": "Bearer"})

  try:
    payload = decode_access_token(token)
    email = payload.get("sub")
    if email is None:
      raise credentials_exception
  except Exception:
    raise credentials_exception
    
  user = crud.get_user_by_email(db, email=email)
  if user is None:
    raise credentials_exception
  if not user.is_active:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "inactive user")
  
  return user

def get_current_admin(current_user: User = Depends(get_current_user)):
  if current_user.role != "admin":
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = 'Admin only')
  return current_user

class RateLimiter:
  def __init__(self, max_requests: int = 5, window_seconds: int = 60):
    self.max_requests = max_requests
    self.window = window_seconds
    self.requests = defaultdict(list)
    
  def __call__(self, request: Request):
    key = f"{request.client.host}:{request.url.path}"
    now = time.time()
    self.requests[key] = [t for t in self.requests[key] if now - t < self.window]
        
    if len(self.requests[key]) >= self.max_requests:
      raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail = "too many requests. try again later.")
        
    self.requests[key].append(now)
    
login_rate_limiter = RateLimiter(max_requests=4, window_seconds=60)

class PaginationParams:
  def __init__(self, skip: int = 0, limit: int = 12):
    self.skip = skip
    self.limit = limit