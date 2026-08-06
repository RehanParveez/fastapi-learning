import logging
from datetime import datetime, timedelta, timezone
from apscheduler.schedulers.background import BackgroundScheduler
from app.db.session import SessionLocal
from app.models.advance import CropAdvance, AdvanceStatus
from app.models.contract import ContractDemand, ContractDemandStatus
from app.repositories import contract_repository
from app.notifications.service import notify_user

logger = logging.getLogger("kisanlink.scheduler")
scheduler = BackgroundScheduler()

def check_overdue_advances():
  db = SessionLocal()
  try:
    now = datetime.now(timezone.utc)
    overdue = (db.query(CropAdvance)
      .filter(CropAdvance.status.in_([AdvanceStatus.disbursed, AdvanceStatus.repaying]))
      .filter(CropAdvance.due_date.isnot(None))
      .filter(CropAdvance.due_date < now)
      .all()
     )
    for advance in overdue:
      logger.warning(f"CropAdvance {advance.id} is overdue (due {advance.due_date})")
      notify_user(advance.farmer_id, "advance_overdue", {"advance_id": advance.id})
      notify_user(advance.broker_id, "advance_overdue", {"advance_id": advance.id, "farmer_id": advance.farmer_id})
  finally:
    db.close()

def check_unmet_contract_demands():
  db = SessionLocal()
  try:
    soon = datetime.now(timezone.utc) + timedelta(days=3)
    nearing = (
      db.query(ContractDemand)
        .filter(ContractDemand.status == ContractDemandStatus.open)
        .filter(ContractDemand.delivery_window_end.isnot(None))
        .filter(ContractDemand.delivery_window_end < soon)
        .all()
      )
    for demand in nearing:
      allocated = contract_repository.get_allocated_qty(db, demand.id)
      if allocated < demand.quantity_needed:
        logger.warning(f"ContractDemand {demand.id} nears delivery window, {allocated}/{demand.quantity_needed} allocated")
        notify_user(db, demand.factory_id, "contract_demand_unmet", {"demand_id": demand.id, "allocated": allocated, "needed": demand.quantity_needed})
  finally:
    db.close()

def start_scheduler():
  scheduler.add_job(check_overdue_advances, "interval", days=1, id = "check_overdue_advances", replace_existing=True)
  scheduler.add_job(check_unmet_contract_demands, "interval", days=1, id = "check_unmet_contracts", replace_existing=True)
  scheduler.start()

def shutdown_scheduler():
  scheduler.shutdown(wait=False)