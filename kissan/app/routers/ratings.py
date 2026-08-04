from fastapi import APIRouter, Depends
from app.schemas.rating import RatingOut, RatingCreate, UserRatingSummary
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.deps import get_current_user
from app.services import rating_service
from app.repositories import rating_repository

router = APIRouter(prefix="/ratings", tags=["ratings"])

@router.post("", response_model=RatingOut, status_code=201)
def submit_rating(rating_in: RatingCreate, db: Session = Depends(get_db), rater: User = Depends(get_current_user)):
  return rating_service.submit_rating(db, rater, rating_in)

@router.get("/user/{user_id}", response_model=UserRatingSummary)
def get_user_ratings(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
  ratings = rating_repository.list_ratings_for_user(db, user_id)
  avg = rating_repository.average_score(db, user_id)
  return UserRatingSummary(user_id=user_id, average_score=avg, total_ratings=len(ratings), ratings=[RatingOut.model_validate(r) for r in ratings])