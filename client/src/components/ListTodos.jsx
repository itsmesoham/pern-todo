import React, { Fragment, useState, useEffect, useRef } from "react";
import EditTodo from "./EditTodo";

const ListTodos = () => {
    const [todos, setTodos] = useState([]);
    const [selectedTodo, setSelectedTodo] = useState(null); // store the todo to delete
    const [showModal, setShowModal] = useState(false); // control modal
    const deleteBtnRef = useRef(null); // reference to Delete button

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const todosPerPage = 7; // number of todos per page

    // Search state
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch all todos
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

    // Delete a todo
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

    useEffect(() => {
        getTodos();
    }, []);

    // Handle modal keyboard navigation
    useEffect(() => {
        if (!showModal) return;

        const modal = document.querySelector(".modal.show.d-block");
        deleteBtnRef.current?.focus(); // Focus Delete button by default

        const handleKeyDown = (e) => {
            const focusableEls = modal.querySelectorAll(
                "button, [tabindex]:not([tabindex='-1'])"
            );

            // ESC closes the modal
            if (e.key === "Escape" || e.key === "Esc") {
                e.preventDefault();
                setShowModal(false);
                return;
            }

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

            // Enter triggers the focused button
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

    // Filter todos by search term
    const filteredTodos = todos.filter((todo) =>
        todo.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic (applied on filtered todos)
    const indexOfLastTodo = currentPage * todosPerPage;
    const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
    const currentTodos = filteredTodos.slice(indexOfFirstTodo, indexOfLastTodo);
    const totalPages = Math.ceil(filteredTodos.length / todosPerPage);

    return (
        <Fragment>
            {/* Search Input with Clear Button */}
            <div className="container mt-4 d-flex justify-content-center">
                <div className="input-group mb-3" style={{ width: "50%" }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search todos..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    {searchTerm && (
                        <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                setCurrentPage(1);
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Todo Table */}
            <table className="table mt-3 text-center">
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
                    {currentTodos.length > 0 ? (
                        currentTodos.map((todo) => (
                            <tr key={todo.todo_id}>
                                <td>{todo.description}</td>
                                <td>
                                    <EditTodo todo={todo} getTodos={getTodos} />{" "}
                                    {/* pass getTodos to refresh after edit */}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => {
                                            setSelectedTodo(todo.todo_id);
                                            setShowModal(true);
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                                <td>{new Date(todo.created_at).toLocaleString()}</td>
                                <td>{new Date(todo.updated_at).toLocaleString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-muted">
                                No todos found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {filteredTodos.length > 0 && (
                <div className="d-flex justify-content-center mt-3">
                    <button
                        className="btn btn-secondary mx-1"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            className={`btn btn-sm mx-1 ${currentPage === i + 1
                                ? "btn-primary"
                                : "btn-outline-primary"
                                }`}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        className="btn btn-secondary mx-1"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showModal && (
                <>
                    {/* Backdrop */}
                    <div className="modal-backdrop fade show"></div>

                    {/* Modal */}
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
                                        ref={deleteBtnRef}
                                        className="btn btn-danger"
                                        onClick={() => {
                                            deleteTodo(selectedTodo);
                                            setShowModal(false);
                                        }}
                                    >
                                        Delete
                                    </button>
                                    <button
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
