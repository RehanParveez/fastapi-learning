import enum
from sqlalchemy import Enum, Column, Integer, ForeignKey, String, DateTime, UniqueConstraint
from app.db.session import Base
from sqlalchemy.sql import func

class RatingReferenceType(str, enum.Enum):
  crop_advance = "crop_advance"
  contract_allocation = "contract_allocation"
  consumer_order = "consumer_order"

class Rating(Base):
  __tablename__ = "ratings"

  id = Column(Integer, primary_key=True, index=True)
  rater_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  ratee_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  reference_type = Column(Enum(RatingReferenceType), nullable=False)
  reference_id = Column(Integer, nullable=False)
  score = Column(Integer, nullable=False)
  comment = Column(String, nullable=True)
  created_at = Column(DateTime(timezone=True), server_default=func.now())

  __table_args__ = (UniqueConstraint("rater_id", "ratee_id", "reference_type", "reference_id", name = "uq_one_rating_per_rater_per_transaction"),)