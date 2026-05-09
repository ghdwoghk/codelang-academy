import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column, String, Text, Integer, Boolean, DateTime, ForeignKey, Float,
)
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    lesson_id = Column(
        UUID(as_uuid=True),
        ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=False,
    )
    code = Column(Text, nullable=False)
    language = Column(String(50), nullable=False)
    status = Column(
        String(20), nullable=False, default="pending"
    )
    actual_output = Column(Text, nullable=True)
    expected_output = Column(Text, nullable=True)
    passed = Column(Boolean, nullable=True)
    execution_time_ms = Column(Float, nullable=True)
    memory_used_kb = Column(Float, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    graded_at = Column(DateTime(timezone=True), nullable=True)
