import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class Badge(Base):
    __tablename__ = "badges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon_url = Column(String(500), nullable=True)
    criteria = Column(JSON, nullable=True)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class UserBadge(Base):
    __tablename__ = "user_badges"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    badge_id = Column(
        UUID(as_uuid=True),
        ForeignKey("badges.id", ondelete="CASCADE"),
        primary_key=True,
    )
    earned_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
