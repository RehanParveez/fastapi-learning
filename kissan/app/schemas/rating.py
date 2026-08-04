from pydantic import BaseModel, ConfigDict, Field
from app.models.rating import RatingReferenceType
from datetime import datetime

class RatingCreate(BaseModel):
  ratee_id: int
  reference_type: RatingReferenceType
  reference_id: int
  score: int = Field(ge=1, le=5)
  comment: str | None = None

class RatingOut(BaseModel):
  id: int
  rater_id: int
  ratee_id: int
  reference_type: RatingReferenceType
  reference_id: int
  score: int
  comment: str | None
  created_at: datetime

  model_config = ConfigDict(from_attributes=True)

class UserRatingSummary(BaseModel):
  user_id: int
  average_score: float | None
  total_ratings: int
  ratings: list[RatingOut]