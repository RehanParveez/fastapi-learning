from fastapi import APIRouter, Depends
from app.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me")
async def read_me(current_user = Depends(get_current_user)):
  return {"msg": "Current user", "user": current_user}

@router.get("/admin-only")
async def admin_only(current_user = Depends(get_current_admin)):
  return {"msg": "Welcome admin", "user": current_user}