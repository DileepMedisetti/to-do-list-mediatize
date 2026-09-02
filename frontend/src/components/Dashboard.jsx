import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/axios";

import DashboardHeader from "./DashboardHeader";
import TaskFilters from "./TaskFilters";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import EditTaskForm from "./EditTaskForm";
import DeleteTaskModal from "./DeleteTaskModal";

import "../css/dashboard.css";


function Dashboard() {

    const navigate = useNavigate();


    // =========================================
    // STATE
    // =========================================

    const [tasks, setTasks] = useState([]);

    const [currentUser, setCurrentUser] = useState(null);

    const [loading, setLoading] = useState(true);

    const [showTaskModal, setShowTaskModal] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedTask, setSelectedTask] = useState(null);

    const [taskToDelete, setTaskToDelete] = useState(null);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");

    const [priorityFilter, setPriorityFilter] = useState("All");


    // =========================================
    // FETCH CURRENT USER + TASKS
    // =========================================

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                setLoading(true);


                // -----------------------------------------
                // GET LOGGED-IN USER
                // -----------------------------------------

                const userResponse =
                    await api.get("/users/me");

                setCurrentUser(
                    userResponse.data
                );


                // -----------------------------------------
                // GET TASKS
                // -----------------------------------------

                const taskResponse =
                    await api.get("/tasks");

                setTasks(
                    taskResponse.data || []
                );


            } catch (error) {

                console.error(
                    "Dashboard loading error:",
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

                    navigate(
                        "/login",
                        {
                            replace: true
                        }
                    );

                    return;
                }


                toast.error(
                    error.response?.data?.detail ||
                    "Failed to load dashboard"
                );


            } finally {

                setLoading(false);

            }
        };


        loadDashboard();

    }, [navigate]);


    // =========================================
    // CREATE TASK
    // =========================================

    const handleTaskCreated = (newTask) => {

        setTasks((previousTasks) => [

            newTask,

            ...previousTasks

        ]);

        setShowTaskModal(false);

        toast.success(
            "Task created successfully!"
        );
    };


    // =========================================
    // EDIT TASK
    // =========================================

    const handleEditTask = (task) => {

        setSelectedTask(task);

        setShowEditModal(true);
    };


    // =========================================
    // UPDATE TASK
    // =========================================

    const handleTaskUpdated = (updatedTask) => {

        setTasks((previousTasks) =>

            previousTasks.map((task) =>

                task.id === updatedTask.id
                    ? updatedTask
                    : task

            )

        );

        setShowEditModal(false);

        setSelectedTask(null);

        toast.success(
            "Task updated successfully!"
        );
    };


    // =========================================
    // UPDATE TASK STATUS
    // =========================================

    const handleTaskStatusUpdated = (
        updatedTask
    ) => {

        setTasks((previousTasks) =>

            previousTasks.map((task) =>

                task.id === updatedTask.id
                    ? updatedTask
                    : task

            )

        );
    };


    // =========================================
    // DELETE TASK
    // =========================================

    const handleDeleteTask = async () => {

        if (!taskToDelete) {
            return;
        }


        try {

            await api.delete(
                `/tasks/${taskToDelete.id}`
            );


            setTasks((previousTasks) =>

                previousTasks.filter(
                    (task) =>
                        task.id !== taskToDelete.id
                )

            );


            toast.success(
                "Task deleted successfully!"
            );


            setTaskToDelete(null);


        } catch (error) {

            console.error(
                "Delete task error:",
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

                navigate(
                    "/login",
                    {
                        replace: true
                    }
                );

                return;
            }


            // -----------------------------------------
            // FORBIDDEN
            // -----------------------------------------

            if (
                error.response?.status === 403
            ) {

                toast.error(
                    "Only the task creator can delete this task"
                );

                setTaskToDelete(null);

                return;
            }


            toast.error(
                error.response?.data?.detail ||
                "Failed to delete task"
            );

        }
    };


    // =========================================
    // LOGOUT
    // =========================================

    const handleLogout = () => {

        localStorage.removeItem(
            "access_token"
        );

        navigate(
            "/login",
            {
                replace: true
            }
        );
    };


    // =========================================
    // FILTER TASKS
    // =========================================

    const filteredTasks = tasks.filter((task) => {

        const searchValue =
            search.toLowerCase().trim();


        const title =
            (task.title || "").toLowerCase();


        const description =
            (task.description || "").toLowerCase();


        const assignedUser =
            (
                task.assigned_user_email ||
                ""
            ).toLowerCase();


        const matchesSearch =
            !searchValue ||
            title.includes(searchValue) ||
            description.includes(searchValue) ||
            assignedUser.includes(searchValue);


        const matchesStatus =
            statusFilter === "All" ||
            task.status === statusFilter;


        const matchesPriority =
            priorityFilter === "All" ||
            task.priority === priorityFilter;


        return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
        );

    });


    // =========================================
    // RENDER
    // =========================================

    return (

        <div className="dashboard-container">


            {/* =====================================
                HEADER
            ===================================== */}

            <DashboardHeader
                onAddTask={() =>
                    setShowTaskModal(true)
                }
                onLogout={handleLogout}
                tasks={tasks}
                currentUser={currentUser}
            />


            {/* =====================================
                FILTERS
            ===================================== */}

            <TaskFilters
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
            />


            {/* =====================================
                TASK COUNT
            ===================================== */}

            <div className="task-count">

                <span>
                    {filteredTasks.length}
                </span>

                {filteredTasks.length === 1
                    ? " task"
                    : " tasks"}

            </div>


            {/* =====================================
                TASK LIST
            ===================================== */}

            <TaskList
                tasks={filteredTasks}
                loading={loading}
                currentUser={currentUser}
                onEdit={handleEditTask}
                onDelete={setTaskToDelete}
                onTaskUpdated={
                    handleTaskStatusUpdated
                }
                onCreateTask={() =>
                    setShowTaskModal(true)
                }
            />


            {/* =====================================
                CREATE TASK MODAL
            ===================================== */}

            {showTaskModal && (

                <TaskForm
                    onClose={() =>
                        setShowTaskModal(false)
                    }
                    onCreated={handleTaskCreated}
                />

            )}


            {/* =====================================
                EDIT TASK MODAL
            ===================================== */}

            {showEditModal &&
                selectedTask && (

                    <EditTaskForm
                        task={selectedTask}
                        onUpdated={handleTaskUpdated}
                        onClose={() => {

                            setShowEditModal(false);

                            setSelectedTask(null);

                        }}
                    />

                )}


            {/* =====================================
                DELETE CONFIRMATION MODAL
            ===================================== */}

            {taskToDelete && (

                <DeleteTaskModal
                    task={taskToDelete}
                    onCancel={() =>
                        setTaskToDelete(null)
                    }
                    onConfirm={handleDeleteTask}
                />

            )}

        </div>
    );
}


export default Dashboard;