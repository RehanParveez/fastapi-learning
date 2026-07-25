from fastapi import APIRouter

router = APIRouter()

@router.get("/register")
async def register():
  return {"msg": "registeration is done"}

@router.get("/login")
async def login():
  return {"msg": "Login is done"}

@router.get("/password-reset")
async def passwordreset():
  return {"msg": "Password Reset is done"}