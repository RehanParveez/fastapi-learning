from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.advance import AdvanceType, PricingMode, AdvanceStatus

class CropAdvanceOffer(BaseModel):
  farmer_id: int
  advance_type: AdvanceType
  advance_amount: float
  due_date: datetime | None = None

  crop_type: str | None = None
  expected_qty: float | None = None
  commission_rate: float | None = None
  pricing_mode: PricingMode | None = None

  interest_rate: float | None = None

class CropAdvanceOut(BaseModel):
  id: int
  farmer_id: int
  broker_id: int
  advance_type: AdvanceType
  advance_amount: float
  interest_rate: float | None
  crop_type: str | None
  expected_qty: float | None
  commission_rate: float | None
  pricing_mode: PricingMode | None
  status: AdvanceStatus
  outstanding_balance: float
  due_date: datetime | None
  created_at: datetime
  
  model_config = ConfigDict(from_attributes=True)

class AdvanceSettleRequest(BaseModel):
  sale_amount: float

class AdvanceSettleResult(BaseModel):
  commission: float
  advance_repaid: float
  net_to_farmer: float
  advance_status: AdvanceStatus

class AdvanceRepayRequest(BaseModel):
  amount: float
  
class InputCreditDeductionPreview(BaseModel):
  order_id: int
  shopkeeper_id: int
  total_amount: float
  outstanding_balance: float
  deducted: float
  remaining_after: float

class SettlementPreviewRequest(BaseModel):
  sale_amount: float

class SettlementPreviewOut(BaseModel):
  sale_amount: float
  commission_rate: float
  commission_amount: float
  advance_repayment: float
  advance_remaining_balance: float
  advance_status_after: AdvanceStatus
  input_credit_deductions: list[InputCreditDeductionPreview]
  total_input_credit_deducted: float
  net_to_farmer: float