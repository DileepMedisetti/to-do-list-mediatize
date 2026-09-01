from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user

from models.user import User
from models.task import Task
from models.comment import Comment

from schemas.comment import (
    CommentCreate,
    CommentUpdate,
    CommentResponse
)


router = APIRouter(
    tags=["Comments"]
)


# ==================================================
# ADD COMMENT
# ==================================================

@router.post(
    "/tasks/{task_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED
)
def add_comment(
    task_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # CHECK TASK
    # --------------------------------------------------

    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # --------------------------------------------------
    # CREATE COMMENT
    # --------------------------------------------------

    new_comment = Comment(
        content=comment_data.content,
        task_id=task_id,
        user_id=current_user.id
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    # --------------------------------------------------
    # RETURN COMMENT WITH AUTHOR
    # --------------------------------------------------

    return {
        "id": new_comment.id,
        "content": new_comment.content,
        "task_id": new_comment.task_id,
        "user_id": new_comment.user_id,
        "author_name": current_user.full_name,
        "author_email": current_user.email,
        "created_at": new_comment.created_at
    }


# ==================================================
# GET COMMENTS FOR TASK
# ==================================================

@router.get(
    "/tasks/{task_id}/comments",
    response_model=list[CommentResponse]
)
def get_task_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # CHECK TASK
    # --------------------------------------------------

    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # --------------------------------------------------
    # GET COMMENTS + USER
    # --------------------------------------------------

    comments = (
        db.query(Comment, User)
        .join(
            User,
            Comment.user_id == User.id
        )
        .filter(
            Comment.task_id == task_id
        )
        .order_by(
            Comment.created_at.asc()
        )
        .all()
    )

    # --------------------------------------------------
    # BUILD RESPONSE
    # --------------------------------------------------

    result = []

    for comment, user in comments:

        result.append({
            "id": comment.id,
            "content": comment.content,
            "task_id": comment.task_id,
            "user_id": comment.user_id,
            "author_name": user.full_name,
            "author_email": user.email,
            "created_at": comment.created_at
        })

    return result


# ==================================================
# UPDATE OWN COMMENT
# ==================================================

@router.put(
    "/comments/{comment_id}",
    response_model=CommentResponse
)
def update_comment(
    comment_id: int,
    comment_data: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # FIND COMMENT
    # --------------------------------------------------

    comment = db.query(Comment).filter(
        Comment.id == comment_id
    ).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # --------------------------------------------------
    # CHECK COMMENT OWNER
    # --------------------------------------------------

    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own comments"
        )

    # --------------------------------------------------
    # UPDATE
    # --------------------------------------------------

    comment.content = comment_data.content

    db.commit()
    db.refresh(comment)

    # --------------------------------------------------
    # RETURN UPDATED COMMENT
    # --------------------------------------------------

    return {
        "id": comment.id,
        "content": comment.content,
        "task_id": comment.task_id,
        "user_id": comment.user_id,
        "author_name": current_user.full_name,
        "author_email": current_user.email,
        "created_at": comment.created_at
    }


# ==================================================
# DELETE OWN COMMENT
# ==================================================

@router.delete(
    "/comments/{comment_id}"
)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # FIND COMMENT
    # --------------------------------------------------

    comment = db.query(Comment).filter(
        Comment.id == comment_id
    ).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # --------------------------------------------------
    # CHECK COMMENT OWNER
    # --------------------------------------------------

    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments"
        )

    # --------------------------------------------------
    # DELETE
    # --------------------------------------------------

    db.delete(comment)
    db.commit()

    return {
        "message": "Comment deleted successfully"
    }