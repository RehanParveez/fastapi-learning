from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.base import Base
from app.deps import get_db  

TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_temp.db"
engine = create_engine(TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
  db = TestingSessionLocal()
  try:
    yield db
  finally:
    db.close()

app.dependency_overrides[get_db] = override_get_db

Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_register_user():
  response = client.post("/auth/register", json={"username": "user4", "email": "user4@gmail.com", "password": "user412312", "role": "user"})
  assert response.status_code == 201
  data = response.json()
  assert data["email"] == "user4@gmail.com"
  assert data["role"] == "user"

def test_login_and_access_protected_route():
  response = client.post("/auth/login", data={"username": "user4@gmail.com", "password": "user412312"})
  assert response.status_code == 200
  token = response.json()["access_token"]
    
  headers = {"Authorization": f"Bearer {token}"}
  response = client.get("/users/me", headers=headers)
  assert response.status_code == 200
  assert response.json()["user"]["email"] == "user4@gmail.com"

def test_protected_route_without_token():
  response = client.get("/users/me")
  assert response.status_code == 401

def test_admin_route_as_normal_user():
  response = client.post("/auth/login", data={"username": "user4@gmail.com", "password": "user412312"})
  token = response.json()["access_token"]
  headers = {"Authorization": f"Bearer {token}"} 
  response = client.get("/users/admin-only", headers=headers)
  assert response.status_code == 403