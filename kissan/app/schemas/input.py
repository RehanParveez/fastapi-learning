from pydantic import BaseModel, ConfigDict
from app.models.input import InputCategory

class InputProductCreate(BaseModel):
  name: str
  category: InputCategory
  unit_price: float
  stock_qty: float = 0

class InputProductUpdate(BaseModel):
  unit_price: float | None = None
  stock_qty: float | None = None

class InputProductOut(InputProductCreate):
  id: int
  shopkeeper_id: int
  model_config = ConfigDict(from_attributes=True)