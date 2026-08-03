from pydantic import BaseModel, ConfigDict

class FarmerProfileCreate(BaseModel):
  land_size_acres: float | None = None
  location: str | None = None
  
class FarmerProfileOut(FarmerProfileCreate):
  id: int
  user_id: int
  verified: bool
  
  model_config = ConfigDict(from_attributes=True)
  
class BusinessProfileCreate(BaseModel):
  business_name: str
  location: str | None | None
  
class BusinessProfileOut(BusinessProfileCreate):
   id: int
   user_id: int
   verified: bool
   
   model_config = ConfigDict(from_attributes=True)