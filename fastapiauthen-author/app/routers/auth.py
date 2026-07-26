from fastapi import APIRouter, status, HTTPException
from app.schemas import UserRead, UserCreate, UserLogin, Token
from app.security import hash_password, verify_password
from app.auth import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

fake_users_db = []

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserRead)
async def register(user: UserCreate):
  for existing in fake_users_db:
    if existing["email"] == user.email:
      raise HTTPException(status_code=400, detail = "email is alr registered")

  user_data = {
    "id": len(fake_users_db) + 1, "username": user.username, "email": user.email, "hashed_password": hash_password(user.password),
     "role": user.role, "is_active": True}
  fake_users_db.append(user_data)

  return {
    "id": user_data["id"], "username": user_data["username"], "email": user_data["email"], "role": user_data["role"],
      "is_active": user_data["is_active"]}

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
  found_user = None
  for item in fake_users_db:
    if item["email"] == user.email:
      found_user = item
      break

  if not found_user:
    raise HTTPException(status_code=401, detail = "wrong credentials")
  if not verify_password(user.password, found_user["hashed_password"]):
    raise HTTPException(status_code=401, detail = "wrong credentials")

  token = create_access_token(data={"sub": found_user["email"], "role": found_user["role"]})
  return {"access_token": token, "token_type": "bearer"}