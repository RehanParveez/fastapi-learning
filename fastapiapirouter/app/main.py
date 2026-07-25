from fastapi import FastAPI
from app.accounts.routers import router as account_routers
from app.products.routers import router as products_routers
app = FastAPI()

@app.get("/")
async def greetings():
  return {"msg": "hello halan"}

app.include_router(account_routers)
app.include_router(products_routers)

