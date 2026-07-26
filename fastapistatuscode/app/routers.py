from fastapi import APIRouter, Depends, status
from app.schemas import Address, Profile, UserCreate, UserRead, OrderCreate, OrderRead
from app.deps import get_token

router = APIRouter()

@router.post('/address', status_code=status.HTTP_201_CREATED)
async def create_address(address: Address):
  return {"msg": "Address Created", "address": address}

@router.post('/profile', status_code=status.HTTP_201_CREATED)
async def create_profile(profile: Profile):
  return {"msg": "Profile Created", "address": profile}

@router.post('/user', status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
  return {"msg": "User Created", "user": user}

@router.get('/user/{user_id}', response_model=UserRead)
async def get_user(user_id: int):
  return {
    "id": user_id, "username": "parveez", "email": "parveez@gmail.com",
    "profile": {
      "full name": "Sajid Parveez", "age": "56",
      "address": {"city": "Bahawalpur", "country": "Pakistan", "zip_code": "63100"
      }
    }
  }
  
@router.post("/order", status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate):
  total = sum(item.quantity * item.price for item in order.items)
  return {"msg": "Order Created", "total": total, "order": order}

@router.get("/order/{order_id}", response_model=OrderRead)
async def get_order(order_id: int):
  return {
    "order_id": order_id, "user_id": 1,
    "items": [
      {"product_name": "Mouse", "quantity": 2, "price": 1200.0}
    ],
      "total": 2400.0
    }

@router.get("/profile-token")
async def profile_token(token: str = Depends(get_token)):
  return {"msg": f"Token is {token}"}