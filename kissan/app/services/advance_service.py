from app.schemas.advance import CropAdvanceOffer
from sqlalchemy.orm import Session
from app.models.user import User
from fastapi import HTTPException, status
from app.models.advance import AdvanceStatus, AdvanceType
from app.models.record import RecordEntryType, RecordDirection
from app.repositories import advance_repository, record_repository
from app.notifications.service import notify_user

def _validate_offer(offer_in: CropAdvanceOffer) -> None:
  if offer_in.advance_type == AdvanceType.crop_consignment:
    missing = [f for f in ("crop_type", "expected_qty", "commission_rate", "pricing_mode")
      if getattr(offer_in, f) is None]
    if missing:
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
        detail = f"crop_consignment advances require: {', '.join(missing)}")
  else:
    if offer_in.interest_rate is None:
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
        detail = "unconditional_credit advances require interest_rate")

def offer_advance(db: Session, broker: User, offer_in: CropAdvanceOffer):
  _validate_offer(offer_in)
  return advance_repository.create_advance(db, broker_id=broker.id, farmer_id=offer_in.farmer_id, advance_type=offer_in.advance_type, 
    crop_type=offer_in.crop_type, expected_qty=offer_in.expected_qty, advance_amount=offer_in.advance_amount, interest_rate=offer_in.interest_rate,
    commission_rate=offer_in.commission_rate, pricing_mode=offer_in.pricing_mode, due_date=offer_in.due_date)

def accept_advance(db: Session, farmer: User, advance_id: int):
  advance = advance_repository.get_advance_by_id(db, advance_id)
  if not advance:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "advance is not present")
  if advance.farmer_id != farmer.id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "this advance was not offered to you")
  if advance.status != AdvanceStatus.offered:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = f"cant accept an advance in '{advance.status.value}' status")
  advance.status = AdvanceStatus.accepted
  return advance_repository.save(db, advance)

def disburse_advance(db: Session, broker: User, advance_id: int):
  advance = advance_repository.get_advance_by_id(db, advance_id)
  if not advance:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "advance is not present")
  if advance.broker_id != broker.id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "you did not offer this advance")
  if advance.status != AdvanceStatus.accepted:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
      detail = f"cant disburse an advance in '{advance.status.value}' status")

  advance.status = AdvanceStatus.disbursed
  if advance.advance_type == AdvanceType.unconditional_credit:
    advance.outstanding_balance = advance.advance_amount * (1 + advance.interest_rate)
  else:
    advance.outstanding_balance = advance.advance_amount 

  record_repository.add_entry(db, farmer_id=advance.farmer_id, entry_type=RecordEntryType.crop_advance,
    direction=RecordDirection.credit, amount=advance.advance_amount, reference_type = "crop_advance", reference_id=advance.id)

  result = advance_repository.save(db, advance)
  notify_user(db, advance.farmer_id, "advance_disbursed", {"advance_id": advance.id, "amount": advance.advance_amount})
  return result