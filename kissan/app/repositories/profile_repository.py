from app.models.user import FarmerProfile, ShopkeeperProfile, BrokerProfile, FactoryProfile
from sqlalchemy.orm import Session

_PROFILE_MODELS = {
  "farmer": FarmerProfile,
  "shopkeeper": ShopkeeperProfile,
  "broker": BrokerProfile,
  "factory": FactoryProfile
}

def get_profile_model(role_value: str):
  return _PROFILE_MODELS.get(role_value)

def get_profile_by_user_id(db: Session, role_value: str, user_id: int):
  model = get_profile_model(role_value)
  if model is None:
    return None
  return db.query(model).filter(model.user_id == user_id).first()

def create_profile(db: Session, role_value: str, user_id: int, **fields):
  model = get_profile_model(role_value)
  profile = model(user_id=user_id, **fields)
  db.add(profile)
  db.commit()
  db.refresh(profile)
  return profile

def set_profile_verified(db: Session, role_value: str, profile_id: int, verified: bool):
  model = get_profile_model(role_value)
  profile = db.query(model).filter(model.id == profile_id).first()
  if profile:
    profile.verified = verified
    db.commit()
    db.refresh(profile)
  return profile