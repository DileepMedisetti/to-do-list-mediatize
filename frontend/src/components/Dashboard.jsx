import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import TaskForm from "./TaskForm";
import EditTaskForm from "./EditTaskForm";

import api from "../api/axios";
import "../css/Dashboard.css";


function Dashboard() {

    const navigate = useNavigate();


    // ==================================================
    // STATE
    // ==================================================

    const [tasks, setTasks] = useState([]);

    const [currentUser, setCurrentUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [showTaskForm, setShowTaskForm] =
        useState(false);

    const [showEditForm, setShowEditForm] =
        useState(false);

    const [selectedTask, setSelectedTask] =
        useState(null);

    // DELETE CONFIRMATION TASK
    const [deleteTask, setDeleteTask] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [priorityFilter, setPriorityFilter] =
        useState("All");


    // ==================================================
    // UNAUTHORIZED
    // ==================================================

    const handleUnauthorized = () => {

        localStorage.removeItem(
            "access_token"
        );

        toast.error(
            "Session expired. Please login again."
        );

        navigate("/login", {
            replace: true
        });
    };


    // ==================================================
    // LOGOUT
    // ==================================================

    const handleLogout = () => {

        localStorage.removeItem(
            "access_token"
        );

        toast.success(
            "Logged out successfully"
        );

        navigate("/login", {
            replace: true
        });
    };


    // ==================================================
    // FETCH CURRENT USER
    // ==================================================

    const fetchCurrentUser = async () => {

        try {

            const response =
                await api.get("/users/me");

            setCurrentUser(
                response.data
            );

        } catch (error) {

            console.error(
                "Failed to fetch current user:",
                error
            );

            if (
                error.response?.status === 401
            ) {

                handleUnauthorized();

                return;
            }

            toast.error(
                error.response?.data?.detail ||
                "Failed to load user profile"
            );
        }
    };


    // ==================================================
    // FETCH TASKS
    // ==================================================

    const fetchTasks = async () => {

        try {

            const response =
                await api.get("/tasks/");

            setTasks(
                response.data
            );

        } catch (error) {

            console.error(
                "Failed to fetch tasks:",
                error
            );

            if (
                error.response?.status === 401
            ) {

                handleUnauthorized();

                return;
            }

            toast.error(
                error.response?.data?.detail ||
                "Failed to load tasks"
            );

        } finally {

            setLoading(false);
        }
    };


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {

        const loadDashboard = async () => {

            setLoading(true);

            await Promise.all([
                fetchCurrentUser(),
                fetchTasks()
            ]);
        };

        loadDashboard();

    }, []);


    // ==================================================
    // TASK CREATED
    // ==================================================

    const handleTaskCreated = (
        newTask
    ) => {

        setTasks(
            previousTasks => [
                newTask,
                ...previousTasks
            ]
        );

        setShowTaskForm(false);

        toast.success(
            "Task created successfully"
        );
    };


    // ==================================================
    // EDIT TASK
    // ONLY CREATOR
    // ==================================================

    const handleEditTask = (
        task
    ) => {

        if (
            task.created_by_id !==
            currentUser?.id
        ) {

            toast.error(
                "Only the task creator can edit this task"
            );

            return;
        }

        setSelectedTask(task);

        setShowEditForm(true);
    };


    // ==================================================
    // TASK UPDATED
    // ==================================================

    const handleTaskUpdated = (
        updatedTask
    ) => {

        setTasks(
            previousTasks =>
                previousTasks.map(
                    task =>
                        task.id ===
                        updatedTask.id
                            ? updatedTask
                            : task
                )
        );

        setShowEditForm(false);

        setSelectedTask(null);

        toast.success(
            "Task updated successfully"
        );
    };


    // ==================================================
    // DELETE TASK
    // ONLY CREATOR
    // ==================================================

    const handleDeleteTask = (
        task
    ) => {

        if (
            task.created_by_id !==
            currentUser?.id
        ) {

            toast.error(
                "Only the task creator can delete this task"
            );

            return;
        }

        // Open custom confirmation modal
        setDeleteTask(task);
    };


    // ==================================================
    // CONFIRM DELETE TASK
    // ==================================================

    const confirmDeleteTask = async () => {

        if (!deleteTask) {
            return;
        }


        try {

            await api.delete(
                `/tasks/${deleteTask.id}`
            );


            setTasks(
                previousTasks =>
                    previousTasks.filter(
                        item =>
                            item.id !==
                            deleteTask.id
                    )
            );


            toast.success(
                "Task deleted successfully"
            );


            // Close confirmation modal
            setDeleteTask(null);

        } catch (error) {

            console.error(
                "Delete task error:",
                error
            );

            if (
                error.response?.status === 401
            ) {

                handleUnauthorized();

                return;
            }

            toast.error(
                error.response?.data?.detail ||
                "Failed to delete task"
            );
        }
    };


    // ==================================================
    // UPDATE PROGRESS
    // ONLY ASSIGNED USER
    // ==================================================

    const handleProgressChange = async (
        task,
        progress
    ) => {

        if (
            task.assigned_user_id !==
            currentUser?.id
        ) {

            toast.error(
                "Only the assigned user can update progress"
            );

            return;
        }


        try {

            const response =
                await api.patch(
                    `/tasks/${task.id}/progress`,
                    {
                        progress: Number(
                            progress
                        )
                    }
                );


            setTasks(
                previousTasks =>
                    previousTasks.map(
                        item =>
                            item.id ===
                            task.id
                                ? response.data
                                : item
                    )
            );


            toast.success(
                "Progress updated"
            );

        } catch (error) {

            console.error(
                "Progress update error:",
                error
            );

            if (
                error.response?.status === 401
            ) {

                handleUnauthorized();

                return;
            }

            toast.error(
                error.response?.data?.detail ||
                "Failed to update progress"
            );
        }
    };


    // ==================================================
    // UPDATE STATUS
    // ONLY ASSIGNED USER
    // ==================================================

    const handleStatusChange = async (
        task,
        status
    ) => {

        if (
            task.assigned_user_id !==
            currentUser?.id
        ) {

            toast.error(
                "Only the assigned user can update status"
            );

            return;
        }


        try {

            const response =
                await api.patch(
                    `/tasks/${task.id}/status`,
                    {
                        status
                    }
                );


            setTasks(
                previousTasks =>
                    previousTasks.map(
                        item =>
                            item.id ===
                            task.id
                                ? response.data
                                : item
                    )
            );


            toast.success(
                "Status updated"
            );

        } catch (error) {

            console.error(
                "Status update error:",
                error
            );

            if (
                error.response?.status === 401
            ) {

                handleUnauthorized();

                return;
            }

            toast.error(
                error.response?.data?.detail ||
                "Failed to update status"
            );
        }
    };


    // ==================================================
    // COMPLETE TASK
    // ONLY ASSIGNED USER
    // ==================================================

    const handleCompleteTask = async (
        task
    ) => {

        if (
            task.assigned_user_id !==
            currentUser?.id
        ) {

            toast.error(
                "Only the assigned user can complete this task"
            );

            return;
        }


        try {

            const response =
                await api.patch(
                    `/tasks/${task.id}/complete`
                );


            setTasks(
                previousTasks =>
                    previousTasks.map(
                        item =>
                            item.id ===
                            task.id
                                ? response.data
                                : item
                    )
            );


            toast.success(
                "Task completed successfully"
            );

        } catch (error) {

            console.error(
                "Complete task error:",
                error
            );

            if (
                error.response?.status === 401
            ) {

                handleUnauthorized();

                return;
            }

            toast.error(
                error.response?.data?.detail ||
                "Failed to complete task"
            );
        }
    };


    // ==================================================
    // OVERDUE
    // ==================================================

    const isOverdue = (
        task
    ) => {

        if (!task.due_date) {
            return false;
        }

        if (
            task.status ===
            "Completed"
        ) {
            return false;
        }


        const today =
            new Date();

        const dueDate =
            new Date(
                task.due_date
            );


        today.setHours(
            0,
            0,
            0,
            0
        );

        dueDate.setHours(
            0,
            0,
            0,
            0
        );


        return dueDate < today;
    };


    // ==================================================
    // COUNTS
    // ==================================================

    const totalTasks =
        tasks.length;


    const todoTasks =
        tasks.filter(
            task =>
                task.status ===
                "To Do"
        ).length;


    const inProgressTasks =
        tasks.filter(
            task =>
                task.status ===
                "In Progress"
        ).length;


    const completedTasks =
        tasks.filter(
            task =>
                task.status ===
                "Completed"
        ).length;


    const overdueTasks =
        tasks.filter(
            task =>
                isOverdue(task)
        ).length;


    const myTasks =
        currentUser
            ? tasks.filter(
                task =>
                    task.created_by_id ===
                    currentUser.id
            )
            : [];


    const assignedTasks =
        currentUser
            ? tasks.filter(
                task =>
                    task.assigned_user_id ===
                    currentUser.id
            )
            : [];


    // ==================================================
    // SEARCH + FILTER
    // ==================================================

    const filteredTasks =
        useMemo(() => {

            return tasks.filter(
                task => {

                    const title =
                        task.title
                            ?.toLowerCase() ||
                        "";

                    const searchText =
                        search
                            .toLowerCase()
                            .trim();


                    const matchesSearch =
                        title.includes(
                            searchText
                        );


                    const matchesStatus =
                        statusFilter ===
                            "All" ||
                        task.status ===
                            statusFilter;


                    const matchesPriority =
                        priorityFilter ===
                            "All" ||
                        task.priority ===
                            priorityFilter;


                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesPriority
                    );
                }
            );

        }, [
            tasks,
            search,
            statusFilter,
            priorityFilter
        ]);


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <div className="dashboard-loading">

                <div>
                    Loading dashboard...
                </div>

            </div>
        );
    }


    // ==================================================
    // DASHBOARD
    // ==================================================

    return (

        <div className="dashboard">


            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="dashboard-header">

                <div className="dashboard-title">

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Manage your team's tasks
                    </p>

                </div>


                <div className="dashboard-user">

                    <div className="user-info">

                        <strong>
                            {
                                currentUser?.full_name ||
                                "User"
                            }
                        </strong>

                        <span>
                            {
                                currentUser?.email
                            }
                        </span>

                    </div>


                    <button
                        className="logout-btn"
                        onClick={
                            handleLogout
                        }
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* ==================================================
                STATISTICS
            ================================================== */}

            <section className="stats-grid">

                <div className="stat-card">
                    <span>Total Tasks</span>
                    <strong>
                        {totalTasks}
                    </strong>
                </div>


                <div className="stat-card">
                    <span>To Do</span>
                    <strong>
                        {todoTasks}
                    </strong>
                </div>


                <div className="stat-card">
                    <span>In Progress</span>
                    <strong>
                        {inProgressTasks}
                    </strong>
                </div>


                <div className="stat-card">
                    <span>Completed</span>
                    <strong>
                        {completedTasks}
                    </strong>
                </div>


                <div className="stat-card">
                    <span>Overdue</span>
                    <strong>
                        {overdueTasks}
                    </strong>
                </div>


                <div className="stat-card">
                    <span>My Tasks</span>
                    <strong>
                        {myTasks.length}
                    </strong>
                </div>


                <div className="stat-card">
                    <span>Assigned Tasks</span>
                    <strong>
                        {assignedTasks.length}
                    </strong>
                </div>

            </section>


            {/* ==================================================
                TASK SECTION
            ================================================== */}

            <section className="tasks-section">


                <div className="tasks-header">

                    <div>

                        <h2>
                            Tasks
                        </h2>

                        <p>
                            {filteredTasks.length} task
                            {
                                filteredTasks.length !== 1
                                    ? "s"
                                    : ""
                            }
                        </p>

                    </div>


                    <button
                        className="create-task-btn"
                        onClick={() =>
                            setShowTaskForm(true)
                        }
                    >
                        + Create Task
                    </button>

                </div>


                {/* ==================================================
                    FILTERS
                ================================================== */}

                <div className="task-filters">

                    <input
                        type="text"
                        placeholder="Search tasks by title..."
                        value={search}
                        onChange={
                            event =>
                                setSearch(
                                    event.target.value
                                )
                        }
                    />


                    <select
                        value={statusFilter}
                        onChange={
                            event =>
                                setStatusFilter(
                                    event.target.value
                                )
                        }
                    >

                        <option value="All">
                            All Status
                        </option>

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


                    <select
                        value={priorityFilter}
                        onChange={
                            event =>
                                setPriorityFilter(
                                    event.target.value
                                )
                        }
                    >

                        <option value="All">
                            All Priority
                        </option>

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


                {/* ==================================================
                    TASK LIST
                ================================================== */}

                {
                    filteredTasks.length === 0

                        ? (

                            <div className="empty-tasks">

                                <h3>
                                    No tasks found
                                </h3>

                                <p>
                                    Try changing your
                                    search or filters.
                                </p>

                            </div>

                        )

                        : (

                            <div className="task-grid">

                                {
                                    filteredTasks.map(
                                        task => {

                                            const isCreator =
                                                task.created_by_id ===
                                                currentUser?.id;


                                            const isAssignedUser =
                                                task.assigned_user_id ===
                                                currentUser?.id;


                                            return (

                                                <div
                                                    className="task-card"
                                                    key={
                                                        task.id
                                                    }
                                                >


                                                    {/* ==================================================
                                                        TASK HEADER
                                                    ================================================== */}

                                                    <div className="task-card-header">

                                                        <h3>
                                                            {
                                                                task.title
                                                            }
                                                        </h3>


                                                        <span
                                                            className={
                                                                `priority-badge ${
                                                                    task.priority
                                                                        ?.toLowerCase()
                                                                }`
                                                            }
                                                        >
                                                            {
                                                                task.priority
                                                            }
                                                        </span>

                                                    </div>


                                                    {/* DESCRIPTION */}

                                                    <p className="task-description">

                                                        {
                                                            task.description ||
                                                            "No description"
                                                        }

                                                    </p>


                                                    {/* ==================================================
                                                        ROLE
                                                    ================================================== */}

                                                    <div className="task-role">

                                                        {
                                                            isCreator && (
                                                                <span className="role-badge creator">
                                                                    Creator
                                                                </span>
                                                            )
                                                        }


                                                        {
                                                            isAssignedUser && (
                                                                <span className="role-badge assigned">
                                                                    Assigned to you
                                                                </span>
                                                            )
                                                        }

                                                    </div>


                                                    {/* ==================================================
                                                        STATUS
                                                    ================================================== */}

                                                    <div className="task-detail">

                                                        <span>
                                                            Status
                                                        </span>


                                                        {
                                                            isAssignedUser

                                                                ? (

                                                                    <select
                                                                        className="task-status-select"
                                                                        value={
                                                                            task.status
                                                                        }
                                                                        onChange={
                                                                            event =>
                                                                                handleStatusChange(
                                                                                    task,
                                                                                    event.target.value
                                                                                )
                                                                        }
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

                                                                )

                                                                : (

                                                                    <strong>
                                                                        {
                                                                            task.status
                                                                        }
                                                                    </strong>

                                                                )
                                                        }

                                                    </div>


                                                    {/* ==================================================
                                                        DUE DATE
                                                    ================================================== */}

                                                    <div className="task-detail">

                                                        <span>
                                                            Due Date
                                                        </span>

                                                        <strong>
                                                            {
                                                                task.due_date
                                                                    ? new Date(
                                                                        task.due_date
                                                                    ).toLocaleDateString()
                                                                    : "No due date"
                                                            }
                                                        </strong>

                                                    </div>


                                                    {/* ==================================================
                                                        PROGRESS
                                                    ================================================== */}

                                                    <div className="progress-section">

                                                        <div className="progress-header">

                                                            <span>
                                                                Progress
                                                            </span>

                                                            <span>
                                                                {
                                                                    task.progress ??
                                                                    0
                                                                }%
                                                            </span>

                                                        </div>


                                                        <div className="progress-bar">

                                                            <div
                                                                className="progress-fill"
                                                                style={{
                                                                    width:
                                                                        `${task.progress ?? 0}%`
                                                                }}
                                                            />

                                                        </div>


                                                        {
                                                            isAssignedUser &&
                                                            task.status !==
                                                            "Completed" && (

                                                                <input
                                                                    className="progress-input"
                                                                    type="range"
                                                                    min="0"
                                                                    max="100"
                                                                    value={
                                                                        task.progress ??
                                                                        0
                                                                    }
                                                                    onChange={
                                                                        event =>
                                                                            handleProgressChange(
                                                                                task,
                                                                                event.target.value
                                                                            )
                                                                    }
                                                                />

                                                            )
                                                        }

                                                    </div>


                                                    {/* ==================================================
                                                        OVERDUE
                                                    ================================================== */}

                                                    {
                                                        isOverdue(task) && (

                                                            <div className="overdue-label">
                                                                Overdue
                                                            </div>

                                                        )
                                                    }


                                                    {/* ==================================================
                                                        ACTIONS
                                                    ================================================== */}

                                                    <div className="task-actions">


                                                        {/* CREATOR ACTIONS */}

                                                        {
                                                            isCreator && (

                                                                <>

                                                                    <button
                                                                        className="edit-btn"
                                                                        onClick={() =>
                                                                            handleEditTask(
                                                                                task
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </button>


                                                                    <button
                                                                        className="delete-btn"
                                                                        onClick={() =>
                                                                            handleDeleteTask(
                                                                                task
                                                                            )
                                                                        }
                                                                    >
                                                                        Delete
                                                                    </button>

                                                                </>

                                                            )
                                                        }


                                                        {/* ASSIGNED USER ACTION */}

                                                        {
                                                            isAssignedUser &&
                                                            task.status !==
                                                            "Completed" && (

                                                                <button
                                                                    className="complete-btn"
                                                                    onClick={() =>
                                                                        handleCompleteTask(
                                                                            task
                                                                        )
                                                                    }
                                                                >
                                                                    Mark Complete
                                                                </button>

                                                            )
                                                        }


                                                        {/* VIEW ONLY */}

                                                        {
                                                            !isCreator &&
                                                            !isAssignedUser && (

                                                                <span className="view-only-label">
                                                                    View only
                                                                </span>

                                                            )
                                                        }

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )
                                }

                            </div>
                        )
                }

            </section>


            {/* ==================================================
                CREATE TASK MODAL
            ================================================== */}

            {
                showTaskForm && (

                    <TaskForm

                        onClose={() =>
                            setShowTaskForm(false)
                        }

                        onTaskCreated={
                            handleTaskCreated
                        }

                    />

                )
            }


            {/* ==================================================
                EDIT TASK MODAL
            ================================================== */}

            {
                showEditForm &&
                selectedTask && (

                    <EditTaskForm

                        task={
                            selectedTask
                        }

                        onClose={() => {

                            setShowEditForm(
                                false
                            );

                            setSelectedTask(
                                null
                            );

                        }}

                        onTaskUpdated={
                            handleTaskUpdated
                        }

                    />

                )
            }


            {/* ==================================================
                DELETE CONFIRMATION MODAL
            ================================================== */}

            {
                deleteTask && (

                    <div className="delete-modal-overlay">

                        <div className="delete-modal">

                            <div className="delete-modal-icon">
                                !
                            </div>


                            <h2>
                                Delete Task?
                            </h2>


                            <p>
                                Are you sure you want to delete{" "}
                                <strong>
                                    "{deleteTask.title}"
                                </strong>
                                ?
                            </p>


                            <div className="delete-modal-actions">

                                <button
                                    type="button"
                                    className="delete-cancel-btn"
                                    onClick={() =>
                                        setDeleteTask(null)
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    className="delete-confirm-btn"
                                    onClick={
                                        confirmDeleteTask
                                    }
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </div>
    );
}


export default Dashboard;