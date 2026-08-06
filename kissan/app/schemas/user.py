from pydantic import BaseModel, EmailStr, ConfigDict, Field
from datetime import datetime
from app.models.user import UserRole, Gender

class UserBase(BaseModel):
  phone: str
  username: str | None = None
  email: EmailStr | None = None
  gender: Gender | None = None
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
  
class ForgotPasswordRequest(BaseModel):
  phone: str

class ForgotPasswordResponse(BaseModel):
  message: str
  reset_token: str | None = None

class ResetPasswordRequest(BaseModel):
  token: str
  new_password: str = Field(..., min_length=6)