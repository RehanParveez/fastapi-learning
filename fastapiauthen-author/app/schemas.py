from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, TypeVar, Generic

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
  
  model_config = ConfigDict(from_attributes=True)
  
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
    
class NoteCreate(BaseModel):
  title: str
  description: Optional[str] = ""
  
class NoteRead(BaseModel):
  id: int
  title: str
  description: Optional[str]
  owner_id: int
  
  model_config = ConfigDict(from_attributes=True)
  
class AttachmentRead(BaseModel):
  id: int
  filename: str
  file_path: str
  note_id: int
  
  model_config = ConfigDict(from_attributes=True)
  
T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
  items: List[T]
  total: int
  skip: int
  limit: int
  has_more: bool