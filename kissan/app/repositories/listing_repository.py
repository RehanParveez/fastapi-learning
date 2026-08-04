from sqlalchemy.orm import Session
from app.models.listing import CropListing, ConsumerOrder, ConsumerOrderItem

def create_listing(db: Session, *, farmer_id: int, listed_by_id: int, crop_type: str, quantity: float,
  quality_grade, price: float, retail_available: bool, retail_unit_size: float | None) -> CropListing:
  listing = CropListing(farmer_id=farmer_id, listed_by_id=listed_by_id, crop_type=crop_type, quantity=quantity,
    quality_grade=quality_grade, price=price, retail_available=retail_available, retail_unit_size=retail_unit_size)
  db.add(listing)
  db.commit()
  db.refresh(listing)
  return listing

def get_listing_by_id(db: Session, listing_id: int) -> CropListing | None:
  return db.query(CropListing).filter(CropListing.id == listing_id).first()

def list_listings(db: Session, *, farmer_id: int | None = None, retail_only: bool = False, status_filter=None):
  query = db.query(CropListing)
  if farmer_id:
    query = query.filter(CropListing.farmer_id == farmer_id)
  if retail_only:
    query = query.filter(CropListing.retail_available == True)
  if status_filter:
    query = query.filter(CropListing.status == status_filter)
  return query.order_by(CropListing.created_at.desc()).all()


def save_listing(db: Session, listing: CropListing) -> CropListing:
  db.commit()
  db.refresh(listing)
  return listing

def create_consumer_order(db: Session, *, consumer_id: int, payment_mode) -> ConsumerOrder:
  order = ConsumerOrder(consumer_id=consumer_id, payment_mode=payment_mode, total_amount=0)
  db.add(order)
  db.flush()
  return order

def add_order_item(db: Session, *, order_id: int, listing_id: int, qty: float, unit_price: float) -> ConsumerOrderItem:
  item = ConsumerOrderItem(order_id=order_id, listing_id=listing_id, qty=qty, unit_price=unit_price,
    subtotal=round(qty * unit_price, 2))
  db.add(item)
  db.flush()
  return item

def list_orders(db: Session, consumer_id: int):
  return db.query(ConsumerOrder).filter(ConsumerOrder.consumer_id == consumer_id).order_by(ConsumerOrder.created_at.desc()).all()

def get_order_by_id(db: Session, order_id: int) -> ConsumerOrder | None:
  return db.query(ConsumerOrder).filter(ConsumerOrder.id == order_id).first()

def save_order(db: Session, order: ConsumerOrder) -> ConsumerOrder:
  db.commit()
  db.refresh(order)
  return order