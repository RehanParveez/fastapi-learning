from pydantic import BaseModel, ConfigDict
from app.models.listing import ListingQualityGrade, ListingStatus, ConsumerPaymentMode, ConsumerOrderStatus
from datetime import datetime

class CropListingCreate(BaseModel):
  farmer_id: int | None = None  
  crop_type: str
  quantity: float
  quality_grade: ListingQualityGrade
  price: float
  retail_available: bool = False
  retail_unit_size: float | None = None
  
class CropListingOut(BaseModel):
  id: int
  farmer_id: int
  listed_by_id: int
  crop_type: str
  quantity: float
  quality_grade: ListingQualityGrade
  price: float
  retail_available: bool
  retail_unit_size: float | None
  status: ListingStatus
  created_at: datetime

  model_config = ConfigDict(from_attributes=True)

class BulkPurchaseRequest(BaseModel):
  qty: float

class BulkPurchaseResult(BaseModel):
  listing: CropListingOut
  amount_paid: float

class ConsumerOrderItemCreate(BaseModel):
  listing_id: int
  qty: float

class ConsumerOrderCreate(BaseModel):
  items: list[ConsumerOrderItemCreate]
  
class ConsumerOrderItemOut(BaseModel):
  id: int
  listing_id: int
  qty: float
  unit_price: float
  subtotal: float

  model_config = ConfigDict(from_attributes=True)
  
class ConsumerOrderOut(BaseModel):
  id: int
  consumer_id: int
  payment_mode: ConsumerPaymentMode
  status: ConsumerOrderStatus
  total_amount: float
  created_at: datetime
  items: list[ConsumerOrderItemOut]

  model_config = ConfigDict(from_attributes=True)