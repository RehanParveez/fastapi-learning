import enum
from sqlalchemy import Enum, Column, Integer, ForeignKey, String, Float, DateTime
from app.db.session import Base
from sqlalchemy.sql import func

class ContractDemandStatus(str, enum.Enum):
  open = "open"
  fulfilled = "fulfilled"
  cancelled = "cancelled"

class ContractDemand(Base):
  __tablename__ = "contract_demands"

  id = Column(Integer, primary_key=True, index=True)
  factory_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  crop_type = Column(String, nullable=False)
  quantity_needed = Column(Float, nullable=False)
  price_offered = Column(Float, nullable=False)
  quality_specs = Column(String, nullable=True)
  delivery_window_start = Column(DateTime(timezone=True), nullable=True)
  delivery_window_end = Column(DateTime(timezone=True), nullable=True)
  status = Column(Enum(ContractDemandStatus), nullable=False, default=ContractDemandStatus.open)
  created_at = Column(DateTime(timezone=True), server_default=func.now())

class AllocationStatus(str, enum.Enum):
  requested = "requested"
  approved = "approved"
  rejected = "rejected"
  delivered = "delivered"

class ContractAllocation(Base):
  __tablename__ = "contract_allocations"

  id = Column(Integer, primary_key=True, index=True)
  demand_id = Column(Integer, ForeignKey("contract_demands.id"), nullable=False, index=True)
  farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  requested_qty = Column(Float, nullable=False)
  allocated_qty = Column(Float, nullable=True)
  status = Column(Enum(AllocationStatus), nullable=False, default=AllocationStatus.requested)
  created_at = Column(DateTime(timezone=True), server_default=func.now())

class QualityGrade(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"

class SourceType(str, enum.Enum):
  contract = "contract"
  listing = "listing"

class Delivery(Base):
  __tablename__ = "deliveries"

  id = Column(Integer, primary_key=True, index=True)
  source_type = Column(Enum(SourceType), nullable=False)
  source_id = Column(Integer, nullable=False)
  delivered_qty = Column(Float, nullable=False)
  quality_grade = Column(Enum(QualityGrade), nullable=False)
  price_adjustment_percent = Column(Float, nullable=False)
  recorded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
  created_at = Column(DateTime(timezone=True), server_default=func.now())