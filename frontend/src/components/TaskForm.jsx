import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "../api/axios";
import "../css/task-form.css";


function TaskForm({ onClose, onTaskCreated }) {

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        assigned_user_email: "",
        due_date: "",
        priority: "Medium",
        status: "To Do",
        progress: 0
    });

    const [users, setUsers] = useState([]);
    const [searchUser, setSearchUser] = useState("");
    const [showUsers, setShowUsers] = useState(false);

    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loading, setLoading] = useState(false);


    // ==================================================
    // FETCH USERS
    // ==================================================

    useEffect(() => {

        const fetchUsers = async () => {

            try {

                setLoadingUsers(true);

                const response = await api.get("/users/");

                setUsers(response.data);

            } catch (error) {

                console.error(
                    "Failed to fetch users:",
                    error
                );

                toast.error(
                    error.response?.data?.detail ||
                    "Failed to load team members"
                );

            } finally {

                setLoadingUsers(false);
            }
        };

        fetchUsers();

    }, []);


    // ==================================================
    // HANDLE INPUT
    // ==================================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    // ==================================================
    // SEARCH USERS
    // ==================================================

    const filteredUsers = users.filter((user) => {

        const search = searchUser.toLowerCase();

        return (
            user.full_name?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search)
        );
    });


    // ==================================================
    // SELECT USER
    // ==================================================

    const handleSelectUser = (user) => {

        setFormData((previous) => ({
            ...previous,
            assigned_user_email: user.email
        }));

        setSearchUser(
            `${user.full_name} (${user.email})`
        );

        setShowUsers(false);
    };


    // ==================================================
    // HANDLE PROGRESS
    // ==================================================

    const handleProgressChange = (event) => {

        let value = Number(event.target.value);

        if (value < 0) {
            value = 0;
        }

        if (value > 100) {
            value = 100;
        }

        setFormData((previous) => ({
            ...previous,
            progress: value
        }));
    };


    // ==================================================
    // HANDLE STATUS
    // ==================================================

    const handleStatusChange = (event) => {

        const status = event.target.value;

        setFormData((previous) => ({
            ...previous,
            status,
            progress:
                status === "Completed"
                    ? 100
                    : previous.progress
        }));
    };


    // ==================================================
    // CREATE TASK
    // ==================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        // ----------------------------------------------
        // VALIDATION
        // ----------------------------------------------

        if (!formData.assigned_user_email) {

            toast.error(
                "Please select a team member"
            );

            return;
        }


        if (
            formData.progress < 0 ||
            formData.progress > 100
        ) {

            toast.error(
                "Progress must be between 0 and 100"
            );

            return;
        }


        setLoading(true);


        try {

            const response = await api.post(
                "/tasks/",
                {
                    ...formData,
                    progress: Number(formData.progress)
                }
            );


            // ------------------------------------------
            // SUCCESS
            // ------------------------------------------

            toast.success(
                "Task created successfully!"
            );


            // Send new task to Dashboard

            if (onTaskCreated) {
                onTaskCreated(response.data);
            }


            // Close modal

            onClose();

        } catch (error) {

            console.error(
                "Create task error:",
                error
            );

            const detail =
                error.response?.data?.detail;

            toast.error(
                detail ||
                "Failed to create task"
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


                {/* ==================================
                    HEADER
                ================================== */}

                <div className="task-modal-header">

                    <div>

                        <h2>
                            Create Task
                        </h2>

                        <p>
                            Add a new task for your team
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


                {/* ==================================
                    FORM
                ================================== */}

                <form onSubmit={handleSubmit}>


                    {/* TITLE */}

                    <div className="task-form-group">

                        <label htmlFor="title">
                            Task Title
                        </label>

                        <input
                            id="title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter task title"
                            required
                        />

                    </div>


                    {/* DESCRIPTION */}

                    <div className="task-form-group">

                        <label htmlFor="description">
                            Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the task"
                            rows="4"
                        />

                    </div>


                    {/* ASSIGNED USER */}

                    <div className="task-form-group">

                        <label>
                            Assigned User
                        </label>


                        <div className="user-search-wrapper">

                            <input
                                type="text"
                                value={searchUser}
                                onChange={(event) => {

                                    setSearchUser(
                                        event.target.value
                                    );

                                    setShowUsers(true);

                                    setFormData(
                                        (previous) => ({
                                            ...previous,
                                            assigned_user_email: ""
                                        })
                                    );
                                }}
                                onFocus={() =>
                                    setShowUsers(true)
                                }
                                placeholder={
                                    loadingUsers
                                        ? "Loading team members..."
                                        : "Search by name or email"
                                }
                                disabled={loadingUsers}
                                required
                            />


                            {showUsers && !loadingUsers && (

                                <div className="user-dropdown">

                                    {filteredUsers.length > 0 ? (

                                        filteredUsers.map((user) => (

                                            <button
                                                type="button"
                                                className="user-option"
                                                key={user.id}
                                                onClick={() =>
                                                    handleSelectUser(user)
                                                }
                                            >

                                                <strong>
                                                    {user.full_name}
                                                </strong>

                                                <span>
                                                    {user.email}
                                                </span>

                                            </button>

                                        ))

                                    ) : (

                                        <div className="no-users">
                                            No team members found
                                        </div>

                                    )}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* DATE + PRIORITY */}

                    <div className="task-form-row">


                        {/* DUE DATE */}

                        <div className="task-form-group">

                            <label htmlFor="due_date">
                                Due Date
                            </label>

                            <input
                                id="due_date"
                                type="date"
                                name="due_date"
                                value={formData.due_date}
                                onChange={handleChange}
                            />

                        </div>


                        {/* PRIORITY */}

                        <div className="task-form-group">

                            <label htmlFor="priority">
                                Priority
                            </label>

                            <select
                                id="priority"
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

                    </div>


                    {/* STATUS + PROGRESS */}

                    <div className="task-form-row">


                        {/* STATUS */}

                        <div className="task-form-group">

                            <label htmlFor="status">
                                Status
                            </label>

                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleStatusChange}
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


                        {/* PROGRESS */}

                        <div className="task-form-group">

                            <label htmlFor="progress">
                                Progress %
                            </label>

                            <input
                                id="progress"
                                type="number"
                                name="progress"
                                min="0"
                                max="100"
                                value={formData.progress}
                                onChange={handleProgressChange}
                            />

                        </div>

                    </div>


                    {/* ==================================
                        ACTIONS
                    ================================== */}

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
                                ? "Creating..."
                                : "Create Task"}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


export default TaskForm;