import React, { Fragment, useState, useEffect, useRef } from "react";
import EditTodo from "./EditTodo";

const ListTodos = () => {
    const [todos, setTodos] = useState([]);
    const [selectedTodo, setSelectedTodo] = useState(null); // store the todo to delete
    const [showModal, setShowModal] = useState(false); // control modal
    const cancelBtnRef = useRef(null); // reference to Cancel button
    const deleteBtnRef = useRef(null); // reference to Delete button

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const todosPerPage = 7; // number of todos per page

    const deleteTodo = async (id) => {
        try {
            await fetch(`http://localhost:5000/todos/${id}`, {
                method: "DELETE",
            });

            setTodos(todos.filter((todo) => todo.todo_id !== id));
        } catch (err) {
            console.error(err.message);
        }
    };

    const getTodos = async () => {
        try {
            const response = await fetch("http://localhost:5000/todos");
            const jsonData = await response.json();

            // Sort by updated_at descending so newest/updated first
            jsonData.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

            setTodos(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        getTodos();
    }, []);

    // Focus Cancel button and handle Enter/Tab when modal is open
    useEffect(() => {
        if (!showModal) return;

        const modal = document.querySelector(".modal.show.d-block");

        // Focus Cancel button by default
        cancelBtnRef.current?.focus();

        const handleKeyDown = (e) => {
            const focusableEls = modal.querySelectorAll(
                "button, [tabindex]:not([tabindex='-1'])"
            );

            // Focus trap for Tab/Shift+Tab
            if (e.key === "Tab") {
                const firstEl = focusableEls[0];
                const lastEl = focusableEls[focusableEls.length - 1];

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
            }

            // Enter triggers the button that is currently focused
            if (e.key === "Enter") {
                e.preventDefault();
                if (document.activeElement) {
                    document.activeElement.click();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        // Cleanup
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showModal]);

    // Calculate todos to show for current page
    const indexOfLastTodo = currentPage * todosPerPage;
    const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
    const currentTodos = todos.slice(indexOfFirstTodo, indexOfLastTodo);
    const totalPages = Math.ceil(todos.length / todosPerPage);

    return (
        <Fragment>
            <table className="table mt-5 text-center">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Edit</th>
                        <th>Delete</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                    </tr>
                </thead>
                <tbody>
                    {currentTodos.map((todo) => (
                        <tr key={todo.todo_id}>
                            <td>{todo.description}</td>
                            <td>
                                <EditTodo todo={todo} getTodos={getTodos} /> {/* pass getTodos to refresh after edit */}
                            </td>
                            <td>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => {
                                        setSelectedTodo(todo.todo_id); // set which todo is being deleted
                                        setShowModal(true); // open modal
                                    }}
                                >
                                    Delete
                                </button>
                            </td>
                            <td>{new Date(todo.created_at).toLocaleString()}</td>
                            <td>{new Date(todo.updated_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-center mt-3">
                <button
                    className="btn btn-secondary mx-1"
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                >
                    Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        className={`btn btn-sm mx-1 ${currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    className="btn btn-secondary mx-1"
                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                >
                    Next
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showModal && (
                <>
                    {/* Backdrop for dim effect */}
                    <div className="modal-backdrop fade show"></div>

                    {/* Delete Confirmation Modal */}
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Confirm Delete!</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    />
                                </div>
                                <div className="modal-body">
                                    <p>Are you sure you want to delete this todo?</p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        ref={deleteBtnRef} // reference to Delete button
                                        className="btn btn-danger"
                                        onClick={() => {
                                            deleteTodo(selectedTodo);
                                            setShowModal(false);
                                        }}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        ref={cancelBtnRef} // attach ref to Cancel button
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Fragment>
    );
};

export default ListTodos;
