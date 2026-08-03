from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.contract import ContractDemandStatus, AllocationStatus, QualityGrade, SourceType
from app.models.record import RecordEntryType, RecordDirection
from app.models.user import User
from app.repositories import contract_repository, record_repository
from app.schemas.contract import ContractDemandCreate, ContractAllocationCreate, AllocationDecision, DeliveryCreate

GRADE_ADJUSTMENT = {
  QualityGrade.A: 0.0,
  QualityGrade.B: -0.10,
  QualityGrade.C: -0.25,
}

def post_demand(db: Session, factory: User, demand_in: ContractDemandCreate):
  return contract_repository.create_demand(db, factory_id=factory.id, crop_type=demand_in.crop_type,
    quantity_needed=demand_in.quantity_needed, price_offered=demand_in.price_offered,
    quality_specs=demand_in.quality_specs, delivery_window_start=demand_in.delivery_window_start,
    delivery_window_end=demand_in.delivery_window_end)

def apply_for_contract(db: Session, farmer: User, demand_id: int, application_in: ContractAllocationCreate):
  demand = contract_repository.get_demand_by_id(db, demand_id)
  if not demand:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "contract demand is not present")
  if demand.status != ContractDemandStatus.open:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
      detail = f"this contract demand is '{demand.status.value}' and no longer accepting applications")
  if application_in.requested_qty <= 0:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "requested quantity must be positive")

  return contract_repository.create_allocation(db, demand_id=demand_id, farmer_id=farmer.id, requested_qty=application_in.requested_qty)

def decide_allocation(db: Session, factory: User, allocation_id: int, decision: AllocationDecision):
  allocation = contract_repository.get_allocation_by_id(db, allocation_id)
  if not allocation:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Allocation not found")

  demand = contract_repository.get_demand_by_id(db, allocation.demand_id)
  if demand.factory_id != factory.id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This is not your contract demand")
  if allocation.status != AllocationStatus.requested:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
      detail = f"cant decide an allocation already in '{allocation.status.value}' status")

  if not decision.approve:
    allocation.status = AllocationStatus.rejected
    return contract_repository.save_allocation(db, allocation)

  already_allocated = contract_repository.get_allocated_qty(db, demand.id)
  remaining_capacity = demand.quantity_needed - already_allocated
  grant_qty = decision.allocated_qty if decision.allocated_qty is not None else allocation.requested_qty

  if grant_qty <= 0:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "allocated quantity must be positive")
  if grant_qty > remaining_capacity:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Only {remaining_capacity} units remain on this contract demand")

  allocation.allocated_qty = grant_qty
  allocation.status = AllocationStatus.approved
  contract_repository.save_allocation(db, allocation)
  if already_allocated + grant_qty >= demand.quantity_needed:
    demand.status = ContractDemandStatus.fulfilled
    contract_repository.save_demand(db, demand)

  return allocation

def record_delivery(db: Session, factory: User, allocation_id: int, delivery_in: DeliveryCreate):
  allocation = contract_repository.get_allocation_by_id(db, allocation_id)
  if not allocation:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "allocation is not present")

  demand = contract_repository.get_demand_by_id(db, allocation.demand_id)
  if demand.factory_id != factory.id:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "this is not your contract demand")
  if allocation.status != AllocationStatus.approved:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
      detail=f"Cannot record delivery for an allocation in '{allocation.status.value}' status")
    
  if delivery_in.delivered_qty <= 0:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "delivered quantity must be positive")
  if delivery_in.delivered_qty > allocation.allocated_qty:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "delivered quantity cannot exceed the allocated quantity")

  adjustment = GRADE_ADJUSTMENT[delivery_in.quality_grade]
  payment_amount = round(delivery_in.delivered_qty * demand.price_offered * (1 + adjustment), 2)

  delivery = contract_repository.create_delivery(db, source_type=SourceType.contract, source_id=allocation.id,
    delivered_qty=delivery_in.delivered_qty, quality_grade=delivery_in.quality_grade, price_adjustment_percent=adjustment,
    recorded_by=factory.id)

  record_repository.add_entry(db, farmer_id=allocation.farmer_id, entry_type = RecordEntryType.contract_payment,
    direction=ResourceWarningDirection.credit, amount=payment_amount,
    reference_type="delivery", reference_id=delivery.id)

  allocation.status = AllocationStatus.delivered
  contract_repository.save_allocation(db, allocation)
  return {"delivery": delivery, "payment_amount": payment_amount, "allocation_status": allocation.status}