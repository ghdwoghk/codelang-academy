from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.course import Course
from app.models.lesson import Lesson
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse, CourseListResponse

router = APIRouter(prefix="/api/courses", tags=["Courses"])


@router.get("", response_model=CourseListResponse)
def list_courses(language: str = None, difficulty: str = None, db: Session = Depends(get_db)):
    query = db.query(Course).filter(Course.is_published == True)
    if language:
        query = query.filter(Course.language == language)
    if difficulty:
        query = query.filter(Course.difficulty == difficulty)
    query = query.order_by(Course.order_index)

    courses = query.all()
    result = []
    for c in courses:
        lesson_count = db.query(Lesson).filter(Lesson.course_id == c.id).count()
        result.append(CourseResponse(
            id=str(c.id),
            title=c.title,
            description=c.description,
            language=c.language,
            difficulty=c.difficulty,
            icon=c.icon,
            color=c.color,
            order_index=c.order_index,
            is_published=c.is_published,
            lesson_count=lesson_count,
            created_at=c.created_at.isoformat(),
        ))
    return CourseListResponse(courses=result, total=len(result))


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    lesson_count = db.query(Lesson).filter(Lesson.course_id == course.id).count()
    return CourseResponse(
        id=str(course.id),
        title=course.title,
        description=course.description,
        language=course.language,
        difficulty=course.difficulty,
        icon=course.icon,
        color=course.color,
        order_index=course.order_index,
        is_published=course.is_published,
        lesson_count=lesson_count,
        created_at=course.created_at.isoformat(),
    )


@router.post("", response_model=CourseResponse, status_code=201)
def create_course(data: CourseCreate, db: Session = Depends(get_db)):
    course = Course(**data.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return CourseResponse(
        id=str(course.id),
        title=course.title,
        description=course.description,
        language=course.language,
        difficulty=course.difficulty,
        icon=course.icon,
        color=course.color,
        order_index=course.order_index,
        is_published=course.is_published,
        lesson_count=0,
        created_at=course.created_at.isoformat(),
    )


@router.put("/{course_id}", response_model=CourseResponse)
def update_course(course_id: str, data: CourseUpdate, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(course, key, val)
    db.commit()
    db.refresh(course)
    lesson_count = db.query(Lesson).filter(Lesson.course_id == course.id).count()
    return CourseResponse(
        id=str(course.id),
        title=course.title,
        description=course.description,
        language=course.language,
        difficulty=course.difficulty,
        icon=course.icon,
        color=course.color,
        order_index=course.order_index,
        is_published=course.is_published,
        lesson_count=lesson_count,
        created_at=course.created_at.isoformat(),
    )


@router.delete("/{course_id}", status_code=204)
def delete_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
