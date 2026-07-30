from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.base import Base
from app.deps import get_db  
import io
from fastapi.testclient import TestClient

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
def fake_file(filename: str, content: bytes, content_type: str):
  return (filename, io.BytesIO(content), content_type)

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
  
def test_create_note_with_file():
  client.post("/auth/register", json={"username": "noteuser", "email": "note@gmail.com", "password": "note12312", "role": "user"})
  login = client.post("/auth/login", data={"username": "note@gmail.com", "password": "note12312"})
  token = login.json()["access_token"]
  headers = {"Authorization": f"Bearer {token}"}
  
  response = client.post("/notes/", data={"title": "My Photo", "description": "Vacation pic"},
    files={"file": fake_file("photo.jpg", b"fake image bytes", "image/jpeg")}, headers=headers)

  assert response.status_code == 201
  data = response.json()
  assert data["title"] == "My Photo"
  assert data["description"] == "Vacation pic"
  
def test_list_my_notes():
  login = client.post("/auth/login", data={"username": "note@gmail.com", "password": "note12312"})
  token = login.json()["access_token"]
  headers = {"Authorization": f"Bearer {token}"}
  
  response = client.get("/notes/", headers=headers)
  assert response.status_code == 200
  data = response.json()
  assert len(data) >= 1
  
def test_download_my_file():
  login = client.post("/auth/login", data={"username": "note@gmail.com", "password": "note12312"})
  token = login.json()["access_token"]
  headers = {"Authorization": f"Bearer {token}"}
  response = client.get("/notes/1/download", headers=headers)
  assert response.status_code == 200
  
def test_download_as_wrong_user():
  client.post("/auth/register", json={"username": "hacker", "email": "hacker@gmail.com",
    "password": "hack12312", "role": "user"})
  login = client.post("/auth/login", data={"username": "hacker@gmail.com", "password": "hack12312"})
  token = login.json()["access_token"]
  headers = {"Authorization": f"Bearer {token}"}
  response = client.get("/notes/1/download", headers=headers)
  assert response.status_code == 403

def test_invalid_file_type():
  login = client.post("/auth/login", data={"username": "note@gmail.com", "password": "note12312"})
  token = login.json()["access_token"]
  headers = {"Authorization": f"Bearer {token}"}
  response = client.post("/notes/", data={"title": "Bad File", "description": "virus.exe"},
    files={"file": fake_file("virus.exe", b"fake exe", "application/octet-stream")}, headers=headers)
  assert response.status_code == 400
  assert "not allowed" in response.json()["detail"]

def test_upload_without_auth():
  response = client.post("/notes/", data={"title": "No Auth", "description": "this method is written for the testing purposes"},
    files={"file": fake_file("test.txt", b"hello", "text/plain")})
  assert response.status_code == 401
  