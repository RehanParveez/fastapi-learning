from fastapi import  HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.repositories import input_repository
from app.schemas.input import InputProductCreate, InputProductUpdate

def create_product(db: Session, shopkeeper: User, product_in: InputProductCreate) -> "InputProduct":
  return input_repository.create_product(db, shopkeeper_id=shopkeeper.id, name=product_in.name, category=product_in.category,
    unit_price=product_in.unit_price, stock_qty=product_in.stock_qty)

def update_product(db: Session, shopkeeper: User, product_id: int, update_in: InputProductUpdate):
  product = input_repository.get_product_by_id(db, product_id)
  if not product:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "product is not present")
  if product.shopkeeper_id != shopkeeper.id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "you don't own this product")
  return input_repository.update_product(db, product, **update_in.model_dump())