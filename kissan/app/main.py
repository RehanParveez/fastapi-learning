import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.models.user import User, FarmerProfile, ShopkeeperProfile, BrokerProfile, FactoryProfile
from app.core.security import hash_password, verify_password, create_access_token
from app.routers import auth, profiles, verification, inputs,  input_orders, advances, record, contracts, listings, ratings, websocket as ws_router, admin
from app.websocket.manager import manager
from app.background.scheduler import start_scheduler, shutdown_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
  manager.set_loop(asyncio.get_running_loop())
  start_scheduler()
  yield
  shutdown_scheduler()

app = FastAPI(title = "Kisan API")

app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(verification.router)
app.include_router(inputs.router)
app.include_router(input_orders.router)
app.include_router(advances.router)
app.include_router(record.router)
app.include_router(contracts.router)
app.include_router(listings.router)
app.include_router(ratings.router)
app.include_router(ws_router.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
  return {"message": "Kisan API is running"}