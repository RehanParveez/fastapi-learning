from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
import shutil
from pathlib import Path
from app.schemas import NoteRead, TokenData
from app.deps import get_current_user, get_db
from app.db import crud
from app.background import write_log
from app.models import Attachment, Note
from fastapi.responses import FileResponse

router = APIRouter(prefix="/notes", tags=["notes"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post ("/", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note_with_file(title: str = Form(...), description: Optional[str] = Form(""), 
  file: UploadFile = File(...), db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)
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
  
  db_user = crud.get_user_by_email(db, current_user.email)
  db_note = crud.create_note(db, title=title, description=description, owner_id=db_user.id)
  
  safe_filename = f"{db_user.id}_{file.filename}"
  file_path = UPLOAD_DIR / safe_filename
  
  with open(file_path, "wb") as buffer:
    shutil.copyfileobj(file.file, buffer)
    
  db_attachment = crud.create_attachment(db, filename=file.filename, file_path=str(file_path), note_id=db_note.id)
  write_log(f"User {db_user.email} uploaded {file.filename} to note {db_note.id}")
    
  return db_note

@router.get("/", response_model=List[NoteRead])
def read_my_notes(
  db: Session = Depends(get_db),
  current_user: TokenData = Depends(get_current_user)):
    
    db_user = crud.get_user_by_email(db, current_user.email)
    notes = db.query(Note).filter(Note.owner_id == db_user.id).all()
    return notes

@router.get("/{note_id}/download")
def download_note_attachment(note_id: int, db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
  attachment = db.query(Attachment).filter(Attachment.note_id == note_id).first()
  if not attachment:
    raise HTTPException(status_code=404, detail = "file is not pres.")
    
  note = db.query(Note).filter(Note.id == note_id).first()
  db_user = crud.get_user_by_email(db, current_user.email)
  if note.owner_id != db_user.id and current_user.role != "admin":
    raise HTTPException(status_code=403, detail = "not your file")
    
  return FileResponse(attachment.file_path)