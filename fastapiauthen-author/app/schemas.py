from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
  username: str
  email: EmailStr
  password: str
  role: str = "user"
  
class UserLogin(BaseModel):
  email: EmailStr
  password: str
  
class UserRead(BaseModel):
  id: int
  username: str
  email: EmailStr
  role: str
  is_active: bool
  
class Token(BaseModel):
  access_token: str
  token_type: str
  
class TokenData(BaseModel):
  email: Optional[EmailStr] = None
  role: Optional[str] = None
  
class TaskCreate(BaseModel):
  title: str
  description: Optional[str] = None

class TaskRead(BaseModel):
  id: int
  title: str
  description: Optional[str] = None
  owner_id: int
  is_completed: bool

  class Config:
    from_attributes = True