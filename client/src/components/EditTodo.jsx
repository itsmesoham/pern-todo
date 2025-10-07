import React, { Fragment, useState, useEffect, useRef } from "react";

const EditTodo = ({ todo, getTodos }) => {
    const [description, setDescription] = useState(todo.description);
    const inputRef = useRef(null); // reference to input field
    const editBtnRef = useRef(null); // reference to Edit button

    // Edit Todo description function
    const updateDescription = async (e) => {
        e.preventDefault();

        // Prevent update if description is unchanged or only spaces
        if (description.trim() === todo.description.trim()) {
            console.log("No change detected — skipping update");
            return;
        }
        
        try {
            const body = { description };
            await fetch(`http://localhost:5000/todos/${todo.todo_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            // Refresh the todo list in parent to show updated todo at top
            getTodos();
        } catch (err) {
            console.error(err.message);
        }
    };

    // Auto-focus input when modal opens
    useEffect(() => {
        const modal = document.getElementById(`id${todo.todo_id}`);
        const handleShown = () => {
            inputRef.current?.focus();
        };

        modal.addEventListener("shown.bs.modal", handleShown);
        return () => {
            modal.removeEventListener("shown.bs.modal", handleShown);
        };
    }, [todo.todo_id]);

    // Listen for Enter key to trigger Edit button
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                editBtnRef.current?.click();
            }
        };

        const modal = document.getElementById(`id${todo.todo_id}`);
        modal.addEventListener("keydown", handleKeyDown);

        return () => {
            modal.removeEventListener("keydown", handleKeyDown);
        };
    }, [todo.todo_id]);

    // Focus trap for Tab/Shift+Tab inside modal
    useEffect(() => {
        const modal = document.getElementById(`id${todo.todo_id}`);
        if (!modal) return;

        const focusableEls = modal.querySelectorAll(
            "input, button, [tabindex]:not([tabindex='-1'])"
        );
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];

        const handleTab = (e) => {
            if (e.key !== "Tab") return;

            if (e.shiftKey) {
                if (document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                }
            } else {
                if (document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
        };

        document.addEventListener("keydown", handleTab);
        return () => document.removeEventListener("keydown", handleTab);
    }, [todo.todo_id]);

    return (
        <Fragment>
            <button
                type="button"
                className="btn btn-warning"
                data-bs-toggle="modal"
                data-bs-target={`#id${todo.todo_id}`}
            >
                Edit
            </button>

            <div
                className="modal"
                id={`id${todo.todo_id}`}
                onClick={() => setDescription(todo.description)}
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Edit Todo</h4>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                onClick={() => setDescription(todo.description)}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <input
                                ref={inputRef}
                                type="text"
                                className="form-control"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="modal-footer">
                            <button
                                ref={editBtnRef}
                                type="button"
                                className="btn btn-warning"
                                data-bs-dismiss="modal"
                                onClick={(e) => updateDescription(e)}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                                onClick={() => setDescription(todo.description)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default EditTodo;