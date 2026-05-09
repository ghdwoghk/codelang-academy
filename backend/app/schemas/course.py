from pydantic import BaseModel
from typing import Optional


class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    language: str
    difficulty: str = "beginner"
    icon: Optional[str] = None
    color: Optional[str] = None
    order_index: int = 0


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    order_index: Optional[int] = None
    is_published: Optional[bool] = None


class CourseResponse(CourseBase):
    id: str
    is_published: bool
    lesson_count: int = 0
    created_at: str

    class Config:
        from_attributes = True


class CourseListResponse(BaseModel):
    courses: list[CourseResponse]
    total: int
