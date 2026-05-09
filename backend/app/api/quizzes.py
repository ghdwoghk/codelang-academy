from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.quiz import Quiz
from app.models.lesson import Lesson
from app.models.progress import UserProgress
from app.models.user import User
from app.models.submission import Submission
from app.schemas.quiz import QuizResponse, QuizSubmit, QuizResult
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/quizzes", tags=["Quizzes"])


@router.get("/{lesson_id}", response_model=list[QuizResponse])
def get_quizzes(lesson_id: str, db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).filter(Quiz.lesson_id == lesson_id).order_by(Quiz.order_index).all()
    return [
        QuizResponse(
            id=str(q.id),
            lesson_id=str(q.lesson_id),
            question=q.question,
            options=q.options,
            order_index=q.order_index,
        )
        for q in quizzes
    ]


@router.post("/{lesson_id}/submit", response_model=QuizResult)
def submit_quiz(
    lesson_id: str,
    data: QuizSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    quizzes = db.query(Quiz).filter(Quiz.lesson_id == lesson_id).order_by(Quiz.order_index).all()
    if not quizzes:
        raise HTTPException(status_code=404, detail="No quizzes found for this lesson")

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    score = 0
    total = len(quizzes)
    for q in quizzes:
        user_answers = data.answers
        answered = user_answers.get(str(q.id))
        if answered is not None and answered == q.correct_answer:
            score += 1

    passed = score >= total / 2
    xp_earned = 0
    if passed:
        xp_earned = lesson.xp_reward

    progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id == lesson_id,
    ).first()

    if not progress:
        progress = UserProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            completed=passed,
            score=score,
            attempts=1,
        )
        db.add(progress)
    else:
        progress.attempts += 1
        if passed and not progress.completed:
            progress.completed = True
            progress.score = score

    if xp_earned > 0:
        current_user.xp += xp_earned
        current_user.level = current_user.xp // 100 + 1

    db.commit()
    return QuizResult(score=score, total=total, passed=passed, xp_earned=xp_earned)
