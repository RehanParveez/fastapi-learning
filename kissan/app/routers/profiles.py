from fastapi import APIRouter, Depends, HTTPException
from app.schemas.profile import FarmerProfileCreate, FarmerProfileOut, BusinessProfileCreate, BusinessProfileOut
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.deps import require_role, get_current_user
from app.models.user import User, UserRole
from app.services import profile_service

router = APIRouter(prefix="/profiles", tags=["profiles"])

@router.post("/farmer", response_model=FarmerProfileOut, status_code=201)
def create_farmer_profile(profile_in: FarmerProfileCreate, db: Session = Depends(get_db),
  current_user: User = Depends(require_role(UserRole.farmer))):
  return profile_service.create_my_profile(db, current_user, **profile_in.model_dump())

@router.post("/shopkeeper", response_model=BusinessProfileOut, status_code=201)
def create_shopkeeper_profile(profile_in: BusinessProfileCreate, db: Session = Depends(get_db),
  current_user: User = Depends(require_role(UserRole.shopkeeper))):
    return profile_service.create_my_profile(db, current_user, **profile_in.model_dump())

@router.post("/broker", response_model=BusinessProfileOut, status_code=201)
def create_broker_profile(profile_in: BusinessProfileCreate, db: Session = Depends(get_db),
  current_user: User = Depends(require_role(UserRole.broker))):
    return profile_service.create_my_profile(db, current_user, **profile_in.model_dump())

@router.post("/factory", response_model=BusinessProfileOut, status_code=201)
def create_factory_profile(profile_in: BusinessProfileCreate, db: Session = Depends(get_db),
  current_user: User = Depends(require_role(UserRole.factory))):
    return profile_service.create_my_profile(db, current_user, **profile_in.model_dump())

@router.get("/me")
def read_my_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
  profile = profile_service.get_my_profile(db, current_user)
  schema = FarmerProfileOut if current_user.role == UserRole.farmer else BusinessProfileOut
  return schema.model_validate(profile).model_dump()

@router.patch("/me")
def update_my_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
  raise HTTPException(501, "Use PATCH /profiles/farmer or PATCH /profiles/business")

@router.patch("/farmer", response_model=FarmerProfileOut)
def update_farmer_profile(update_in: FarmerProfileCreate, db: Session = Depends(get_db), farmer: User = Depends(require_role(UserRole.farmer))
):
  return profile_service.update_my_profile(db, farmer, **update_in.model_dump(exclude_unset=True))

@router.patch("/shopkeeper", response_model=BusinessProfileOut)
def update_shopkeeper_profile(update_in: BusinessProfileCreate, db: Session = Depends(get_db), sk: User = Depends(require_role(UserRole.shopkeeper))
):
  return profile_service.update_my_profile(db, sk, **update_in.model_dump(exclude_unset=True))

@router.patch("/broker", response_model=BusinessProfileOut)
def update_broker_profile(update_in: BusinessProfileCreate, db: Session = Depends(get_db),
  br: User = Depends(require_role(UserRole.broker))
):
  return profile_service.update_my_profile(db, br, **update_in.model_dump(exclude_unset=True))

@router.patch("/factory", response_model=BusinessProfileOut)
def update_factory_profile(update_in: BusinessProfileCreate, db: Session = Depends(get_db),
  fac: User = Depends(require_role(UserRole.factory))
):
  return profile_service.update_my_profile(db, fac, **update_in.model_dump(exclude_unset=True))