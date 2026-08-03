from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.deps import get_current_user, require_role
from app.models.contract import ContractDemandStatus
from app.models.user import User, UserRole
from app.schemas.contract import ContractDemandCreate, ContractDemandOut, ContractAllocationCreate, ContractAllocationOut, AllocationDecision, DeliveryCreate, DeliveryOut, DeliveryResult
from app.services import contract_service
from app.repositories import contract_repository

router = APIRouter(prefix="/contracts", tags=["contracts"])

def _demand_out(demand, allocated_qty: float) -> ContractDemandOut:
  return ContractDemandOut(id=demand.id, factory_id=demand.factory_id, crop_type=demand.crop_type, quantity_needed=demand.quantity_needed,
    price_offered=demand.price_offered,
    quality_specs=demand.quality_specs, delivery_window_start=demand.delivery_window_start,
    delivery_window_end=demand.delivery_window_end, status=demand.status,
    quantity_allocated=allocated_qty, created_at=demand.created_at)

@router.post("/demands", response_model=ContractDemandOut, status_code=201)
def post_demand(demand_in: ContractDemandCreate, db: Session = Depends(get_db),
  factory: User = Depends(require_role(UserRole.factory))):
  demand = contract_service.post_demand(db, factory, demand_in)
  return _demand_out(demand, 0.0)

@router.get("/demands", response_model=list[ContractDemandOut])
def list_demands(status_filter: ContractDemandStatus | None = None, db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user)):
  demands = contract_repository.list_demands(db, status_filter=status_filter)
  return [_demand_out(d, contract_repository.get_allocated_qty(db, d.id)) for d in demands]

@router.get("/demands/mine", response_model=list[ContractDemandOut])
def list_my_demands(db: Session = Depends(get_db), factory: User = Depends(require_role(UserRole.factory))):
  demands = contract_repository.list_demands(db, factory_id=factory.id)
  return [_demand_out(d, contract_repository.get_allocated_qty(db, d.id)) for d in demands]

@router.post("/demands/{demand_id}/apply", response_model=ContractAllocationOut, status_code=201)
def apply_for_contract(demand_id: int, application_in: ContractAllocationCreate, db: Session = Depends(get_db),
  farmer: User = Depends(require_role(UserRole.farmer))):
  return contract_service.apply_for_contract(db, farmer, demand_id, application_in)

@router.get("/allocations/mine", response_model=list[ContractAllocationOut])
def list_my_allocations(db: Session = Depends(get_db), farmer: User = Depends(require_role(UserRole.farmer))):
  return contract_repository.list_allocations(db, farmer_id=farmer.id)

@router.get("/demands/{demand_id}/allocations", response_model=list[ContractAllocationOut])
def list_demand_allocations(demand_id: int, db: Session = Depends(get_db),
  factory: User = Depends(require_role(UserRole.factory))):
   return contract_repository.list_allocations(db, demand_id=demand_id)

@router.patch("/allocations/{allocation_id}/decision", response_model=ContractAllocationOut)
def decide_allocation(allocation_id: int, decision: AllocationDecision, db: Session = Depends(get_db),
  factory: User = Depends(require_role(UserRole.factory))):
  return contract_service.decide_allocation(db, factory, allocation_id, decision)

@router.post("/allocations/{allocation_id}/delivery", response_model=DeliveryResult)
def record_delivery(allocation_id: int, delivery_in: DeliveryCreate, db: Session = Depends(get_db),
  factory: User = Depends(require_role(UserRole.factory))):
  result = contract_service.record_delivery(db, factory, allocation_id, delivery_in)
  return DeliveryResult(delivery=DeliveryOut.model_validate(result["delivery"]), payment_amount=result["payment_amount"],
    allocation_status=result["allocation_status"])