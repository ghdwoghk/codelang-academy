import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=True)
    lesson_type = Column(
        String(20), nullable=False, default="reading"
    )
    order_index = Column(Integer, default=0)
    xp_reward = Column(Integer, default=10)
    estimated_minutes = Column(Integer, default=5)
    starter_code = Column(Text, nullable=True)
    expected_output = Column(Text, nullable=True)
    is_free = Column(Boolean, default=True)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
