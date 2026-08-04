from sqlalchemy.orm import Session
from app.models.input_order import InputOrder, InputOrderItem, InputPaymentMode, InputOrderStatus

def create_order(db: Session, *, farmer_id: int, shopkeeper_id: int, payment_mode, credit_markup_percent) -> InputOrder:
  order = InputOrder(farmer_id=farmer_id, shopkeeper_id=shopkeeper_id, payment_mode=payment_mode, credit_markup_percent=credit_markup_percent,
    total_amount=0, outstanding_balance=0)
  db.add(order)
  db.flush()
  return order

def add_order_item(db: Session, *, order_id: int, product_id: int, qty: float, unit_price: float) -> InputOrderItem:
  item = InputOrderItem(order_id=order_id, product_id=product_id, qty=qty, unit_price=unit_price, subtotal=round(qty * unit_price, 2))
  db.add(item)
  db.flush()
  return item

def get_order_by_id(db: Session, order_id: int) -> InputOrder | None:
  return db.query(InputOrder).filter(InputOrder.id == order_id).first()

def list_orders(db: Session, *, farmer_id: int | None = None, shopkeeper_id: int | None = None):
  query = db.query(InputOrder)
  if farmer_id:
    query = query.filter(InputOrder.farmer_id == farmer_id)
  if shopkeeper_id:
    query = query.filter(InputOrder.shopkeeper_id == shopkeeper_id)
  return query.order_by(InputOrder.created_at.desc()).all()

def open_input_credits(db: Session, farmer_id: int):
  return db.query(InputOrder).filter(InputOrder.farmer_id == farmer_id, InputOrder.payment_mode == InputPaymentMode.credit,
    InputOrder.status == InputOrderStatus.placed,).all()

def save_order(db: Session, order: InputOrder) -> InputOrder:
  db.commit()
  db.refresh(order)
  return order