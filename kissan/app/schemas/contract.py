from pydantic import BaseModel, ConfigDict
from app.models.contract import ContractDemandStatus, AllocationStatus, QualityGrade, SourceType
from datetime import datetime

class ContractDemandCreate(BaseModel):
  crop_type: str
  quantity_needed: float
  price_offered: float
  quality_specs: str | None = None
  delivery_window_start: datetime | None = None
  delivery_window_end: datetime | None = None

class ContractDemandOut(ContractDemandCreate):
  id: int
  factory_id: int
  status: ContractDemandStatus
  quantity_allocated: float
  created_at: datetime

  model_config = ConfigDict(from_attributes=True)

class ContractAllocationCreate(BaseModel):
  requested_qty: float

class ContractAllocationOut(BaseModel):
  id: int
  demand_id: int
  farmer_id: int
  requested_qty: float
  allocated_qty: float | None
  status: AllocationStatus
  created_at: datetime

  model_config = ConfigDict(from_attributes=True)

class AllocationDecision(BaseModel):
  approve: bool
  allocated_qty: float | None = None

class DeliveryCreate(BaseModel):
  delivered_qty: float
  quality_grade: QualityGrade

class DeliveryOut(BaseModel):
  id: int
  source_type: SourceType
  source_id: int
  delivered_qty: float
  quality_grade: QualityGrade
  price_adjustment_percent: float
  recorded_by: int
  created_at: datetime

  model_config = ConfigDict(from_attributes=True)

class DeliveryResult(BaseModel):
  delivery: DeliveryOut
  payment_amount: float
  allocation_status: AllocationStatus