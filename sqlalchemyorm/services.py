from models import User
from db import SessionLocal
from sqlalchemy import select

# Insert Data
def create_user(name: str, email: str):
  with SessionLocal() as session:
    user = User(name=name, email=email)
    session.add(user)
    session.commit()
    
# Fetching Single Data
def get_single_user(user_id: int):
  with SessionLocal() as session:
    user = session.get(User, user_id)
    return user

# Fetching All Data Points
def get_all_user():
  with SessionLocal() as session:
    stmt = select(User)
    users = session.scalars(stmt).all()
    return users

# Update data
def upd_user_email(user_id: int, new_email: str):
  with SessionLocal() as session:
    user = session.get(User, user_id)
    if user:
      user.email = new_email
      session.commit()
    return user

# Del data
def del_user(user_id: int):
  with SessionLocal() as session:
    user = session.get(User, user_id)
    if user:
      session.delete(user)
      session.commit()
    