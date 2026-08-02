from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from app.models.user import UserRole

class UserBase(BaseModel):
  phone: str
  email: EmailStr | None = None
  role: UserRole

class UserCreate(UserBase):
  password: str

class UserOut(UserBase):
  id: int
  is_active: bool
  created_at: datetime

  model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
  access_token: str
  token_type: str = "bearer"