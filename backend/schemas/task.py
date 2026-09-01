from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class TaskCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=200
    )

    description: Optional[str] = None

    assigned_user_email: EmailStr

    due_date: Optional[date] = None

    priority: str = "Medium"

    status: str = "To Do"

    progress: int = Field(
        default=0,
        ge=0,
        le=100
    )


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200
    )

    description: Optional[str] = None

    assigned_user_email: Optional[EmailStr] = None

    due_date: Optional[date] = None

    priority: Optional[str] = None

    status: Optional[str] = None

    progress: Optional[int] = Field(
        default=None,
        ge=0,
        le=100
    )


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]

    created_by_id: int
    assigned_user_id: int

    due_date: Optional[date]

    priority: str
    status: str
    progress: int

    created_at: Optional[datetime]

    class Config:
        from_attributes = True