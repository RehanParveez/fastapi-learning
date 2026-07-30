from fastapi import APIRouter, Depends
from app.deps import get_current_user, get_current_admin
from app.schemas import UserRead
from app.models import User

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserRead)
async def read_me(current_user: User = Depends(get_current_user)):
  return current_user

@router.get("/admin-only", response_model=UserRead)
async def admin_only(current_user: User = Depends(get_current_admin)):
  return current_user