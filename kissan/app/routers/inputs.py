from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.deps import get_current_user, require_role
from app.models.user import User, UserRole
from app.schemas.input import InputProductCreate, InputProductOut, InputProductUpdate
from app.services import input_service
from app.repositories import input_repository

router = APIRouter(prefix="/inputs", tags=["inputs"])

@router.post("/products", response_model=InputProductOut, status_code=201)
def create_product(product_in: InputProductCreate, db: Session = Depends(get_db), shopkeeper: User = Depends(require_role(UserRole.shopkeeper))):
  return input_service.create_product(db, shopkeeper, product_in)

@router.get("/products", response_model=list[InputProductOut])
def list_products(shopkeeper_id: int | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
  return input_repository.list_products(db, shopkeeper_id)

@router.patch("/products/{product_id}", response_model=InputProductOut)
def update_product(product_id: int, update_in: InputProductUpdate, db: Session = Depends(get_db),
  shopkeeper: User = Depends(require_role(UserRole.shopkeeper))):
  return input_service.update_product(db, shopkeeper, product_id, update_in)