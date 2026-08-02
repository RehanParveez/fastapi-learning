from fastapi import FastAPI

app = FastAPI(title = "Kisan API")

@app.get("/")
def read_root():
  return {"message": "Kisan API is running"}