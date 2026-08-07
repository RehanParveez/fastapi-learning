from fastapi import APIRouter, Depends
from app.schemas.advance import CropAdvanceOut, CropAdvanceOffer
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.services import advance_service, settlement_service
from app.db.session import get_db
from app.deps import require_role, get_current_user
from app.repositories import advance_repository
from app.schemas.advance import AdvanceSettleResult, AdvanceSettleRequest, AdvanceRepayRequest, SettlementPreviewRequest, SettlementPreviewOut

router = APIRouter(prefix="/advances", tags=["advances"])

@router.post("/offer", response_model=CropAdvanceOut, status_code=201)
def offer_advance(offer_in: CropAdvanceOffer, db: Session = Depends(get_db), broker: User = Depends(require_role(UserRole.broker))):
  return advance_service.offer_advance(db, broker, offer_in)

@router.post("/{advance_id}/accept", response_model=CropAdvanceOut)
def accept_advance(advance_id: int, db: Session = Depends(get_db),
  farmer: User = Depends(require_role(UserRole.farmer))):
  return advance_service.accept_advance(db, farmer, advance_id)

@router.post("/{advance_id}/disburse", response_model=CropAdvanceOut)
def disburse_advance(advance_id: int, db: Session = Depends(get_db),
  broker: User = Depends(require_role(UserRole.broker))):
  return advance_service.disburse_advance(db, broker, advance_id)

@router.get("", response_model=list[CropAdvanceOut])
def list_my_advances(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
  if current_user.role == UserRole.farmer:
    return advance_repository.list_advances(db, farmer_id=current_user.id)
  if current_user.role == UserRole.broker:
    return advance_repository.list_advances(db, broker_id=current_user.id)
  return advance_repository.list_advances(db)

@router.post("/{advance_id}/settle", response_model=AdvanceSettleResult)
def settle_advance(advance_id: int, settle_in: AdvanceSettleRequest,
  db: Session = Depends(get_db), broker: User = Depends(require_role(UserRole.broker))):
  return settlement_service.settle_consignment_sale(db, broker, advance_id, settle_in.sale_amount)

@router.post("/{advance_id}/preview-settlement", response_model=SettlementPreviewOut)
def preview_settlement(advance_id: int, preview_in: SettlementPreviewRequest,
  db: Session = Depends(get_db), broker: User = Depends(require_role(UserRole.broker))):
  return settlement_service.preview_settlement(db, broker, advance_id, preview_in.sale_amount)

@router.post("/{advance_id}/repay", response_model=CropAdvanceOut)
def repay_advance(advance_id: int, repay_in: AdvanceRepayRequest,
  db: Session = Depends(get_db), broker: User = Depends(require_role(UserRole.broker))):
  return settlement_service.repay_unconditional_credit(db, broker, advance_id, repay_in.amount)