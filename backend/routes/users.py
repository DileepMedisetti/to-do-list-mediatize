from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models.user import User
from schemas.auth import UserResponse


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# Get currently logged-in user's profile
@router.get(
    "/me",
    response_model=UserResponse
)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user


# Get all team members or search by name
@router.get(
    "/",
    response_model=list[UserResponse]
)
def get_team_members(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(User)

    # Search by full name
    if search:
        query = query.filter(
            User.full_name.ilike(f"%{search}%")
        )

    return query.all()