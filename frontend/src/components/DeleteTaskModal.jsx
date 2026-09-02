import "../css/delete-modal.css";


function DeleteTaskModal({
    task,
    onCancel,
    onConfirm
}) {

    return (

        <div
            className="delete-modal-overlay"
            onClick={onCancel}
        >

            <div
                className="delete-modal"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >

                <div className="delete-modal-icon">
                    !
                </div>


                <h2>
                    Delete Task?
                </h2>


                <p>
                    Are you sure you want to delete
                    <strong>
                        {" "}
                        "{task.title}"
                    </strong>
                    ?
                </p>


                <p className="delete-warning">
                    This action cannot be undone.
                </p>


                <div className="delete-modal-actions">

                    <button
                        type="button"
                        className="delete-cancel-btn"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        className="delete-confirm-btn"
                        onClick={onConfirm}
                    >
                        Delete Task
                    </button>

                </div>

            </div>

        </div>
    );
}


export default DeleteTaskModal;