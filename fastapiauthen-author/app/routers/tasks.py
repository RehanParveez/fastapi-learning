from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.schemas import TaskRead, TaskCreate, TokenData
from app.deps import get_current_user, get_db
from app.db import crud
from typing import List

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(task: TaskCreate, db: Session = Depends(get_db),             
  current_user: TokenData = Depends(get_current_user)  
):
  db_user = crud.get_user_by_email(db, current_user.email)
  db_task = crud.create_task(db=db, title=task.title, description=task.description, owner_id=db_user.id)
  return db_task 

@router.get("/", response_model=List[TaskRead])
def read_my_tasks(db: Session = Depends(get_db),
  current_user: TokenData = Depends(get_current_user)
):
  db_user = crud.get_user_by_email(db, current_user.email)
  tasks = crud.get_tasks_by_owner(db, owner_id=db_user.id)
  return tasks