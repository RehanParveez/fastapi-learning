from sqlalchemy.orm import Session
from app.models.advance import CropAdvance, AdvanceStatus, AdvanceType, PricingMode

def create_advance(db: Session, *, broker_id: int, farmer_id: int, advance_type: AdvanceType, advance_amount: float,
  interest_rate: float | None = None, crop_type: str | None = None, expected_qty: float | None = None, commission_rate: float | None = None,
  pricing_mode: PricingMode | None = None, due_date=None,
) -> CropAdvance:
  advance = CropAdvance(broker_id=broker_id, farmer_id=farmer_id, advance_type=advance_type, advance_amount=advance_amount, interest_rate=interest_rate,
    crop_type=crop_type, expected_qty=expected_qty, commission_rate=commission_rate, pricing_mode=pricing_mode,
    status=AdvanceStatus.offered, outstanding_balance=0, due_date=due_date)
  db.add(advance)
  db.commit()
  db.refresh(advance)
  return advance

def get_advance_by_id(db: Session, advance_id: int) -> CropAdvance | None:
  return db.query(CropAdvance).filter(CropAdvance.id == advance_id).first()

def list_advances(db: Session, *, farmer_id: int | None = None, broker_id: int | None = None,
):
  query = db.query(CropAdvance)
  if farmer_id:
    query = query.filter(CropAdvance.farmer_id == farmer_id)
  if broker_id:
    query = query.filter(CropAdvance.broker_id == broker_id)
  return query.order_by(CropAdvance.created_at.desc()).all()

def save(db: Session, advance: CropAdvance) -> CropAdvance:
  db.commit()
  db.refresh(advance)
  return advance