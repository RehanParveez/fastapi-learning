import enum
from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class InputCategory(str, enum.Enum):
  seed = "seed"
  fertilizer = "fertilizer"
  pesticide = "pesticide"
  equipment = "equipment"
  other = "other"

class InputProduct(Base):
  __tablename__ = "input_products"
  
  id = Column(Integer, primary_key=True, index=True)
  shopkeeper_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  name = Column(String, nullable=False)
  category = Column(Enum(InputCategory), nullable=False)
  unit_price = Column(Float, nullable=False)
  stock_qty = Column(Float, nullable=False, default=0)
  created_at = Column(DateTime(timezone=True), server_default=func.now())