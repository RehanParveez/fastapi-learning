from sqlalchemy import Column, Integer, String, Boolean
from app.db.base import Base

class User(Base):
  __tablename__ = 'users'
  
  id = Column(Integer, primary_key=True, index=True)
  username = Column(String, nullable=False)
  email = Column(String, unique=True, index=True, nullable=False)
  hashed_password = Column(String, default = "user")
  is_active = Column(Boolean, default=True)