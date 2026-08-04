from pydantic import BaseModel, ConfigDict
from app.models.input_order import InputPaymentMode, InputOrderStatus
from datetime import datetime

class InputOrderItemCreate(BaseModel):
  product_id: int
  qty: float

class InputOrderCreate(BaseModel):
  payment_mode: InputPaymentMode
  items: list[InputOrderItemCreate]
  credit_markup_percent: float | None = None 

class InputOrderItemOut(BaseModel):
  id: int
  product_id: int
  qty: float
  unit_price: float
  subtotal: float

  model_config = ConfigDict(from_attributes=True)

class InputOrderOut(BaseModel):
  id: int
  farmer_id: int
  shopkeeper_id: int
  payment_mode: InputPaymentMode
  credit_markup_percent: float | None
  total_amount: float
  outstanding_balance: float
  status: InputOrderStatus
  created_at: datetime
  items: list[InputOrderItemOut]

  model_config = ConfigDict(from_attributes=True)

class InputCreditRepayRequest(BaseModel):
  amount: float