from fastapi import FastAPI
from app.models.user import User, FarmerProfile, ShopkeeperProfile, BrokerProfile, FactoryProfile
from app.core.security import hash_password, verify_password, create_access_token
from app.routers import auth, profiles, verification

app = FastAPI(title = "Kisan API")

app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(verification.router)

@app.get("/")
def read_root():
  return {"message": "Kisan API is running"}