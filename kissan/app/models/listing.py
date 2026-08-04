import enum
from sqlalchemy import Enum, Column, Integer, ForeignKey, String, Float, Boolean, DateTime
from app.db.session import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class ListingQualityGrade(str, enum.Enum):
  A = "A"
  B = "B"
  C = "C"

class ListingStatus(str, enum.Enum):
  active = "active"
  sold_out = "sold_out"
  closed = "closed"

class CropListing(Base):
  __tablename__ = "crop_listings"

  id = Column(Integer, primary_key=True, index=True)
  farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  listed_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
  crop_type = Column(String, nullable=False)
  quantity = Column(Float, nullable=False)
  quality_grade = Column(Enum(ListingQualityGrade), nullable=False)
  price = Column(Float, nullable=False)
  retail_available = Column(Boolean, nullable=False, default=False)
  retail_unit_size = Column(Float, nullable=True)
  status = Column(Enum(ListingStatus), nullable=False, default=ListingStatus.active)
  created_at = Column(DateTime(timezone=True), server_default=func.now())

class ConsumerPaymentMode(str, enum.Enum):
  cash_on_delivery = "cash_on_delivery"

class ConsumerOrderStatus(str, enum.Enum):
  placed = "placed"
  delivered = "delivered"
  cancelled = "cancelled"

class ConsumerOrder(Base):
  __tablename__ = "consumer_orders"

  id = Column(Integer, primary_key=True, index=True)
  consumer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  payment_mode = Column(Enum(ConsumerPaymentMode), nullable=False, default=ConsumerPaymentMode.cash_on_delivery)
  status = Column(Enum(ConsumerOrderStatus), nullable=False, default=ConsumerOrderStatus.placed)
  total_amount = Column(Float, nullable=False, default=0)
  created_at = Column(DateTime(timezone=True), server_default=func.now())
  items = relationship("ConsumerOrderItem", back_populates = "order", cascade = "all, delete-orphan")

class ConsumerOrderItem(Base):
  __tablename__ = "consumer_order_items"

  id = Column(Integer, primary_key=True, index=True)
  order_id = Column(Integer, ForeignKey("consumer_orders.id"), nullable=False, index=True)
  listing_id = Column(Integer, ForeignKey("crop_listings.id"), nullable=False, index=True)
  qty = Column(Float, nullable=False)
  unit_price = Column(Float, nullable=False)
  subtotal = Column(Float, nullable=False)
  order = relationship("ConsumerOrder", back_populates = "items")