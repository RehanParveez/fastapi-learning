from sqlalchemy.orm import Session
from app.models.user import User
from app.repositories import profile_repository
from fastapi import HTTPException, status

def create_my_profile(db: Session, current_user: User, **fields):
  existing = profile_repository.get_profile_by_user_id(db, current_user.role.value, current_user.id)
  if existing:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "a profile already exists for this account")
  return profile_repository.create_profile(db, current_user.role.value, current_user.id, **fields)

def get_my_profile(db: Session, current_user: User):
  profile = profile_repository.get_profile_by_user_id(db, current_user.role.value, current_user.id)
  if not profile:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "no profile is present for this account yet")
  return profile