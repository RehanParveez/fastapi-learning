from sqlalchemy.orm import Session
from app.models.user import User, UserRole

def get_user_by_phone(db: Session, phone: str) -> User | None:
  return db.query(User).filter(User.phone == phone).first()

def get_user_by_username(db: Session, username: str) -> User | None:
  return db.query(User).filter(User.username == username).first()

def get_user_by_id(db: Session, user_id: int) -> User | None:
  return db.query(User).filter(User.id == user_id).first()

def get_user_by_reset_token(db: Session, token: str) -> User | None:
  return db.query(User).filter(User.reset_token == token).first()

def create_user(
  db: Session, *, phone: str, email: str | None, hashed_password: str, role: UserRole
) -> User:
  db_user = User(phone=phone, email=email, hashed_password=hashed_password, role=role)
  db.add(db_user)
  db.commit()
  db.refresh(db_user)
  return db_user

def update_password(db: Session, user: User, hashed_password: str) -> User:
  user.hashed_password = hashed_password
  user.reset_token = None
  user.reset_token_expires = None
  db.commit()
  db.refresh(user)
  return user

def save_user(db: Session, user: User) -> User:
  db.commit()
  db.refresh(user)
  return user