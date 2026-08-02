from sqlalchemy.orm import Session
from app.models.user import User, UserRole

def get_user_by_phone(db: Session, phone: str) -> User | None:
  return db.query(User).filter(User.phone == phone).first()

def get_user_by_id(db: Session, user_id: int) -> User | None:
  return db.query(User).filter(User.id == user_id).first()

def create_user(
  db: Session, *, phone: str, email: str | None, hashed_password: str, role: UserRole
) -> User:
  db_user = User(phone=phone, email=email, hashed_password=hashed_password, role=role)
  db.add(db_user)
  db.commit()
  db.refresh(db_user)
  return db_user