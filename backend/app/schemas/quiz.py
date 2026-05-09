from pydantic import BaseModel
from typing import Optional


class QuizResponse(BaseModel):
    id: str
    lesson_id: str
    question: str
    options: list
    order_index: int

    class Config:
        from_attributes = True


class QuizSubmit(BaseModel):
    lesson_id: str
    answers: dict


class QuizResult(BaseModel):
    score: int
    total: int
    passed: bool
    xp_earned: int
