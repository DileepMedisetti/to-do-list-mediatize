function TaskFilters({
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter
}) {

    return (

        <div className="dashboard-controls">

            {/* SEARCH */}

            <div className="search-wrapper">

                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                />

            </div>


            {/* STATUS */}

            <select
                value={statusFilter}
                onChange={(event) =>
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


            {/* PRIORITY */}

            <select
                value={priorityFilter}
                onChange={(event) =>
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
    );
}


export default TaskFilters;