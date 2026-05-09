from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.submission import Submission
from app.models.lesson import Lesson
from app.models.progress import UserProgress
from app.models.user import User
from app.schemas.submission import CodeSubmit, SubmissionResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/submissions", tags=["Submissions"])


@router.post("", response_model=SubmissionResponse, status_code=201)
def submit_code(
    data: CodeSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson = db.query(Lesson).filter(Lesson.id == data.lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    passed = None
    if lesson.expected_output:
        passed = data.code.strip() == lesson.expected_output.strip()

    submission = Submission(
        user_id=current_user.id,
        lesson_id=data.lesson_id,
        code=data.code,
        language=data.language,
        status="success" if passed is not False else "pending",
        passed=passed,
        expected_output=lesson.expected_output,
    )
    db.add(submission)

    progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id == data.lesson_id,
    ).first()

    if not progress:
        progress = UserProgress(
            user_id=current_user.id,
            lesson_id=data.lesson_id,
            completed=bool(passed),
            attempts=1,
        )
        db.add(progress)
    else:
        progress.attempts += 1
        if passed and not progress.completed:
            progress.completed = True

    if passed and lesson.xp_reward:
        current_user.xp += lesson.xp_reward
        current_user.level = current_user.xp // 100 + 1

    db.commit()
    db.refresh(submission)

    return SubmissionResponse(
        id=str(submission.id),
        lesson_id=str(submission.lesson_id),
        code=submission.code,
        language=submission.language,
        status=submission.status,
        passed=submission.passed,
        execution_time_ms=submission.execution_time_ms,
        error_message=submission.error_message,
        created_at=submission.created_at.isoformat(),
    )


@router.get("/{lesson_id}", response_model=list[SubmissionResponse])
def get_submissions(
    lesson_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    submissions = (
        db.query(Submission)
        .filter(
            Submission.user_id == current_user.id,
            Submission.lesson_id == lesson_id,
        )
        .order_by(desc(Submission.created_at))
        .limit(50)
        .all()
    )
    return [
        SubmissionResponse(
            id=str(s.id),
            lesson_id=str(s.lesson_id),
            code=s.code,
            language=s.language,
            status=s.status,
            passed=s.passed,
            execution_time_ms=s.execution_time_ms,
            error_message=s.error_message,
            created_at=s.created_at.isoformat(),
        )
        for s in submissions
    ]
