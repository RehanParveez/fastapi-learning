from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def home():
  return {"msg": "Welcome home"}

@app.get("/contact")
async def contct():
  return {"msg": "Welcome Contact"}
  