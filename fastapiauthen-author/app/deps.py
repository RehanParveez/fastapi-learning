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

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def get_db():
  db = SessionLocal()      
  try:
    yield db             
  finally:
    db.close()
    
def get_optional_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme_optional)
):
  if token is None:
   return None

  try:
    payload = decode_access_token(token)
    email = payload.get("sub")
    if email is None:
      return None
  except Exception:
      return None

  user = crud.get_user_by_email(db, email=email)
  if user is None or not user.is_active:
    return None

  return user

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
  def __init__(self, max_requests: int = 5, window_seconds: int = 60, per_user: bool = False
    ):
    self.max_requests = max_requests
    self.window = window_seconds
    self.per_user = per_user
    self.requests = defaultdict(list)

  def _get_wait_time(self, key: str) -> int:
    now = time.time()
    timestamps = self.requests.get(key, [])
    if not timestamps:
      return 0
        
    wait = int((timestamps[0] + self.window) - now) + 1
    return max(wait, 0)

  def __call__(self, request: Request, current_user: User = Depends(get_optional_user)
    ):
      if self.per_user and current_user is not None:
        key = f"user:{current_user.id}:{request.method}:{request.url.path}"
      else:
        client_host = request.client.host if request.client else "unknown"
        key = f"ip:{client_host}:{request.method}:{request.url.path}"

      now = time.time()
      self.requests[key] = [
        t for t in self.requests[key]
        if now - t < self.window]

      if len(self.requests[key]) >= self.max_requests:
        retry_after = self._get_wait_time(key)
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=f"Rate limit exceeded. Try again in {retry_after} seconds.",
          headers={"Retry-After": str(retry_after)})

      self.requests[key].append(now)
        
login_rate_limiter = RateLimiter(max_requests=4, window_seconds=60, per_user=False)

user_rate_limiter = RateLimiter(max_requests=10, window_seconds=60, per_user=True)

class PaginationParams:
  def __init__(self, skip: int = 0, limit: int = 12):
    self.skip = skip
    self.limit = limit