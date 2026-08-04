from fastapi import APIRouter, Depends
from app.models.user import User, UserRole
from app.deps import require_role
from app.background.scheduler import check_overdue_advances, check_unmet_contract_demands

router = APIRouter(prefix = "/admin", tags=["admin"])

@router.post("/run-reminder-checks")
def run_reminder_checks(admin: User = Depends(require_role(UserRole.admin))):
  check_overdue_advances()
  check_unmet_contract_demands()
  return {"status": "reminder checks executed"}