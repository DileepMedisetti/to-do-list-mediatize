import { useState } from "react";
import { toast } from "react-toastify";

import api from "../api/axios";
import "../css/task-form.css";

function EditTaskForm({ task, onClose, onUpdated }) {

    const [formData, setFormData] = useState({
        title: task.title || "",
        description: task.description || "",
        assigned_user_email: task.assigned_user_email || "",
        due_date: task.due_date
            ? task.due_date.substring(0, 10)
            : "",
        priority: task.priority || "Medium",
        status: task.status || "To Do",
        progress: task.progress ?? 0
    });

    const [loading, setLoading] = useState(false);


    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: name === "progress"
                ? Number(value)
                : value
        }));
    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        setLoading(true);

        try {

            const response = await api.put(
                `/tasks/${task.id}`,
                formData
            );

            toast.success(
                "Task updated successfully!"
            );

            onUpdated(response.data);

            onClose();

        } catch (error) {

            console.error(
                "Update task error:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                "Failed to update task"
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div
            className="task-modal-overlay"
            onClick={onClose}
        >

            <div
                className="task-modal"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >

                {/* HEADER */}

                <div className="task-modal-header">

                    <div>

                        <h2>
                            Edit Task
                        </h2>

                        <p>
                            Update task details
                        </p>

                    </div>

                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>


                {/* FORM */}

                <form onSubmit={handleSubmit}>

                    {/* TITLE */}

                    <div className="task-form-group">

                        <label htmlFor="edit-title">
                            Task Title
                        </label>

                        <input
                            id="edit-title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* DESCRIPTION */}

                    <div className="task-form-group">

                        <label htmlFor="edit-description">
                            Description
                        </label>

                        <textarea
                            id="edit-description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter task description"
                        />

                    </div>


                    {/* ASSIGNED USER */}

                    <div className="task-form-group">

                        <label htmlFor="edit-assigned-user">
                            Assign User
                        </label>

                        <input
                            id="edit-assigned-user"
                            type="email"
                            name="assigned_user_email"
                            value={
                                formData.assigned_user_email
                            }
                            onChange={handleChange}
                            placeholder="Enter user's email"
                        />

                    </div>


                    {/* DUE DATE */}

                    <div className="task-form-group">

                        <label htmlFor="edit-due-date">
                            Due Date
                        </label>

                        <input
                            id="edit-due-date"
                            type="date"
                            name="due_date"
                            value={formData.due_date}
                            onChange={handleChange}
                        />

                    </div>


                    {/* PRIORITY + STATUS */}

                    <div className="task-form-row">

                        <div className="task-form-group">

                            <label htmlFor="edit-priority">
                                Priority
                            </label>

                            <select
                                id="edit-priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                            >

                                <option value="Low">
                                    Low
                                </option>

                                <option value="Medium">
                                    Medium
                                </option>

                                <option value="High">
                                    High
                                </option>

                            </select>

                        </div>


                        <div className="task-form-group">

                            <label htmlFor="edit-status">
                                Status
                            </label>

                            <select
                                id="edit-status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
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

                    </div>


                    {/* PROGRESS */}

                    <div className="task-form-group">

                        <label htmlFor="edit-progress">
                            Progress: {formData.progress}%
                        </label>

                        <input
                            id="edit-progress"
                            type="range"
                            name="progress"
                            min="0"
                            max="100"
                            value={formData.progress}
                            onChange={handleChange}
                        />

                    </div>


                    {/* ACTIONS */}

                    <div className="task-form-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="create-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Updating..."
                                : "Update Task"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default EditTaskForm;