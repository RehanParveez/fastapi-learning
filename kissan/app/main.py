from fastapi import FastAPI
from app.models.user import User, FarmerProfile, ShopkeeperProfile, BrokerProfile, FactoryProfile
from app.core.security import hash_password, verify_password, create_access_token
from app.routers import auth, profiles, verification, inputs, advances, record, contracts

app = FastAPI(title = "Kisan API")

app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(verification.router)
app.include_router(inputs.router)
app.include_router(advances.router)
app.include_router(record.router)
app.include_router(contracts.router)

@app.get("/")
def read_root():
  return {"message": "Kisan API is running"}