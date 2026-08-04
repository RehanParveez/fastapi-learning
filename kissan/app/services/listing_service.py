from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.schemas.listing import CropListingCreate, ConsumerOrderCreate
from app.models.listing import CropListing, ListingStatus, ConsumerPaymentMode
from fastapi import HTTPException, status
from app.repositories import listing_repository, user_repository, record_repository, contract_repository
from app.models.record import RecordEntryType, RecordDirection
from app.models.contract import SourceType, QualityGrade

def create_listing(db: Session, current_user: User, listing_in: CropListingCreate) -> CropListing:
  if current_user.role == UserRole.farmer:
    farmer_id = current_user.id
  elif current_user.role == UserRole.broker:
    if not listing_in.farmer_id:
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "a broker must specify farmer_id when listing on a farmer's behalf")
        
    farmer = user_repository.get_user_by_id(db, listing_in.farmer_id)
    if not farmer or farmer.role != UserRole.farmer:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "farmer is not present")
    farmer_id = farmer.id
  else:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "only farmers, or brokers acting on a farmer's behalf, can create a crop listing")

  if listing_in.retail_available and not listing_in.retail_unit_size:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "retail_unit_size is required when retail_available is true")

  return listing_repository.create_listing(db, farmer_id=farmer_id, listed_by_id=current_user.id, crop_type=listing_in.crop_type,
    quantity=listing_in.quantity, quality_grade=listing_in.quality_grade, price=listing_in.price, retail_available=listing_in.retail_available, 
    retail_unit_size=listing_in.retail_unit_size)

def _apply_sale(db: Session, listing: CropListing, qty: float, recorded_by: int) -> float:
  if listing.status != ListingStatus.active:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = f"this listing is '{listing.status.value}' and not available for purchase")
  if qty <= 0:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "quantity must be positive")
  if qty > listing.quantity:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = f"only {listing.quantity} units remain on this listing")

  amount = round(qty * listing.price, 2)
  listing.quantity -= qty
  if listing.quantity == 0:
    listing.status = ListingStatus.sold_out

  record_repository.add_entry(db, farmer_id=listing.farmer_id, entry_type=RecordEntryType.crop_sale,
    direction=RecordDirection.credit, amount=amount, reference_type = "crop_listing", reference_id=listing.id)
  
  contract_repository.create_delivery(db, source_type=SourceType.listing, source_id=listing.id, delivered_qty=qty,
    quality_grade=QualityGrade(listing.quality_grade.value), price_adjustment_percent=0.0, recorded_by=recorded_by,
  )
  db.flush()
  return amount

def bulk_purchase(db: Session, buyer: User, listing_id: int, qty: float):
  listing = listing_repository.get_listing_by_id(db, listing_id)
  if not listing:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "listing is not present")
  amount = _apply_sale(db, listing, qty)
  listing_repository.save_listing(db, listing)  
  return listing, amount

def place_consumer_order(db: Session, consumer: User, order_in: ConsumerOrderCreate):
  if not order_in.items:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail  = "order must include at least one item")

  order = listing_repository.create_consumer_order(db, consumer_id=consumer.id, payment_mode=ConsumerPaymentMode.cash_on_delivery)
  total = 0.0

  for item_in in order_in.items:
    listing = listing_repository.get_listing_by_id(db, item_in.listing_id)
    if not listing:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = f"Listing {item_in.listing_id} not found")
    if not listing.retail_available:
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = f"Listing {listing.id} is not available for retail purchase")

    unit_price = listing.price
    subtotal = _apply_sale(db, listing, item_in.qty, consumer.id)
    listing_repository.add_order_item(db, order_id=order.id, listing_id=listing.id, qty=item_in.qty, unit_price=unit_price)
    total += subtotal

  order.total_amount = round(total, 2)
  return listing_repository.save_order(db, order)