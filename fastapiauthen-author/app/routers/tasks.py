from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.schemas import TaskRead, TaskCreate, TokenData
from app.deps import get_current_user, get_db, PaginationParams
from app.db import crud
from app.background import write_log, notify_task_created 
from typing import List
from app.models import Task

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(task: TaskCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db),             
  current_user: TokenData = Depends(get_current_user)  
):
  db_user = crud.get_user_by_email(db, current_user.email)
  db_task = crud.create_task(db=db, title=task.title, description=task.description, owner_id=db_user.id)
  background_tasks.add_task(notify_task_created, email=db_user.email, task_title=db_task.title)
  background_tasks.add_task(write_log, message=f"User {db_user.email} created task '{db_task.title}' (ID: {db_task.id})")
  return db_task 

@router.get("/", response_model=List[TaskRead])
def read_my_tasks(pagination: PaginationParams = Depends(),
  db: Session = Depends(get_db),
  current_user: TokenData = Depends(get_current_user)
):
  db_user = crud.get_user_by_email(db, current_user.email)
  tasks = db.query(Task).filter(Task.owner_id == db_user.id)\
    .offset(pagination.skip)\
    .limit(pagination.limit)\
    .all()
  return tasks