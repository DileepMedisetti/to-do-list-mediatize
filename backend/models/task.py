from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    created_by_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    assigned_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    due_date = Column(
        Date,
        nullable=True
    )

    priority = Column(
        String(20),
        nullable=False,
        default="Medium"
    )

    status = Column(
        String(20),
        nullable=False,
        default="To Do"
    )

    progress = Column(
        Integer,
        nullable=False,
        default=0
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # User who created the task
    creator = relationship(
        "User",
        foreign_keys=[created_by_id]
    )

    # User assigned to the task
    assigned_user = relationship(
        "User",
        foreign_keys=[assigned_user_id]
    )