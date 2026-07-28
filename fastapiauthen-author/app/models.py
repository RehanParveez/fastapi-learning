from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
  __tablename__ = 'users'
  
  id = Column(Integer, primary_key=True, index=True)
  username = Column(String, nullable=False)
  email = Column(String, unique=True, index=True, nullable=False)
  hashed_password = Column(String, default = "user")
  role = Column(String, default = "user")
  is_active = Column(Boolean, default=True)
  
class Task(Base):
  __tablename__ = "tasks"
    
  id = Column(Integer, primary_key=True, index=True)
  title = Column(String, nullable=False)
  description = Column(String, nullable=True)
  is_completed = Column(Boolean, default=False)
  owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)