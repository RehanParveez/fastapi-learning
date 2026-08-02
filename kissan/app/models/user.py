import enum
from sqlalchemy import Enum, Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class UserRole(str, enum.Enum):
  farmer = "farmer"
  shopkeeper = "shopkeeper"
  broker = "broker"
  factory = "factory"
  consumer = "consumer"
  admin = "admin"

class User(Base):
  __tablename__ = "users"

  id = Column(Integer, primary_key=True, index=True)
  phone = Column(String, unique=True, index=True, nullable=False)
  email = Column(String, unique=True, index=True, nullable=True)
  hashed_password = Column(String, nullable=False)
  role = Column(Enum(UserRole), nullable=False)
  is_active = Column(Boolean, default=True, nullable=False)
  created_at = Column(DateTime(timezone=True), server_default=func.now())

  farmer_profile = relationship("FarmerProfile", back_populates = "user", uselist=False, cascade = "all, delete-orphan")
  shopkeeper_profile = relationship("ShopkeeperProfile", back_populates = "user", uselist=False, cascade = "all, delete-orphan")
  broker_profile = relationship("BrokerProfile", back_populates = "user", uselist=False, cascade = "all, delete-orphan")
  factory_profile = relationship("FactoryProfile", back_populates = "user", uselist=False, cascade = "all, delete-orphan")

class FarmerProfile(Base):
  __tablename__ = "farmer_profiles"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
  land_size_acres = Column(Float, nullable=True)
  location = Column(String, nullable=True)
  verified = Column(Boolean, default=False, nullable=False)

  user = relationship("User", back_populates = "farmer_profile")

class ShopkeeperProfile(Base):
  __tablename__ = "shopkeeper_profiles"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
  business_name = Column(String, nullable=False)
  location = Column(String, nullable=True)
  verified = Column(Boolean, default=False, nullable=False)

  user = relationship("User", back_populates = "shopkeeper_profile")

class BrokerProfile(Base):
  __tablename__ = "broker_profiles"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
  business_name = Column(String, nullable=False)
  location = Column(String, nullable=True)
  verified = Column(Boolean, default=False, nullable=False)

  user = relationship("User", back_populates = "broker_profile")

class FactoryProfile(Base):
  __tablename__ = "factory_profiles"

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
  business_name = Column(String, nullable=False)
  location = Column(String, nullable=True)
  verified = Column(Boolean, default=False, nullable=False)

  user = relationship("User", back_populates = "factory_profile")