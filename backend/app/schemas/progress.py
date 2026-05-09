from pydantic import BaseModel
from typing import Optional


class ProgressResponse(BaseModel):
    lesson_id: str
    completed: bool
    score: Optional[int] = None
    attempts: int


class UserStatsResponse(BaseModel):
    total_xp: int
    level: int
    streak: int
    completed_lessons: int
    total_lessons: int
    completion_percentage: float


class LeaderboardEntry(BaseModel):
    user_id: str
    username: str
    xp: int
    level: int
    streak: int
    avatar_url: Optional[str] = None


class LeaderboardResponse(BaseModel):
    entries: list[LeaderboardEntry]
