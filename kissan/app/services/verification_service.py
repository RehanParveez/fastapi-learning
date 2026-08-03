from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.schemas.verification import VerificationDocumentCreate
from fastapi import HTTPException, status as http_status
from app.repositories import verification_repository, profile_repository, user_repository
from app.models.verification import VerificationStatus
from datetime import datetime, timezone

def submit_document(db: Session, current_user: User, doc_in: VerificationDocumentCreate):
  if current_user.role not in (UserRole.farmer, UserRole.shopkeeper, UserRole.broker, UserRole.factory):
    raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST,
      detail = "only the farmers, shopkeepers, brokers, and factories submit verification documents")
  return verification_repository.create_document(db, user_id=current_user.id, doc_type=doc_in.doc_type, file_path=doc_in.file_path)

def review_document(db: Session, reviewer: User, doc_id: int, new_status: VerificationStatus):
  if new_status == VerificationStatus.pending:
    raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail = "cannot set a document back to pending")

  doc = verification_repository.get_document_by_id(db, doc_id)
  if not doc:
    raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail = "document is not present")
  if doc.status != VerificationStatus.pending:
    raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail = "this document has already been reviewed")

  doc.status = new_status
  doc.reviewed_by = reviewer.id
  doc.reviewed_at = datetime.now(timezone.utc)
  db.commit()
  db.refresh(doc)

  if new_status == VerificationStatus.approved:
    owner = user_repository.get_user_by_id(db, doc.user_id)
    if owner:
      profile = profile_repository.get_profile_by_user_id(db, owner.role.value, owner.id)
      if profile:
        profile_repository.set_profile_verified(db, owner.role.value, profile.id, True)
  return doc