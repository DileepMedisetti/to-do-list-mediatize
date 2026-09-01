from datetime import datetime

from pydantic import BaseModel, Field


# --------------------------------------------------
# CREATE COMMENT
# --------------------------------------------------

class CommentCreate(BaseModel):

    content: str = Field(
        min_length=1,
        max_length=1000
    )


# --------------------------------------------------
# UPDATE COMMENT
# --------------------------------------------------

class CommentUpdate(BaseModel):

    content: str = Field(
        min_length=1,
        max_length=1000
    )


# --------------------------------------------------
# COMMENT RESPONSE
# --------------------------------------------------

class CommentResponse(BaseModel):

    id: int

    content: str

    task_id: int

    user_id: int

    author_name: str

    author_email: str

    created_at: datetime | None = None

    class Config:
        from_attributes = True