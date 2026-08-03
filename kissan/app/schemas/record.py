from pydantic import BaseModel

class FarmerBalanceOut(BaseModel):
  farmer_id: int
  balance: float