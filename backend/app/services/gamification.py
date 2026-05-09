from sqlalchemy.orm import Session

from app.models.user import User
from app.models.progress import UserProgress
from app.models.lesson import Lesson
from app.models.badge import Badge, UserBadge


XP_PER_LEVEL = 100


def add_xp(user: User, amount: int, db: Session):
    user.xp += amount
    user.level = (user.xp // XP_PER_LEVEL) + 1
    db.flush()
    check_badges(user, db)


def check_badges(user: User, db: Session):
    completed_count = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == user.id, UserProgress.completed == True)
        .count()
    )

    badge_checks = [
        ("First Steps", completed_count >= 1),
        ("Code Master", completed_count >= 10),
        ("Streak King", user.streak >= 7),
    ]

    for badge_name, condition in badge_checks:
        if not condition:
            continue
        badge = db.query(Badge).filter(Badge.name == badge_name).first()
        if not badge:
            continue
        existing = (
            db.query(UserBadge)
            .filter(
                UserBadge.user_id == user.id,
                UserBadge.badge_id == badge.id,
            )
            .first()
        )
        if not existing:
            db.add(UserBadge(user_id=user.id, badge_id=badge.id))
