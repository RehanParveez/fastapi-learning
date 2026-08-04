from sqlalchemy.orm import Session
from app.repositories import record_repository, advance_repository, input_order_repository
from app.models.record import RecordDirection, RecordEntryType
from app.models.user import User
from fastapi import HTTPException, status
from app.models.advance import AdvanceType, AdvanceStatus
from app.models.input_order import InputOrderStatus

def farmer_balance(db: Session, farmer_id: int) -> float:
  entries = record_repository.list_entries(db, farmer_id)
  total = 0.0
  for entry in entries:
    total += entry.amount if entry.direction == RecordDirection.credit else -entry.amount
  return total

def settle_consignment_sale(db: Session, broker: User, advance_id: int, sale_amount: float) -> dict:
  advance = advance_repository.get_advance_by_id(db, advance_id)
  if not advance:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "advance is not present")
  if advance.broker_id != broker.id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "you did not offer this advance")
  if advance.advance_type != AdvanceType.crop_consignment:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
      detail = "only crop_consignment advances settle from a sale — unconditional_credit is repaid directly")
  if advance.status not in (AdvanceStatus.disbursed, AdvanceStatus.repaying):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
      detail = f"cant settle an advance in '{advance.status.value}' status")

  remaining = sale_amount

  commission = round(sale_amount * advance.commission_rate, 2)
  record_repository.add_entry(db, farmer_id=advance.farmer_id, entry_type=RecordEntryType.broker_commission,
    direction=RecordDirection.debit, amount=commission, reference_type = "crop_advance", reference_id=advance.id)
  remaining -= commission

  principal_take = min(remaining, advance.outstanding_balance)
  record_repository.add_entry(db, farmer_id=advance.farmer_id, entry_type=RecordEntryType.advance_repayment,
      direction=RecordDirection.debit, amount=principal_take, reference_type = "crop_advance", reference_id=advance.id)
  advance.outstanding_balance -= principal_take
  remaining -= principal_take
  advance.status = AdvanceStatus.settled if advance.outstanding_balance <= 0 else AdvanceStatus.repaying

  for credit in input_order_repository.open_input_credits(db, advance.farmer_id):
    take = min(remaining, credit.outstanding_balance)
    if take <= 0:
      continue
    record_repository.add_entry(db, farmer_id=advance.farmer_id, entry_type=RecordEntryType.credit_repayment,
      direction=RecordDirection.debit, amount=take, reference_type = "input_order", reference_id=credit.id)
    credit.outstanding_balance -= take
    if credit.outstanding_balance == 0:
      credit.status = InputOrderStatus.settled
    remaining -= take

  record_repository.add_entry(db, farmer_id=advance.farmer_id, entry_type=RecordEntryType.net_payment, direction=RecordDirection.credit, 
    amount=remaining, reference_type = "crop_advance", reference_id=advance.id)
  advance_repository.save(db, advance)

  return {"commission": commission, "advance_repaid": principal_take, "net_to_farmer": remaining, "advance_status": advance.status}

def repay_unconditional_credit(db: Session, broker: User, advance_id: int, amount: float):
  advance = advance_repository.get_advance_by_id(db, advance_id)
  if not advance:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "advance is not present")
  if advance.broker_id != broker.id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "you did not offer this advance")
  if advance.advance_type != AdvanceType.unconditional_credit:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
      detail = "only unconditional_credit advances are repaid this way")
  if advance.status not in (AdvanceStatus.disbursed, AdvanceStatus.repaying):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
      detail = f"cant repay an advance in '{advance.status.value}' status")
  if amount <= 0:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "repayment amount must be positive")

  record_repository.add_entry(db, farmer_id=advance.farmer_id, entry_type=RecordEntryType.credit_repayment,
    direction=RecordDirection.debit, amount=amount, reference_type = "crop_advance", reference_id=advance.id)

  advance.outstanding_balance = max(0.0, advance.outstanding_balance - amount)
  advance.status = AdvanceStatus.settled if advance.outstanding_balance == 0 else AdvanceStatus.repaying
  return advance_repository.save(db, advance)