from fastapi import FastAPI
from app.routers import auth, users, tasks
from app.db.base import Base
from app.db.session import engine
from app.middleware.logging import LoggingMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(LoggingMiddleware)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)