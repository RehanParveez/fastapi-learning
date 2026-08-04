from app.core.config import settings
from sqlalchemy import create_engine
import pytest
from sqlalchemy.orm import sessionmaker
from app.db.session import Base, get_db
from app.models.user import User, UserRole
from app.main import app
from fastapi.testclient import TestClient
from app.core.security import create_access_token, hash_password

TEST_DATABASE_URL = settings.database_url.rsplit("/", 1)[0] + "/kisan_test"

engine = create_engine(TEST_DATABASE_URL)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture()
def db():
  Base.metadata.create_all(bind=engine)
  session = TestSessionLocal()
  try:
    yield session
  finally:
    session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture()
def client(db):
  def override_get_db():
    yield db

  app.dependency_overrides[get_db] = override_get_db
  yield TestClient(app)
  app.dependency_overrides.clear()

def make_user(db, *, role: UserRole, phone: str) -> User:
  user = User(phone=phone, hashed_password=hash_password("testpass123"), role=role, is_active=True)
  db.add(user)
  db.commit()
  db.refresh(user)
  return user

def auth_headers(user: User) -> dict:
  token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
  return {"Authorization": f"Bearer {token}"}