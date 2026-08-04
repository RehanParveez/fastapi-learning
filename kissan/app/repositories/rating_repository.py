from sqlalchemy.orm import Session
from app.models.rating import Rating
from sqlalchemy import func

def create_rating(db: Session, *, rater_id: int, ratee_id: int, reference_type, reference_id: int,
    score: int, comment: str | None) -> Rating:
  rating = Rating(rater_id=rater_id, ratee_id=ratee_id, reference_type=reference_type, reference_id=reference_id, score=score, comment=comment)
  db.add(rating)
  db.commit()
  db.refresh(rating)
  return rating

def get_existing_rating(db: Session, *, rater_id: int, ratee_id: int, reference_type, reference_id: int) -> Rating | None:
  return db.query(Rating).filter(Rating.rater_id == rater_id, Rating.ratee_id == ratee_id, Rating.reference_type == reference_type, Rating.reference_id == reference_id).first()

def list_ratings_for_user(db: Session, ratee_id: int) -> list[Rating]:
  return db.query(Rating).filter(Rating.ratee_id == ratee_id).order_by(Rating.created_at.desc()).all()

def average_score(db: Session, ratee_id: int) -> float | None:
  result = db.query(func.avg(Rating.score)).filter(Rating.ratee_id == ratee_id).scalar()
  return float(result) if result is not None else None