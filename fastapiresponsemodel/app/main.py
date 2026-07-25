from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class UserInDB(BaseModel):
  id: int
  username: str
  email: str
  password: str
  
class UserOut(BaseModel):
  id: int
  username: str
  email: str
  
user1 = UserInDB(id=1, username="halan", email="halan@gmail.com", password="hal12312")
  
@app.get("/user", response_model=UserOut)
async def get_user():
  return user1
  