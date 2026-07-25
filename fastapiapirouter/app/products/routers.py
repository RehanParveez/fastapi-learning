from fastapi import APIRouter

router = APIRouter()

@router.get("/product")
async def oneproduct():
  return {"msg": "single product is done"}

@router.get("/products")
async def allproducts():
  return {"msg": "all product is done"}