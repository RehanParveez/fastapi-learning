import logging
from abc import ABC, abstractmethod

logger = logging.getLogger("kisan.notifications")

class NotificationAdapter(ABC):
  @abstractmethod
  def send(self, user_id: int, phone: str | None, event: str, data: dict) -> None:
    ...

class ConsoleNotificationAdapter(NotificationAdapter):
  def send(self, user_id: int, phone: str | None, event: str, data: dict) -> None:
    logger.info(f"[NOTIFY] user={user_id} phone={phone} event={event} data={data}")

notification_adapter: NotificationAdapter = ConsoleNotificationAdapter()
