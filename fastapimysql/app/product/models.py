from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DATETIME
from datetime import datetime, timezone
from app.db.config import Base

class Product(Base):
  __tablename__ = "products"
  id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
  title: Mapped[str] = mapped_column(String(255), nullable=False)
  created_at: Mapped[datetime] = mapped_column(DATETIME(timezone=True), default=lambda: datetime.now(timezone.utc))