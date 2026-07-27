from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.schemas import UserRead, UserCreate, UserLogin, Token
from app.security import verify_password
from app.auth import create_access_token
from app.deps import get_db
from app.db import crud

router = APIRouter(prefix="/auth", tags=["auth"])

fake_users_db = []

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserRead)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user.email):
      raise HTTPException(status_code=400, detail = "email is alr registered")
    
    db_user = crud.create_user(db, user.username, user.email, user.password, user.role)
    return db_user

@router.post("/login", response_model=Token)
async def login(user: UserLogin, db: Session = Depends(get_db)):
  db_user = crud.get_user_by_email(db, user.email)
  if not db_user or not verify_password(user.password, db_user.hashed_password):
    raise HTTPException(status_code=401, detail = "wrong credentials")

  token = create_access_token(data={"sub": db_user.email, "role": db_user.role})
  return {"access_token": token, "token_type": "bearer"}