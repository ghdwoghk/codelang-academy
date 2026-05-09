import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    language = Column(String(50), nullable=False)
    difficulty = Column(String(20), nullable=False, default="beginner")
    icon = Column(String(100), nullable=True)
    color = Column(String(20), nullable=True)
    order_index = Column(Integer, default=0)
    is_published = Column(Boolean, default=False)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
