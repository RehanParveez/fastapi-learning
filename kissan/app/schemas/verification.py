from pydantic import BaseModel, ConfigDict
from app.models.verification import DocumentType, VerificationStatus
from datetime import datetime

class VerificationDocumentCreate(BaseModel):
  doc_type: DocumentType
  file_path: str

class VerificationDocumentOut(BaseModel):
  id: int
  user_id: int
  doc_type: DocumentType
  file_path: str
  status: VerificationStatus
  reviewed_by: int | None
  reviewed_at: datetime | None
  created_at: datetime

  model_config = ConfigDict(from_attributes=True)

class VerificationReview(BaseModel):
  status: VerificationStatus