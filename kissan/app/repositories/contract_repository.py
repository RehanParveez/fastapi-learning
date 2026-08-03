from sqlalchemy.orm import Session
from app.models.contract import ContractDemand, ContractAllocation, AllocationStatus, Delivery
from sqlalchemy import func

def create_demand(db: Session, *, factory_id: int, crop_type: str, quantity_needed: float,
  price_offered: float, quality_specs: str | None,
    delivery_window_start=None, delivery_window_end=None) -> ContractDemand:
  demand = ContractDemand(factory_id=factory_id, crop_type=crop_type, quantity_needed=quantity_needed,
    price_offered=price_offered, quality_specs=quality_specs, delivery_window_start=delivery_window_start,
    delivery_window_end=delivery_window_end)
  db.add(demand)
  db.commit()
  db.refresh(demand)
  return demand

def get_demand_by_id(db: Session, demand_id: int) -> ContractDemand | None:
  return db.query(ContractDemand).filter(ContractDemand.id == demand_id).first()

def list_demands(db: Session, *, factory_id: int | None = None, status_filter=None):
  query = db.query(ContractDemand)
  if factory_id:
    query = query.filter(ContractDemand.factory_id == factory_id)
  if status_filter:
    query = query.filter(ContractDemand.status == status_filter)
  return query.order_by(ContractDemand.created_at.desc()).all()

def save_demand(db: Session, demand: ContractDemand) -> ContractDemand:
  db.commit()
  db.refresh(demand)
  return demand

def get_allocated_qty(db: Session, demand_id: int) -> float:
  total = (db.query(func.coalesce(func.sum(ContractAllocation.allocated_qty), 0.0))
   .filter(ContractAllocation.demand_id == demand_id, ContractAllocation.status.in_([AllocationStatus.approved, AllocationStatus.delivered]))
   .scalar())
  return float(total)

def create_allocation(db: Session, *, demand_id: int, farmer_id: int, requested_qty: float) -> ContractAllocation:
  allocation = ContractAllocation(demand_id=demand_id, farmer_id=farmer_id, requested_qty=requested_qty)
  db.add(allocation)
  db.commit()
  db.refresh(allocation)
  return allocation

def get_allocation_by_id(db: Session, allocation_id: int) -> ContractAllocation | None:
  return db.query(ContractAllocation).filter(ContractAllocation.id == allocation_id).first()

def list_allocations(db: Session, *, demand_id: int | None = None, farmer_id: int | None = None):
  query = db.query(ContractAllocation)
  if demand_id:
    query = query.filter(ContractAllocation.demand_id == demand_id)
  if farmer_id:
    query = query.filter(ContractAllocation.farmer_id == farmer_id)
  return query.order_by(ContractAllocation.created_at.desc()).all()

def save_allocation(db: Session, allocation: ContractAllocation) -> ContractAllocation:
  db.commit()
  db.refresh(allocation)
  return allocation

def create_delivery(db: Session, *, source_type, source_id: int, delivered_qty: float, quality_grade,
  price_adjustment_percent: float, recorded_by: int) -> Delivery:
  delivery = Delivery(source_type=source_type, source_id=source_id, delivered_qty=delivered_qty,
    quality_grade=quality_grade, price_adjustment_percent=price_adjustment_percent,
    recorded_by=recorded_by)
  db.add(delivery)
  db.flush()
  return delivery