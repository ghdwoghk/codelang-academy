from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.lesson import Lesson
from app.models.course import Course
from app.schemas.lesson import LessonCreate, LessonResponse, LessonDetailResponse, LessonListResponse

router = APIRouter(prefix="/api/lessons", tags=["Lessons"])


@router.get("", response_model=LessonListResponse)
def list_lessons(course_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Lesson)
    if course_id:
        query = query.filter(Lesson.course_id == course_id)
    query = query.order_by(Lesson.order_index)
    lessons = query.all()
    result = [
        LessonResponse(
            id=str(l.id),
            course_id=str(l.course_id),
            title=l.title,
            content=l.content[:200] + "..." if l.content and len(l.content) > 200 else l.content,
            lesson_type=l.lesson_type,
            order_index=l.order_index,
            xp_reward=l.xp_reward,
            estimated_minutes=l.estimated_minutes,
            starter_code=l.starter_code,
            expected_output=l.expected_output,
            is_free=l.is_free,
            created_at=l.created_at.isoformat(),
        )
        for l in lessons
    ]
    return LessonListResponse(lessons=result, total=len(result))


@router.get("/{lesson_id}", response_model=LessonDetailResponse)
def get_lesson(lesson_id: str, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return LessonDetailResponse(
        id=str(lesson.id),
        course_id=str(lesson.course_id),
        title=lesson.title,
        content=lesson.content or "",
        lesson_type=lesson.lesson_type,
        order_index=lesson.order_index,
        xp_reward=lesson.xp_reward,
        estimated_minutes=lesson.estimated_minutes,
        starter_code=lesson.starter_code,
        expected_output=lesson.expected_output,
        is_free=lesson.is_free,
        created_at=lesson.created_at.isoformat(),
    )


@router.post("", response_model=LessonResponse, status_code=201)
def create_lesson(data: LessonCreate, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    lesson = Lesson(**data.model_dump())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return LessonResponse(
        id=str(lesson.id),
        course_id=str(lesson.course_id),
        title=lesson.title,
        content=lesson.content[:200] + "..." if lesson.content and len(lesson.content) > 200 else lesson.content,
        lesson_type=lesson.lesson_type,
        order_index=lesson.order_index,
        xp_reward=lesson.xp_reward,
        estimated_minutes=lesson.estimated_minutes,
        starter_code=lesson.starter_code,
        expected_output=lesson.expected_output,
        is_free=lesson.is_free,
        created_at=lesson.created_at.isoformat(),
    )
