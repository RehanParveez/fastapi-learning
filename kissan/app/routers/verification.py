from fastapi import APIRouter, Depends
from app.schemas.verification import VerificationDocumentOut, VerificationDocumentCreate,  VerificationReview
from app.db.session import get_db
from sqlalchemy.orm import Session
from app.deps import get_current_user, require_role
from app.models.user import User, UserRole
from app.repositories import verification_repository
from app.services import verification_service
from app.models.verification import VerificationStatus

router = APIRouter(prefix = "/verification", tags=["verification"])

@router.post("/documents", response_model=VerificationDocumentOut, status_code=201)
def submit_document(doc_in: VerificationDocumentCreate, db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user)):
  return verification_service.submit_document(db, current_user, doc_in)

@router.get("/documents", response_model=list[VerificationDocumentOut])
def list_documents(status_filter: VerificationStatus | None = None, db: Session = Depends(get_db),
  admin: User = Depends(require_role(UserRole.admin))):
  return verification_repository.list_documents(db, status_filter)

@router.patch("/documents/{doc_id}", response_model=VerificationDocumentOut)
def review_document(doc_id: int, review_in: VerificationReview, db: Session = Depends(get_db),
  admin: User = Depends(require_role(UserRole.admin))):
    return verification_service.review_document(db, admin, doc_id, review_in.status)