from pydantic import BaseModel, ConfigDict
from app.models.record import RecordEntryType, RecordDirection
from datetime import datetime

class FarmerBalanceOut(BaseModel):
  farmer_id: int
  balance: float
  
class RecordEntryOut(BaseModel):
  id: int
  farmer_id: int
  entry_type: RecordEntryType
  direction: RecordDirection
  amount: float
  reference_type: str | None
  reference_id: int | None
  created_at: datetime

  model_config = ConfigDict(from_attributes=True)