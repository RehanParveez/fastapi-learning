from app.websocket.manager import manager

def write_log(message: str):
  with open("app.log", mode="a", encoding="utf-8") as log_file:
    log_file.write(f"{message}\n")

async def send_welcome_email(email: str, username: str):
  print(f"BACKGROUND TASK: Sending welcome email to {email} ({username})")

async def notify_admin_new_user(username: str):
  print(f"BACKGROUND TASK: Admin alert — new user registered: {username}")
  await manager.broadcast({"type": "admin_alert", "data": {"message": f"New user registered: {username}"}})

async def notify_task_created(email: str, task_title: str, user_id: int):
  print(f"BACKGROUND TASK: Notifying {email} about task '{task_title}'")
  await manager.send_to_user(user_id=user_id, message={"type": "task_created",
    "data": {"title": task_title, "message": f"Task '{task_title}' created successfully"}})

async def notify_note_uploaded(email: str, filename: str, note_id: int, user_id: int):
  print(f"BACKGROUND TASK: Notifying {email} about uploaded file '{filename}'")
  await manager.send_to_user(
    user_id=user_id,
    message={"type": "note_uploaded", "data": {"filename": filename, "note_id": note_id,
      "message": f"File '{filename}' uploaded to note {note_id}"}})