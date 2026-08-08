from fastapi import APIRouter, Depends
from app.schemas.record import FarmerBalanceOut, RecordEntryOut
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.deps import require_role
from app.models.user import User, UserRole
from app.services import settlement_service
from app.repositories import record_repository

router = APIRouter(prefix = "/record", tags=["record"])

@router.get("/me/balance", response_model=FarmerBalanceOut)
def read_my_balance(db: Session = Depends(get_db), farmer: User = Depends(require_role(UserRole.farmer))):
  balance = settlement_service.farmer_balance(db, farmer.id)
  return FarmerBalanceOut(farmer_id=farmer.id, balance=balance)

@router.get("/me/entries", response_model=list[RecordEntryOut])
def read_my_entries(db: Session = Depends(get_db), farmer: User = Depends(require_role(UserRole.farmer))):
  return record_repository.list_entries(db, farmer.id)