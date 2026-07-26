from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Address(BaseModel):
  city: str
  country: str

class Profile(BaseModel):
  full_name: str
  age: int
  address: Address
  
class UserCreate(BaseModel):
  username: str
  email: EmailStr
  password: str
  profile: Profile
  
class UserRead(BaseModel):
  id: int
  username: str
  email: EmailStr
  profile: Profile
  
class OrderItem(BaseModel):
  product_name: str
  quantity: int
  price: float
  
class OrderCreate(BaseModel):
  user_id: int
  items: List[OrderItem]
  
class OrderRead(BaseModel):
  order_id: int
  user_id: int
  items: List[OrderItem]
  total: float
  