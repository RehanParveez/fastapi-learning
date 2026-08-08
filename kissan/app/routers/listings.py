from fastapi import APIRouter, Depends, HTTPException
from app.schemas.listing import CropListingCreate, CropListingOut, BulkPurchaseRequest, BulkPurchaseResult, ConsumerOrderCreate, ConsumerOrderOut
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserRole
from app.deps import get_current_user, require_role
from app.services import listing_service
from app.repositories import listing_repository
from app.models.listing import ListingStatus, ConsumerOrderStatus

router = APIRouter(prefix="/listings", tags=["listings"])

@router.post("", response_model=CropListingOut, status_code=201)
def create_listing(listing_in: CropListingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
  return listing_service.create_listing(db, current_user, listing_in)

@router.get("", response_model=list[CropListingOut])
def browse_listings(retail_only: bool = False, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
  return listing_repository.list_listings(db, retail_only=retail_only, status_filter=ListingStatus.active)

@router.get("/mine", response_model=list[CropListingOut])
def my_listings(db: Session = Depends(get_db), farmer: User = Depends(require_role(UserRole.farmer))):
  return listing_repository.list_listings(db, farmer_id=farmer.id)

@router.post("/{listing_id}/purchase", response_model=BulkPurchaseResult)
def bulk_purchase(listing_id: int, purchase_in: BulkPurchaseRequest, db: Session = Depends(get_db),
  buyer: User = Depends(require_role(UserRole.broker, UserRole.factory))):
  listing, amount = listing_service.bulk_purchase(db, buyer, listing_id, purchase_in.qty)
  return BulkPurchaseResult(listing=CropListingOut.model_validate(listing), amount_paid=amount)

@router.post("/orders", response_model=ConsumerOrderOut, status_code=201)
def place_order(order_in: ConsumerOrderCreate, db: Session = Depends(get_db), consumer: User = Depends(require_role(UserRole.consumer))):
  return listing_service.place_consumer_order(db, consumer, order_in)

@router.get("/orders/mine", response_model=list[ConsumerOrderOut])
def my_orders(db: Session = Depends(get_db), consumer: User = Depends(require_role(UserRole.consumer))):
  return listing_repository.list_orders(db, consumer.id)

@router.patch("/orders/{order_id}/deliver", response_model=ConsumerOrderOut)
def deliver_consumer_order(order_id: int, db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user)
):
  order = listing_repository.get_order_by_id(db, order_id)
  if not order:
    raise HTTPException(status_code=404, detail="Order not found")

  is_consumer = order.consumer_id == current_user.id
  is_farmer = False
  for item in order.items:
    listing = listing_repository.get_listing_by_id(db, item.listing_id)
    if listing and listing.farmer_id == current_user.id:
      is_farmer = True
      break

  if not is_consumer and not is_farmer and current_user.role != UserRole.admin:
    raise HTTPException(status_code=403, detail = "not authorized")
  if order.status != ConsumerOrderStatus.placed:
    raise HTTPException(status_code=400, detail = "order already processed")

  order.status = ConsumerOrderStatus.delivered
  return listing_repository.save_order(db, order)