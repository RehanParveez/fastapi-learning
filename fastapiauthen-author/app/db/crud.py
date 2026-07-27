from sqlalchemy.orm import Session
from app.models import User, Task
from app.security import hash_password

def get_user_by_email(db: Session, email: str):
  return db.query(User).filter(User.email == email).first()

def create_user(db: Session, username: str, email: str, password: str, role: str ="user"):
  db_user =  User(username=username, email=email, hash_password=hash_password(password),
    role=role, is_active=True)
  db.add(db_user)
  db.commit()
  db.refresh(db_user)
  return db_user

def create_task(db: Session, title: str, description: str | None, owner_id: int):
    db_task = Task(title=title, description=description, owner_id=owner_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_tasks_by_owner(db: Session, owner_id: int):
    return db.query(Task).filter(Task.owner_id == owner_id).all()