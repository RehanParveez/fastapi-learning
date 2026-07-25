from fastapi import FastAPI, Depends
from app.deps import get_token

app = FastAPI()

@app.get("/")
async def home():
  return {"msg": "Welcome home"}

@app.get("/profile")
async def profile(token: str = Depends(get_token)):
  return {"msg": f"Welcome profile: {token}"}

@app.get("/order")
async def order(token: str = Depends(get_token)):
  return {"msg": f"Welcome order: {token}"}