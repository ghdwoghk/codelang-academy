from pydantic import BaseModel
from typing import Optional


class LessonBase(BaseModel):
    title: str
    content: Optional[str] = None
    lesson_type: str = "reading"
    order_index: int = 0
    xp_reward: int = 10
    estimated_minutes: int = 5
    starter_code: Optional[str] = None
    expected_output: Optional[str] = None


class LessonCreate(LessonBase):
    course_id: str


class LessonResponse(LessonBase):
    id: str
    course_id: str
    is_free: bool
    created_at: str

    class Config:
        from_attributes = True


class LessonDetailResponse(LessonResponse):
    content: str
    starter_code: Optional[str] = None
    expected_output: Optional[str] = None


class LessonListResponse(BaseModel):
    lessons: list[LessonResponse]
    total: int
