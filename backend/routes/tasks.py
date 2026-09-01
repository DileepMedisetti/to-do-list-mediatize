from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from pydantic import BaseModel, Field

from database import get_db
from dependencies import get_current_user

from models.user import User
from models.task import Task

from schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse
)


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


# --------------------------------------------------
# ALLOWED VALUES
# --------------------------------------------------

PRIORITIES = {
    "Low",
    "Medium",
    "High"
}

STATUSES = {
    "To Do",
    "In Progress",
    "Completed"
}


# --------------------------------------------------
# PROGRESS SCHEMA
# --------------------------------------------------

class ProgressUpdate(BaseModel):
    progress: int = Field(
        ge=0,
        le=100
    )


# --------------------------------------------------
# STATUS SCHEMA
# --------------------------------------------------

class StatusUpdate(BaseModel):
    status: str


# ==================================================
# CREATE TASK
# ==================================================

@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED
)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Validate priority
    if task_data.priority not in PRIORITIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Priority must be Low, Medium, or High"
        )

    # Validate status
    if task_data.status not in STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be To Do, In Progress, or Completed"
        )

    # Find assigned user using email
    assigned_user = db.query(User).filter(
        User.email == task_data.assigned_user_email
    ).first()

    if not assigned_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assigned user not found"
        )

    # Completed task must have 100% progress
    if task_data.status == "Completed":
        task_data.progress = 100

    # Create task
    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        created_by_id=current_user.id,
        assigned_user_id=assigned_user.id,
        due_date=task_data.due_date,
        priority=task_data.priority,
        status=task_data.status,
        progress=task_data.progress
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


# ==================================================
# GET ALL TASKS
# ==================================================

@router.get(
    "/",
    response_model=list[TaskResponse]
)
def get_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    tasks = db.query(Task).all()

    return tasks


# ==================================================
# SEARCH TASKS BY TITLE
# ==================================================

@router.get(
    "/search",
    response_model=list[TaskResponse]
)
def search_tasks(
    title: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    tasks = db.query(Task).filter(
        Task.title.ilike(f"%{title}%")
    ).all()

    return tasks


# ==================================================
# GET SINGLE TASK BY ID
# ==================================================

@router.get(
    "/{task_id}",
    response_model=TaskResponse
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


# ==================================================
# UPDATE TASK BY ID
# ==================================================

@router.put(
    "/{task_id}",
    response_model=TaskResponse
)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Find task
    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # --------------------------------------------------
    # ONLY CREATOR CAN EDIT TASK DETAILS
    # --------------------------------------------------

    if task.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the task creator can edit this task"
        )

    # --------------------------------------------------
    # UPDATE ASSIGNED USER
    # --------------------------------------------------

    if task_data.assigned_user_email is not None:

        assigned_user = db.query(User).filter(
            User.email == task_data.assigned_user_email
        ).first()

        if not assigned_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found"
            )

        task.assigned_user_id = assigned_user.id

    # --------------------------------------------------
    # VALIDATE PRIORITY
    # --------------------------------------------------

    if (
        task_data.priority is not None
        and task_data.priority not in PRIORITIES
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Priority must be Low, Medium, or High"
        )

    # --------------------------------------------------
    # VALIDATE STATUS
    # --------------------------------------------------

    if (
        task_data.status is not None
        and task_data.status not in STATUSES
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be To Do, In Progress, or Completed"
        )

    # --------------------------------------------------
    # VALIDATE PROGRESS
    # --------------------------------------------------

    if task_data.progress is not None:

        if task_data.progress < 0 or task_data.progress > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Progress must be between 0 and 100"
            )

    # --------------------------------------------------
    # UPDATE TITLE
    # --------------------------------------------------

    if task_data.title is not None:
        task.title = task_data.title

    # --------------------------------------------------
    # UPDATE DESCRIPTION
    # --------------------------------------------------

    if task_data.description is not None:
        task.description = task_data.description

    # --------------------------------------------------
    # UPDATE DUE DATE
    # --------------------------------------------------

    if task_data.due_date is not None:
        task.due_date = task_data.due_date

    # --------------------------------------------------
    # UPDATE PRIORITY
    # --------------------------------------------------

    if task_data.priority is not None:
        task.priority = task_data.priority

    # --------------------------------------------------
    # UPDATE STATUS
    # --------------------------------------------------

    if task_data.status is not None:
        task.status = task_data.status

    # --------------------------------------------------
    # UPDATE PROGRESS
    # --------------------------------------------------

    if task_data.progress is not None:
        task.progress = task_data.progress

    # --------------------------------------------------
    # STATUS / PROGRESS RULES
    # --------------------------------------------------

    if task.status == "Completed":
        task.progress = 100

    elif task.status == "To Do":
        task.progress = 0

    db.commit()
    db.refresh(task)

    return task


# ==================================================
# UPDATE TASK PROGRESS
# ==================================================

@router.patch(
    "/{task_id}/progress",
    response_model=TaskResponse
)
def update_task_progress(
    task_id: int,
    progress_data: ProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Find task
    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # --------------------------------------------------
    # ONLY ASSIGNED USER CAN UPDATE PROGRESS
    # --------------------------------------------------

    if task.assigned_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the assigned user can update task progress"
        )

    # Update progress
    task.progress = progress_data.progress

    # Automatically update status
    if task.progress == 100:
        task.status = "Completed"

    elif task.progress > 0:
        task.status = "In Progress"

    else:
        task.status = "To Do"

    db.commit()
    db.refresh(task)

    return task


# ==================================================
# UPDATE TASK STATUS
# ==================================================

@router.patch(
    "/{task_id}/status",
    response_model=TaskResponse
)
def update_task_status(
    task_id: int,
    status_data: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Validate status
    if status_data.status not in STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be To Do, In Progress, or Completed"
        )

    # Find task
    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # --------------------------------------------------
    # ONLY ASSIGNED USER CAN UPDATE STATUS
    # --------------------------------------------------

    if task.assigned_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the assigned user can update task status"
        )

    # Update status
    task.status = status_data.status

    # Status / progress synchronization
    if task.status == "Completed":
        task.progress = 100

    elif task.status == "To Do":
        task.progress = 0

    elif task.status == "In Progress" and task.progress == 0:
        task.progress = 1

    db.commit()
    db.refresh(task)

    return task


# ==================================================
# MARK TASK AS COMPLETED
# ==================================================

@router.patch(
    "/{task_id}/complete",
    response_model=TaskResponse
)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Find task
    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # --------------------------------------------------
    # ONLY ASSIGNED USER CAN COMPLETE TASK
    # --------------------------------------------------

    if task.assigned_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the assigned user can complete this task"
        )

    # Complete task
    task.status = "Completed"
    task.progress = 100

    db.commit()
    db.refresh(task)

    return task


# ==================================================
# DELETE TASK BY ID
# ==================================================

@router.delete(
    "/{task_id}"
)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Find task
    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # --------------------------------------------------
    # ONLY CREATOR CAN DELETE TASK
    # --------------------------------------------------

    if task.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the task creator can delete this task"
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }