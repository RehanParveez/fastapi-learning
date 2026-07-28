def write_log(message: str):
  with open("app.log", mode="a", encoding="utf-8") as log_file:
    log_file.write(f"{message}\n")

def send_welcome_email(email: str, username: str):
  print(f"BACKGROUND TASK: Sending welcome email to {email} ({username})")

def notify_admin_new_user(username: str):
  print(f"BACKGROUND TASK: Admin alert — new user registered: {username}")

def notify_task_created(email: str, task_title: str):
  print(f"BACKGROUND TASK: Notifying {email} about task '{task_title}'")