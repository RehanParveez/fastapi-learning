import enum
from sqlalchemy import Enum, Column, Integer, ForeignKey, Float, DateTime
from app.db.session import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

class InputPaymentMode(str, enum.Enum):
  cash = "cash"
  credit = "credit"

class InputOrderStatus(str, enum.Enum):
  placed = "placed"
  settled = "settled"

class InputOrder(Base):
  __tablename__ = "input_orders"

  id = Column(Integer, primary_key=True, index=True)
  farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  shopkeeper_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  payment_mode = Column(Enum(InputPaymentMode), nullable=False)
  credit_markup_percent = Column(Float, nullable=True)  
  total_amount = Column(Float, nullable=False, default=0)
  outstanding_balance = Column(Float, nullable=False, default=0)
  status = Column(Enum(InputOrderStatus), nullable=False, default=InputOrderStatus.placed)
  created_at = Column(DateTime(timezone=True), server_default=func.now())

  items = relationship("InputOrderItem", back_populates = "order", cascade = "all, delete-orphan")

class InputOrderItem(Base):
  __tablename__ = "input_order_items"

  id = Column(Integer, primary_key=True, index=True)
  order_id = Column(Integer, ForeignKey("input_orders.id"), nullable=False, index=True)
  product_id = Column(Integer, ForeignKey("input_products.id"), nullable=False, index=True)
  qty = Column(Float, nullable=False)
  unit_price = Column(Float, nullable=False)
  subtotal = Column(Float, nullable=False)

  order = relationship("InputOrder", back_populates = "items")