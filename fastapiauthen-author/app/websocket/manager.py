from typing import Dict, List 
from fastapi import WebSocket
import json

class ConnectionManager:
  def __init__(self):
    self.active_connections: Dict[int, List[WebSocket]] = {}

  async def connect(self, websocket: WebSocket, user_id: int):
    await websocket.accept()
    if user_id not in self.active_connections:
      self.active_connections[user_id] = []
    self.active_connections[user_id].append(websocket)

  def disconnect(self, websocket: WebSocket, user_id: int):
    if user_id in self.active_connections:
      self.active_connections[user_id].remove(websocket)
      if not self.active_connections[user_id]:
        del self.active_connections[user_id]

  async def send_to_user(self, user_id: int, message: dict):
    if user_id not in self.active_connections:
      return
        
    payload = json.dumps(message)
    for connection in self.active_connections[user_id][:]:
      try:
        await connection.send_text(payload)
      except Exception:
        pass

  async def broadcast(self, message: dict):
    payload = json.dumps(message)
    for user_id, connections in list(self.active_connections.items()):
      for connection in connections[:]:
        try:
          await connection.send_text(payload)
        except Exception:
          pass
      
manager = ConnectionManager()