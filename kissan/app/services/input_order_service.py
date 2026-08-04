from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.input_order import InputOrderCreate
from fastapi import HTTPException, status
from app.models.input_order import InputPaymentMode, InputOrderStatus
from app.repositories import input_repository, input_order_repository, record_repository
from app.models.record import RecordEntryType, RecordDirection

def place_order(db: Session, farmer: User, order_in: InputOrderCreate):
  if not order_in.items:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "order must include at least one item")
  if order_in.payment_mode == InputPaymentMode.credit and order_in.credit_markup_percent is None:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
      detail = "credit_markup_percent is required for credit orders")

  shopkeeper_id = None
  resolved = []
  for item_in in order_in.items:
    product = input_repository.get_product_by_id(db, item_in.product_id)
    if not product:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {item_in.product_id} not found")
    if shopkeeper_id is None:
      shopkeeper_id = product.shopkeeper_id
    elif product.shopkeeper_id != shopkeeper_id:
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
        detail = "all items in one order must come from the same shopkeeper")
    if item_in.qty <= 0:
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "quantity must be positive")
    if item_in.qty > product.stock_qty:
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Only {product.stock_qty} of '{product.name}' in stock")
    resolved.append((product, item_in.qty))

  order = input_order_repository.create_order(db, farmer_id=farmer.id, shopkeeper_id=shopkeeper_id, payment_mode=order_in.payment_mode,
    credit_markup_percent=order_in.credit_markup_percent)

  total = 0.0
  for product, qty in resolved:
      input_order_repository.add_order_item(db, order_id=order.id, product_id=product.id, qty=qty, unit_price=product.unit_price)
      product.stock_qty -= qty
      total += qty * product.unit_price

  order.total_amount = round(total, 2)

  if order_in.payment_mode == InputPaymentMode.credit:
    order.outstanding_balance = round(total * (1 + order_in.credit_markup_percent), 2)
    record_repository.add_entry(db, farmer_id=farmer.id, entry_type=RecordEntryType.input_credit, direction=RecordDirection.debit, amount=order.outstanding_balance,
      reference_type="input_order", reference_id=order.id)
  else:
    order.status = InputOrderStatus.settled   

  return input_order_repository.save_order(db, order)  

def repay_input_credit(db: Session, shopkeeper: User, order_id: int, amount: float):
  order = input_order_repository.get_order_by_id(db, order_id)
  if not order:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "order is not present")
  if order.shopkeeper_id != shopkeeper.id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "this is not your order")
  if order.payment_mode != InputPaymentMode.credit:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "this order was not placed on credit")
  if order.status == InputOrderStatus.settled:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "this order is already settled")
  if amount <= 0:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "repayment amount must be positive")

  record_repository.add_entry(db, farmer_id=order.farmer_id, entry_type=RecordEntryType.credit_repayment, direction=RecordDirection.debit,
    amount=amount, reference_type = "input_order", reference_id=order.id)
  order.outstanding_balance = max(0.0, order.outstanding_balance - amount)
  if order.outstanding_balance == 0:
    order.status = InputOrderStatus.settled

  return input_order_repository.save_order(db, order)