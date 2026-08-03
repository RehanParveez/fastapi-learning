from sqlalchemy.orm import Session
from app.models.input import InputProduct

def create_product(db: Session, *, shopkeeper_id: int, name: str, category, unit_price: float, stock_qty: float) -> InputProduct:
  product = InputProduct(shopkeeper_id=shopkeeper_id, name=name, category=category, unit_price=unit_price, stock_qty=stock_qty)
  db.add(product)
  db.commit()
  db.refresh(product)
  return product

def get_product_by_id(db: Session, product_id: int) -> InputProduct | None:
  return db.query(InputProduct).filter(InputProduct.id == product_id).first()

def list_products(db: Session, shopkeeper_id: int | None = None) -> list[InputProduct]:
  query = db.query(InputProduct)
  if shopkeeper_id:
    query = query.filter(InputProduct.shopkeeper_id == shopkeeper_id)
  return query.order_by(InputProduct.created_at.desc()).all()

def update_product(db: Session, product: InputProduct, **fields) -> InputProduct:
  for key, value in fields.items():
    if value is not None:
      setattr(product, key, value)
  db.commit()
  db.refresh(product)
  return product