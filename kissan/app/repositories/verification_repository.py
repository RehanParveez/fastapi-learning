from sqlalchemy.orm import Session
from app.models.verification import VerificationDocument, VerificationStatus

def create_document(db: Session, *, user_id: int, doc_type, file_path: str) -> VerificationDocument:
  doc = VerificationDocument(user_id=user_id, doc_type=doc_type, file_path=file_path)
  db.add(doc)
  db.commit()
  db.refresh(doc)
  return doc

def get_document_by_id(db: Session, doc_id: int) -> VerificationDocument | None:
  return db.query(VerificationDocument).filter(VerificationDocument.id == doc_id).first()

def list_documents(db: Session, status_filter: VerificationStatus | None = None) -> list[VerificationDocument]:
  query = db.query(VerificationDocument)
  if status_filter:
    query = query.filter(VerificationDocument.status == status_filter)
  return query.order_by(VerificationDocument.created_at.asc()).all()