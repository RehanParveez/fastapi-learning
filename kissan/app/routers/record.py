from fastapi import APIRouter, Depends
from app.schemas.record import FarmerBalanceOut
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.deps import require_role
from app.models.user import User, UserRole
from app.services import settlement_service

router = APIRouter(prefix = "/record", tags=["record"])

@router.get("/me/balance", response_model=FarmerBalanceOut)
def read_my_balance(db: Session = Depends(get_db), farmer: User = Depends(require_role(UserRole.farmer))):
  balance = settlement_service.farmer_balance(db, farmer.id)
  return FarmerBalanceOut(farmer_id=farmer.id, balance=balance)