import { useState } from "react";
import { toast } from "react-toastify";

import api from "../api/axios";

import "../css/task-card.css";


function TaskCard({
    task,
    currentUser,
    onEdit,
    onDelete,
    onTaskUpdated
}) {

    // =========================================
    // STATE
    // =========================================

    const [updatingStatus, setUpdatingStatus] = useState(false);


    // =========================================
    // USER PERMISSIONS
    // =========================================

    const isCreator =
        currentUser &&
        Number(task.created_by_id) === Number(currentUser.id);


    const isAssignedUser =
        currentUser &&
        Number(task.assigned_user_id) === Number(currentUser.id);


    // Creator can edit task details
    const canEdit =
        isCreator;


    // Only creator can delete
    const canDelete =
        isCreator;


    // Assigned user can update status
    const canUpdateStatus =
        isAssignedUser;


    // =========================================
    // UPDATE STATUS
    // =========================================

    const handleStatusChange = async (event) => {

        const newStatus = event.target.value;


        if (!newStatus) {
            return;
        }


        try {

            setUpdatingStatus(true);


            const response = await api.patch(
                `/tasks/${task.id}/status`,
                {
                    status: newStatus
                }
            );


            // Send updated task back to Dashboard
            if (onTaskUpdated) {
                onTaskUpdated(response.data);
            }


            toast.success(
                "Task status updated successfully!"
            );


        } catch (error) {

            console.error(
                "Update status error:",
                error
            );


            // -----------------------------------------
            // UNAUTHORIZED
            // -----------------------------------------

            if (
                error.response?.status === 401
            ) {

                localStorage.removeItem(
                    "access_token"
                );

                window.location.href = "/login";

                return;
            }


            // -----------------------------------------
            // FORBIDDEN
            // -----------------------------------------

            if (
                error.response?.status === 403
            ) {

                toast.error(
                    "Only the assigned user can update task status"
                );

                return;
            }


            toast.error(
                error.response?.data?.detail ||
                "Failed to update task status"
            );

        } finally {

            setUpdatingStatus(false);

        }
    };


    // =========================================
    // FORMAT DATE
    // =========================================

    const formatDate = (date) => {

        if (!date) {
            return "No due date";
        }


        try {

            return new Date(date).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        } catch {

            return date;
        }
    };


    // =========================================
    // STATUS CLASS
    // =========================================

    const getStatusClass = (status) => {

        if (status === "Completed") {
            return "status-completed";
        }


        if (status === "In Progress") {
            return "status-progress";
        }


        return "status-todo";
    };


    // =========================================
    // PRIORITY CLASS
    // =========================================

    const getPriorityClass = (priority) => {

        if (priority === "High") {
            return "priority-high";
        }


        if (priority === "Low") {
            return "priority-low";
        }


        return "priority-medium";
    };


    // =========================================
    // RENDER
    // =========================================

    return (

        <div className="task-card">


            {/* =====================================
                HEADER
            ===================================== */}

            <div className="task-card-header">

                <h2>
                    {task.title}
                </h2>


                <div className="task-badges">

                    <span
                        className={
                            `status-badge ${
                                getStatusClass(
                                    task.status
                                )
                            }`
                        }
                    >
                        {task.status || "To Do"}
                    </span>


                    <span
                        className={
                            `priority-badge ${
                                getPriorityClass(
                                    task.priority
                                )
                            }`
                        }
                    >
                        {task.priority || "Medium"}
                    </span>

                </div>

            </div>


            {/* =====================================
                DESCRIPTION
            ===================================== */}

            <p className="task-description">

                {task.description ||
                    "No description"}

            </p>


            {/* =====================================
                ASSIGNED USER
            ===================================== */}

            {task.assigned_user_email && (

                <div className="task-info">

                    <strong>
                        Assigned to:
                    </strong>


                    <span>
                        {task.assigned_user_email}
                    </span>

                </div>

            )}


            {/* =====================================
                DUE DATE
            ===================================== */}

            <div className="task-info">

                <strong>
                    Due date:
                </strong>


                <span>
                    {formatDate(
                        task.due_date
                    )}
                </span>

            </div>


            {/* =====================================
                PROGRESS
            ===================================== */}

            <div className="task-progress">

                <div className="progress-header">

                    <span>
                        Progress
                    </span>


                    <strong>
                        {task.progress ?? 0}%
                    </strong>

                </div>


                <div className="progress-bar">

                    <div
                        className="progress-fill"
                        style={{
                            width: `${
                                task.progress ?? 0
                            }%`
                        }}
                    />

                </div>

            </div>


            {/* =====================================
                ASSIGNED USER STATUS CONTROL
            ===================================== */}

            {canUpdateStatus && (

                <div className="task-status-control">

                    <label htmlFor={`status-${task.id}`}>
                        Update Status
                    </label>


                    <select
                        id={`status-${task.id}`}
                        value={task.status || "To Do"}
                        onChange={handleStatusChange}
                        disabled={updatingStatus}
                    >

                        <option value="To Do">
                            To Do
                        </option>

                        <option value="In Progress">
                            In Progress
                        </option>

                        <option value="Completed">
                            Completed
                        </option>

                    </select>

                </div>

            )}


            {/* =====================================
                CREATOR ACTIONS
            ===================================== */}

            {(canEdit || canDelete) && (

                <div className="task-actions">


                    {/* EDIT */}

                    {canEdit && (

                        <button
                            type="button"
                            className="edit-btn"
                            onClick={() =>
                                onEdit(task)
                            }
                        >
                            Edit
                        </button>

                    )}


                    {/* DELETE */}

                    {canDelete && (

                        <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                                onDelete(task)
                            }
                        >
                            Delete
                        </button>

                    )}

                </div>

            )}

        </div>
    );
}


export default TaskCard;