from fastapi import APIRouter, Depends
from app.models.user import User, UserRole
from app.background.scheduler import check_overdue_advances, check_unmet_contract_demands
from app.deps import require_role
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.verification import VerificationDocument, VerificationStatus
from app.models.advance import CropAdvance
from app.models.input_order import InputOrder
from app.models.contract import ContractDemand
from app.models.listing import ConsumerOrder, CropListing

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/run-reminder-checks")
def run_reminder_checks(admin: User = Depends(require_role(UserRole.admin))):
  check_overdue_advances()
  check_unmet_contract_demands()
  return {"status": "reminder checks executed"}

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin: User = Depends(require_role(UserRole.admin))):
  total_users = db.query(User).count()
  total_farmers = db.query(User).filter(User.role == UserRole.farmer).count()
  pending_verifications = db.query(VerificationDocument).filter(VerificationDocument.status == VerificationStatus.pending).count()
  total_advances = db.query(CropAdvance).count()
  active_advances = db.query(CropAdvance).filter(CropAdvance.status.in_(["disbursed", "repaying"])).count()
  total_input_orders = db.query(InputOrder).count()
  total_contract_demands = db.query(ContractDemand).count()
  total_consumer_orders = db.query(ConsumerOrder).count()
  total_listings = db.query(CropListing).count()

  return {"total_users": total_users, "total_farmers": total_farmers, "pending_verifications": pending_verifications, "total_advances": total_advances,
    "active_advances": active_advances, "total_input_orders": total_input_orders, "total_contract_demands": total_contract_demands,
      "total_consumer_orders": total_consumer_orders, "total_listings": total_listings,
  }