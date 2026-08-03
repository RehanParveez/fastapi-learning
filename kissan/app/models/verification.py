import enum
from sqlalchemy import Enum, Column, Integer, ForeignKey, String,  DateTime
from app.db.session import Base
from sqlalchemy.sql import func

class DocumentType(str, enum.Enum):
  cnic = "cnic"
  land_record = "land_record"
  business_reg = "business_reg"

class VerificationStatus(str, enum.Enum):
  pending = "pending"
  approved = "approved"
  rejected = "rejected"

class VerificationDocument(Base):
  __tablename__ = "verification_documents"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
  doc_type = Column(Enum(DocumentType), nullable=False)
  file_path = Column(String, nullable=False)
  status = Column(Enum(VerificationStatus), nullable=False, default=VerificationStatus.pending)
  reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
  reviewed_at = Column(DateTime(timezone=True), nullable=True)
  created_at = Column(DateTime(timezone=True), server_default=func.now())