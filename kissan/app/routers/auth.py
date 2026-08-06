from fastapi import APIRouter, Depends
from app.db.session import get_db
from app.schemas.user import UserOut, Token, UserCreate, ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.services import auth_service
from app.core.security import create_access_token
from app.models.user import User
from app.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
  return auth_service.register_user(db, user_in)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
  user = auth_service.authenticate_user(db, form_data.username, form_data.password)
  access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
  return Token(access_token=access_token)

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
  return current_user

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
  user, token = auth_service.forgot_password(db, body.phone)
  return ForgotPasswordResponse(message = "The password reset link generated successfully", reset_token=token)

@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
  auth_service.reset_password(db, body.token, body.new_password)
  return {"message": "Password has been reset successfully. Please login with your new password."}