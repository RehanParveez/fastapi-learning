import enum
from sqlalchemy import Enum, Column, Integer, ForeignKey, String, Float, DateTime
from app.db.session import Base
from sqlalchemy.sql import func

class AdvanceType(str, enum.Enum):
  unconditional_credit = "unconditional_credit"  
  crop_consignment = "crop_consignment"   

class PricingMode(str, enum.Enum):
  fixed = "fixed"
  market_minus_commission = "market_minus_commission"

class AdvanceStatus(str, enum.Enum):
  offered = "offered"
  accepted = "accepted"
  disbursed = "disbursed"
  repaying = "repaying"
  settled = "settled"
  extended = "extended"

class CropAdvance(Base):
  __tablename__ = "crop_advances"

  id = Column(Integer, primary_key=True, index=True)
  farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  broker_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  advance_type = Column(Enum(AdvanceType), nullable=False)
  advance_amount = Column(Float, nullable=False)
  interest_rate = Column(Float, nullable=True)
  crop_type = Column(String, nullable=True)
  expected_qty = Column(Float, nullable=True)
  commission_rate = Column(Float, nullable=True)
  pricing_mode = Column(Enum(PricingMode), nullable=True)
  status = Column(Enum(AdvanceStatus), nullable=False, default=AdvanceStatus.offered)
  outstanding_balance = Column(Float, nullable=False, default=0)
  due_date = Column(DateTime(timezone=True), nullable=True)
  created_at = Column(DateTime(timezone=True), server_default=func.now())