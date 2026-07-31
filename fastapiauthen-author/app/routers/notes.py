from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
import shutil
from pathlib import Path
from app.schemas import NoteRead, PaginatedResponse
from app.deps import get_current_user, get_db, PaginationParams, user_rate_limiter
from app.db import crud
from app.background import write_log
from app.models import Attachment, Note, User
from fastapi.responses import FileResponse
from app.background import notify_note_uploaded

router = APIRouter(prefix="/notes", tags=["notes"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post ("/", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note_with_file(background_tasks: BackgroundTasks, title: str = Form(...), description: Optional[str] = Form(""), 
  file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user),
  _: None = Depends(user_rate_limiter)
):
    
  MAX_SIZE = 5 * 1024 * 1024
  file.file.seek(0, 2)
  file_size = file.file.tell()
  file.file.seek(0)
  if file_size > MAX_SIZE:
    raise HTTPException(status_code=413, detail = "the file too is large (max 5MB)")
    
  allowed_extensions = {".jpg", ".jpeg", ".png", ".pdf", ".txt"}
  ext = Path(file.filename).suffix.lower()
  if ext not in allowed_extensions:
    raise HTTPException(status_code=400, detail=f"File type {ext} not allowed") 
  
  db_note = crud.create_note(db, title=title, description=description, owner_id=current_user.id)
  
  safe_filename = f"{current_user.id}_{file.filename}"
  file_path = UPLOAD_DIR / safe_filename
  
  with open(file_path, "wb") as buffer:
    shutil.copyfileobj(file.file, buffer)
    
  crud.create_attachment(db, filename=file.filename, file_path=str(file_path), note_id=db_note.id)
  write_log(f"User {current_user.email} uploaded {file.filename} to note {db_note.id}")
  
  background_tasks.add_task(notify_note_uploaded, email=current_user.email, filename=file.filename,
    note_id=db_note.id, user_id=current_user.id)
  
  import asyncio
  asyncio.create_task(notify_note_uploaded(email=current_user.email, filename=file.filename, note_id=db_note.id, user_id=current_user.id))

  return db_note

@router.get("/", response_model=PaginatedResponse[NoteRead])
def read_my_notes(pagination: PaginationParams = Depends(), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
  query = db.query(Note).filter(Note.owner_id == current_user.id)  
  total = query.count()
  notes = query.offset(pagination.skip).limit(pagination.limit).all()
  return PaginatedResponse(items=notes, total=total, skip=pagination.skip, limit=pagination.limit,
    has_more=(pagination.skip + len(notes)) < total)

@router.get("/{note_id}/download")
def download_note_attachment(note_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
  attachment = db.query(Attachment).filter(Attachment.note_id == note_id).first()
  if not attachment:
    raise HTTPException(status_code=404, detail="File is not present.")
  note = db.query(Note).filter(Note.id == note_id).first()
  if note.owner_id != current_user.id and current_user.role != "admin":
    raise HTTPException(status_code=403, detail="Not your file")

  return FileResponse(attachment.file_path)