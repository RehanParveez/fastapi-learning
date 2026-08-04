from fastapi import APIRouter, Depends
from app.schemas.input_order import InputOrderOut, InputOrderCreate, InputCreditRepayRequest
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserRole
from app.services import input_order_service
from app.deps import get_current_user, require_role
from app.repositories import input_order_repository

router = APIRouter(prefix = "/input-orders", tags=["input-orders"])

@router.post("", response_model=InputOrderOut, status_code=201)
def place_order(order_in: InputOrderCreate, db: Session = Depends(get_db), farmer: User = Depends(require_role(UserRole.farmer))):
  return input_order_service.place_order(db, farmer, order_in)

@router.post("/{order_id}/repay", response_model=InputOrderOut)
def repay_credit(order_id: int, repay_in: InputCreditRepayRequest, db: Session = Depends(get_db),
  shopkeeper: User = Depends(require_role(UserRole.shopkeeper))):
  return input_order_service.repay_input_credit(db, shopkeeper, order_id, repay_in.amount)

@router.get("/mine", response_model=list[InputOrderOut])
def my_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
  if current_user.role == UserRole.farmer:
    return input_order_repository.list_orders(db, farmer_id=current_user.id)
  if current_user.role == UserRole.shopkeeper:
    return input_order_repository.list_orders(db, shopkeeper_id=current_user.id)
  return []