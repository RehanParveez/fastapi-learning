from sqlalchemy.orm import Session
from app.models.record import RecordEntry, RecordEntryType, RecordDirection

def add_entry(db: Session, *, farmer_id: int, entry_type: RecordEntryType, direction: RecordDirection,
  amount: float, reference_type: str | None = None, reference_id: int | None = None,
) -> RecordEntry:
  entry = RecordEntry(farmer_id=farmer_id, entry_type=entry_type, direction=direction, amount=amount,
    reference_type=reference_type, reference_id=reference_id)
  db.add(entry)
  db.flush() 
  return entry

def list_entries(db: Session, farmer_id: int):
  return (db.query(RecordEntry)
    .filter(RecordEntry.farmer_id == farmer_id)
    .order_by(RecordEntry.created_at.asc())
    .all())