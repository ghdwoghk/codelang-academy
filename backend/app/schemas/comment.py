from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[str] = None


class CommentResponse(BaseModel):
    id: str
    user_id: str
    username: str
    lesson_id: str
    parent_id: Optional[str] = None
    content: str
    is_solution: bool
    created_at: str
    replies: list["CommentResponse"] = []

    class Config:
        from_attributes = True
