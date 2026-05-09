from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models.comment import Comment
from app.models.user import User
from app.models.lesson import Lesson
from app.schemas.comment import CommentCreate, CommentResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/comments", tags=["Comments"])


@router.get("/{lesson_id}", response_model=list[CommentResponse])
def list_comments(lesson_id: str, db: Session = Depends(get_db)):
    comments = (
        db.query(Comment)
        .filter(Comment.lesson_id == lesson_id, Comment.parent_id.is_(None))
        .order_by(desc(Comment.created_at))
        .all()
    )

    def build_response(comment: Comment) -> CommentResponse:
        user = db.query(User).filter(User.id == comment.user_id).first()
        replies = (
            db.query(Comment)
            .filter(Comment.parent_id == comment.id)
            .order_by(Comment.created_at)
            .all()
        )
        return CommentResponse(
            id=str(comment.id),
            user_id=str(comment.user_id),
            username=user.username if user else "Unknown",
            lesson_id=str(comment.lesson_id),
            parent_id=str(comment.parent_id) if comment.parent_id else None,
            content=comment.content,
            is_solution=comment.is_solution,
            created_at=comment.created_at.isoformat(),
            replies=[build_response(r) for r in replies],
        )

    return [build_response(c) for c in comments]


@router.post("/{lesson_id}", response_model=CommentResponse, status_code=201)
def create_comment(
    lesson_id: str,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if data.parent_id:
        parent = db.query(Comment).filter(Comment.id == data.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")

    comment = Comment(
        user_id=current_user.id,
        lesson_id=lesson_id,
        parent_id=data.parent_id,
        content=data.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return CommentResponse(
        id=str(comment.id),
        user_id=str(comment.user_id),
        username=current_user.username,
        lesson_id=str(comment.lesson_id),
        parent_id=str(comment.parent_id) if comment.parent_id else None,
        content=comment.content,
        is_solution=comment.is_solution,
        created_at=comment.created_at.isoformat(),
    )


@router.delete("/{comment_id}", status_code=204)
def delete_comment(
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if str(comment.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(comment)
    db.commit()
