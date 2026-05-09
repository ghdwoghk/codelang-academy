from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.progress import UserProgress
from app.models.lesson import Lesson
from app.models.badge import UserBadge, Badge
from app.schemas.progress import (
    ProgressResponse,
    UserStatsResponse,
    LeaderboardEntry,
    LeaderboardResponse,
)
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/progress", tags=["Progress"])


@router.get("/stats", response_model=UserStatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    completed = (
        db.query(func.count(UserProgress.id))
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.completed == True,
        )
        .scalar()
        or 0
    )
    total = db.query(func.count(Lesson.id)).scalar() or 1

    return UserStatsResponse(
        total_xp=current_user.xp,
        level=current_user.level,
        streak=current_user.streak,
        completed_lessons=completed,
        total_lessons=total,
        completion_percentage=round((completed / total) * 100, 1),
    )


@router.get("/lessons", response_model=list[ProgressResponse])
def get_lesson_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    progress_list = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == current_user.id)
        .all()
    )
    return [
        ProgressResponse(
            lesson_id=str(p.lesson_id),
            completed=p.completed,
            score=p.score,
            attempts=p.attempts,
        )
        for p in progress_list
    ]


@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(limit: int = 50, db: Session = Depends(get_db)):
    users = (
        db.query(User)
        .order_by(User.xp.desc())
        .limit(limit)
        .all()
    )
    entries = [
        LeaderboardEntry(
            user_id=str(u.id),
            username=u.username,
            xp=u.xp,
            level=u.level,
            streak=u.streak,
            avatar_url=u.avatar_url,
        )
        for u in users
    ]
    return LeaderboardResponse(entries=entries)


@router.get("/badges")
def get_badges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_badges = (
        db.query(Badge)
        .join(UserBadge)
        .filter(UserBadge.user_id == current_user.id)
        .all()
    )
    return [
        {
            "id": str(b.id),
            "name": b.name,
            "description": b.description,
            "icon_url": b.icon_url,
        }
        for b in user_badges
    ]
