import TaskCard from "./TaskCard";


function TaskList({
    tasks,
    loading,
    currentUser,
    onEdit,
    onDelete,
    onCreateTask,
    onTaskUpdated
}) {

    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (

            <div className="loading-container">

                <p>
                    Loading tasks...
                </p>

            </div>
        );
    }


    // =========================================
    // EMPTY STATE
    // =========================================

    if (tasks.length === 0) {

        return (

            <div className="empty-state">

                <h2>
                    No tasks found
                </h2>

                <p>
                    Create a new task to get started.
                </p>

                <button
                    type="button"
                    className="add-task-btn"
                    onClick={onCreateTask}
                >
                    + Create Task
                </button>

            </div>
        );
    }


    // =========================================
    // TASK LIST
    // =========================================

    return (

        <div className="task-grid">

            {tasks.map((task) => (

                <TaskCard
                    key={task.id}
                    task={task}
                    currentUser={currentUser}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onTaskUpdated={onTaskUpdated}
                />

            ))}

        </div>
    );
}


export default TaskList;