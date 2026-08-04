from fastapi import WebSocket
from collections import defaultdict
import asyncio

class ConnectionManager:
  def __init__(self):
    self.active_connections: dict[int, list[WebSocket]] = defaultdict(list)
    self.loop: asyncio.AbstractEventLoop | None = None
    
  def set_loop(self, loop: asyncio.AbstractEventLoop):
    self.loop = loop
    
  async def connect(self, user_id: int, websocket: WebSocket):
    await websocket.accept()
    self.active_connections[user_id].append(websocket)
    
  def disconnect(self, user_id: int, websocket: WebSocket):
    if websocket in self.active_connections.get(user_id, []):
      self.active_connections[user_id].remove(websocket)
    if not self.active_connections.get(user_id):
      self.active_connections.pop(user_id, None)
      
  async def _send(self, user_id: int, message: dict):
    for connection in list(self.active_connections.get(user_id, [])):
      try:
        await connection.send_json(message)
      except Exception:
        self.disconnect(user_id, connection)
        
  def notify(self, user_id: int, event: str, data: dict):
    if self.loop is None:
      return
    message = {"event": event, "data": data}
    asyncio.run_coroutine_threadsafe(self._send(user_id, message), self.loop)

manager = ConnectionManager()