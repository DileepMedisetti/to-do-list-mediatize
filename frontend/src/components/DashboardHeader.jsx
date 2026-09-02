function DashboardHeader({
    onAddTask,
    onLogout,
    tasks = [],
    currentUser
}) {

    // =========================================
    // TASK STATISTICS
    // =========================================

    const totalTasks = tasks.length;

    const todoTasks = tasks.filter(
        (task) => task.status === "To Do"
    ).length;

    const inProgressTasks = tasks.filter(
        (task) => task.status === "In Progress"
    ).length;

    const completedTasks = tasks.filter(
        (task) => task.status === "Completed"
    ).length;


    // =========================================
    // OVERDUE TASKS
    // =========================================

    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const overdueTasks = tasks.filter((task) => {

        if (!task.due_date) {
            return false;
        }

        if (task.status === "Completed") {
            return false;
        }

        const dueDate = new Date(task.due_date);

        dueDate.setHours(0, 0, 0, 0);

        return dueDate < today;

    }).length;


    // =========================================
    // MY TASKS
    // =========================================

    const myTasks = currentUser
        ? tasks.filter(
            (task) =>
                Number(task.created_by_id) ===
                Number(currentUser.id)
        ).length
        : 0;


    // =========================================
    // ASSIGNED TASKS
    // =========================================

    const assignedTasks = currentUser
        ? tasks.filter(
            (task) =>
                Number(task.assigned_user_id) ===
                Number(currentUser.id)
        ).length
        : 0;


    // =========================================
    // STATISTICS
    // =========================================

    const stats = [
        {
            label: "Total Tasks",
            value: totalTasks
        },
        {
            label: "To Do",
            value: todoTasks
        },
        {
            label: "In Progress",
            value: inProgressTasks
        },
        {
            label: "Completed",
            value: completedTasks
        },
        {
            label: "Overdue",
            value: overdueTasks
        },
        {
            label: "My Tasks",
            value: myTasks
        },
        {
            label: "Assigned Tasks",
            value: assignedTasks
        }
    ];


    // =========================================
    // USER INITIAL
    // =========================================

    const userInitial = currentUser?.full_name
        ? currentUser.full_name.charAt(0).toUpperCase()
        : "U";


    return (

        <header className="dashboard-header-wrapper">

            {/* =========================================
                HEADER
            ========================================= */}

            <div className="dashboard-header">

                <div className="dashboard-title">

                    <h1>
                        Task Dashboard
                    </h1>

                    <p>
                        Manage and track your tasks
                    </p>

                </div>


                <div className="dashboard-header-actions">

                    {/* =========================================
                        LOGGED-IN USER
                    ========================================= */}

                    {currentUser && (

                        <div className="logged-in-user">

                            <div className="user-avatar">
                                {userInitial}
                            </div>

                            <div className="user-details">

                                <span className="user-label">
                                    Welcome
                                </span>

                                <strong>
                                    {currentUser.full_name}
                                </strong>

                            </div>

                        </div>

                    )}


                    {/* =========================================
                        ADD TASK
                    ========================================= */}

                    <button
                        type="button"
                        className="add-task-btn"
                        onClick={onAddTask}
                    >
                        + Add Task
                    </button>


                    {/* =========================================
                        LOGOUT
                    ========================================= */}

                    <button
                        type="button"
                        className="logout-btn"
                        onClick={onLogout}
                    >
                        Logout
                    </button>

                </div>

            </div>


            {/* =========================================
                TASK STATISTICS
            ========================================= */}

            <div className="dashboard-stats">

                {stats.map((stat) => (

                    <div
                        className="dashboard-stat-card"
                        key={stat.label}
                    >

                        <div className="dashboard-stat-label">
                            {stat.label}
                        </div>

                        <div className="dashboard-stat-value">
                            {stat.value}
                        </div>

                    </div>

                ))}

            </div>

        </header>
    );
}


export default DashboardHeader;