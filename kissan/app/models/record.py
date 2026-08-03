import enum
from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class RecordDirection(str, enum.Enum):
  debit = "debit"
  credit = "credit"
  
class RecordEntryType(str, enum.Enum):
  input_credit = "input_credit"
  credit_repayment = "credit_repayment"
  crop_advance = "crop_advance"
  advance_repayment = "advance_repayment"
  broker_commission = "broker_commission"
  net_payment = "net_payment"
  
class RecordEntry(Base):
  __tablename__ = "record_entries"
  
  id = Column(Integer, primary_key=True, index=True)
  farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  entry_type = Column(Enum(RecordEntryType), nullable=False)
  direction = Column(Enum(RecordDirection), nullable=False)
  amount = Column(Float, nullable=False)
  reference_type = Column(String, nullable=True)
  reference_id = Column(Integer, nullable=True)
  created_at = Column(DateTime(timezone=True), server_default=func.now())
  