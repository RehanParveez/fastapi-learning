from fastapi import APIRouter, Depends, status, HTTPException, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.schemas import UserRead, UserCreate, Token
from app.security import verify_password
from app.auth import create_access_token
from app.deps import get_db
from app.db import crud
from app.background import send_welcome_email, notify_admin_new_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserRead)
def register(user: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user.email):
      raise HTTPException(status_code=400, detail = "email is alr registered")
    
    db_user = crud.create_user(db, user.username, user.email, user.password, user.role)
    background_tasks.add_task(send_welcome_email, email=db_user.email, username=db_user.username)
    background_tasks.add_task(notify_admin_new_user, username=db_user.username)
    return db_user

@router.post("/login", response_model=Token)
def login(
   form_data: OAuth2PasswordRequestForm = Depends(), 
   db: Session = Depends(get_db)
):
  db_user = crud.get_user_by_email(db, form_data.username)
  if not db_user or not verify_password(form_data.password, db_user.hashed_password):
    raise HTTPException(status_code=401, detail = "wrong credentials")

  token = create_access_token(data={"sub": db_user.email, "role": db_user.role})
  return {"access_token": token, "token_type": "bearer"}