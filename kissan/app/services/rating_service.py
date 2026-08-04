from sqlalchemy.orm import Session
from app.models.rating import RatingReferenceType
from app.repositories import advance_repository, contract_repository, rating_repository, listing_repository
from app.models.advance import AdvanceStatus
from app.models.contract import AllocationStatus
from app.schemas.rating import RatingCreate
from fastapi import HTTPException, status
from app.models.user import User
from app.models.listing import ConsumerOrderStatus

def _eligible_participants(db: Session, reference_type: RatingReferenceType, reference_id: int) -> set[int] | None:
  if reference_type == RatingReferenceType.crop_advance:
    advance = advance_repository.get_advance_by_id(db, reference_id)
    if not advance or advance.status not in (AdvanceStatus.disbursed, AdvanceStatus.repaying, AdvanceStatus.settled):
      return None
    return {advance.farmer_id, advance.broker_id}

  if reference_type == RatingReferenceType.contract_allocation:
    allocation = contract_repository.get_allocation_by_id(db, reference_id)
    if not allocation or allocation.status != AllocationStatus.delivered:
      return None
    demand = contract_repository.get_demand_by_id(db, allocation.demand_id)
    return {allocation.farmer_id, demand.factory_id}

  if reference_type == RatingReferenceType.consumer_order:
    order = listing_repository.get_order_by_id(db, reference_id)
    if not order or order.status == ConsumerOrderStatus.cancelled:
      return None
    farmer_ids = set()
    for item in order.items:
      listing = listing_repository.get_listing_by_id(db, item.listing_id)
      if listing:
        farmer_ids.add(listing.farmer_id)
    return {order.consumer_id, *farmer_ids}

  return None

def submit_rating(db: Session, rater: User, rating_in: RatingCreate):
  if rating_in.ratee_id == rater.id:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "you cannot rate yourself")

  participants = _eligible_participants(db, rating_in.reference_type, rating_in.reference_id)
  if participants is None:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "this transaction doesn't exist yet, or isn't far enough along to be rated")
  if rater.id not in participants:
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail = "you were not a party to this transaction")
  if rating_in.ratee_id not in participants:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "the person you're rating was not a party to this transaction")

  existing = rating_repository.get_existing_rating(db, rater_id=rater.id, ratee_id=rating_in.ratee_id, reference_type=rating_in.reference_type,
    reference_id=rating_in.reference_id)
  if existing:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "you have already rated this transaction")

  return rating_repository.create_rating(db, rater_id=rater.id, ratee_id=rating_in.ratee_id, reference_type=rating_in.reference_type,
    reference_id=rating_in.reference_id, score=rating_in.score, comment=rating_in.comment)