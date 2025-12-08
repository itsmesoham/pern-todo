import React, { Fragment, useState, useEffect, useRef } from "react";
import EditTodo from "./EditTodo";
import SendEmailModal from "./SendEmailModal";
import SearchBar from "./SearchBar";
import SortDropdown from "./SortDropdown";
import Pagination from "./Pagination";
import DataTable from "./DataTable";

const ListTodos = ({ user }) => {
    const [todos, setTodos] = useState([]);
    const [selectedTodo, setSelectedTodo] = useState(null); // store the todo to delete
    const [showModal, setShowModal] = useState(false); // control modal
    const deleteBtnRef = useRef(null); // reference to Delete button

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const todosPerPage = 7; // number of todos per page

    // Search state
    const [searchTerm, setSearchTerm] = useState("");

    // Sort state: null = default, "asc" = A-Z, "desc" = Z-A
    const [sortOrder, setSortOrder] = useState(null);

    // State for checked todos
    const [checkedTodos, setCheckedTodos] = useState([]); // store todo_id of selected todos
    const [selectAll, setSelectAll] = useState(false); // for "Select All" checkbox

    // State for delete mode
    const [deleteMode, setDeleteMode] = useState(""); // "bulk" or "single"

    // Email modal states
    const [openEmailModal, setOpenEmailModal] = useState(false);
    const [emailAddress, setEmailAddress] = useState("");

    const [todoToEdit, setTodoToEdit] = useState(null);

    async function getTodos() {
        try {
            const response = await fetch(
                `http://localhost:5000/todos?role=${user.role}&user_id=${user.user_id}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            const jsonData = await response.json();

            // Prevent crash if backend returns an error object
            if (!Array.isArray(jsonData)) {
                console.error("Invalid todos response:", jsonData);
                return;
            }

            // Default sort by updated_at descending
            jsonData.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

            setTodos(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    }

    // Delete multiple todos (role-based)
    const deleteTodos = async (ids) => {
        try {
            await Promise.all(
                ids.map((id) =>
                    fetch(`http://localhost:5000/todos/${id}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ user_id: user.user_id, role: user.role }),
                    })
                )
            );
            setTodos((prevTodos) => prevTodos.filter((todo) => !ids.includes(todo.todo_id)));
        } catch (err) {
            console.error(err.message);
        }
    };

    // Delete single todo (role-based)
    const deleteTodo = async (id) => {
        try {
            await fetch(`http://localhost:5000/todos/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ user_id: user.user_id, role: user.role }),
            });
            setTodos((prevTodos) => prevTodos.filter((todo) => todo.todo_id !== id));
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        getTodos(); // initial load

        const handleRefresh = () => getTodos();
        window.addEventListener("todoAdded", handleRefresh);

        return () => window.removeEventListener("todoAdded", handleRefresh);
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
    let filteredTodos = todos.filter((todo) =>
        todo.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply sorting on filtered todos
    if (sortOrder === "desc_az") {
        // Description Ascending (A → Z)
        filteredTodos.sort((a, b) =>
            a.description.localeCompare(b.description, undefined, { numeric: true, sensitivity: 'base' })
        );
    } else if (sortOrder === "desc_za") {
        // Description Descending (Z → A)
        filteredTodos.sort((a, b) =>
            b.description.localeCompare(a.description, undefined, { numeric: true, sensitivity: 'base' })
        );
    } else if (sortOrder === "amount_low_high") {
        // Amount Ascending
        filteredTodos.sort((a, b) => a.amount - b.amount);
    } else if (sortOrder === "amount_high_low") {
        // Amount Descending
        filteredTodos.sort((a, b) => b.amount - a.amount);
    } else {
        // Default sort: updated_at descending (newest first)
        filteredTodos.sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at).getTime();
            const dateB = new Date(b.updated_at || b.created_at).getTime();
            return dateB - dateA; // newest first
        });
        // console.log("This is else part of sorting.");
    }

    // Pagination logic (applied on filtered + sorted todos)
    const indexOfLastTodo = currentPage * todosPerPage;
    const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
    const currentTodos = filteredTodos.slice(indexOfFirstTodo, indexOfLastTodo);
    const totalPages = Math.ceil(filteredTodos.length / todosPerPage);

    // Dynamic pagination window
    const pageWindow = 4; // show 4 pages before and after current page
    let startPage = Math.max(1, currentPage - pageWindow);
    let endPage = Math.min(totalPages, currentPage + pageWindow);

    // Adjust window to always show a consistent number of buttons when near edges
    if (endPage - startPage < 2 * pageWindow) {
        if (startPage === 1) {
            endPage = Math.min(totalPages, startPage + 2 * pageWindow);
        } else if (endPage === totalPages) {
            startPage = Math.max(1, endPage - 2 * pageWindow);
        }
    }

    return (
        <Fragment>
            {/* Search Input with Clear Button */}
            <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={(value) => {
                    setSearchTerm(value);
                    setCurrentPage(1);
                }}
                placeholder="Search todos based on description..."
            />

            {/* Sorting Dropdown */}
            <SortDropdown
                sortOrder={sortOrder || "default"}
                setSortOrder={setSortOrder}
                options={[
                    { value: "default", label: "Default (Newest First)" },
                    { value: "desc_az", label: "Description Ascending (A → Z)" },
                    { value: "desc_za", label: "Description Descending (Z → A)" },
                    { value: "amount_low_high", label: "Amount Ascending (Low → High)" },
                    { value: "amount_high_low", label: "Amount Descending (High → Low)" },
                ]}
            />

            {/* Bulk Delete / Delete Page / Deselect Buttons */}
            <div className="container mb-2">
                {/* Delete All Todos */}
                {todos.length > 0 && (
                    <button
                        className="btn btn-danger me-2"
                        onClick={() => {
                            setCheckedTodos(filteredTodos.map(t => t.todo_id)); // select ALL todos
                            setDeleteMode("bulk");
                            setShowModal(true);
                        }}
                    >
                        Delete All Todos
                    </button>
                )}

                {/* Delete Selected Button */}
                {checkedTodos.length > 0 && (
                    <button
                        className="btn btn-danger me-2"
                        onClick={() => {
                            setDeleteMode("bulk");
                            setShowModal(true);
                        }}
                    >
                        Delete Selected ({checkedTodos.length})
                    </button>
                )}

                {/* Deselect All Button */}
                {checkedTodos.length > 0 && (
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            setCheckedTodos([]); // clear all selections
                            setSelectAll(false); // uncheck the "Select All" checkbox
                        }}
                    >
                        Deselect All
                    </button>
                )}
            </div>

            {/* Todo Table */}
            <DataTable
                data={currentTodos}
                enableCheckbox={true}
                onSelectionChange={(ids) => setCheckedTodos(ids)}
                columns={[
                    { key: "description", label: "Description" },
                    { key: "amount", label: "Amount" },
                    {
                        key: "created_at",
                        label: "Created At",
                        format: (v) => new Date(v).toLocaleString()
                    },
                    {
                        key: "updated_at",
                        label: "Updated At",
                        format: (v) => new Date(v).toLocaleString()
                    },
                    { key: "created_by_user", label: "Created By" },
                    { key: "updated_by_user", label: "Updated By" }
                ]}
                actions={[
                    {
                        label: "Edit",
                        className: "btn-warning btn-sm",
                        onClick: (todo) => {
                            console.log("EDIT CLICKED ->", todo);
                            setTodoToEdit(todo);
                        }
                    },
                    {
                        label: "Delete",
                        className: "btn-danger btn-sm",
                        onClick: (todo) => {
                            setSelectedTodo(todo.todo_id);
                            setDeleteMode("single");
                            setShowModal(true);
                        }
                    },
                    {
                        label: "Download",
                        className: "btn-light btn-sm",
                        onClick: async (todo) => {
                            const response = await fetch("http://localhost:5000/todo-action", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({ mode: "download", todo_id: todo.todo_id })
                            });

                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `todo_${todo.todo_id}.pdf`;
                            a.click();
                        }
                    },
                    {
                        label: "Email",
                        className: "btn-primary btn-sm",
                        onClick: (todo) => {
                            setSelectedTodo(todo);
                            setOpenEmailModal(true);
                        }
                    }
                ]}
            />

            {todoToEdit && (
                <EditTodo
                    todo={todoToEdit}
                    getTodos={getTodos}
                    user={user}
                    closeModal={() => setTodoToEdit(null)}
                />
            )}

            {/* Pagination Controls */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                startPage={startPage}
                endPage={endPage}
                setCurrentPage={setCurrentPage}
            />

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
                                    <p>Are you sure you want to delete this/these todo(s)?</p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        ref={deleteBtnRef}
                                        className="btn btn-danger"
                                        onClick={() => {
                                            if (deleteMode === "bulk") {
                                                deleteTodos(checkedTodos).then(() => {
                                                    setCheckedTodos([]);
                                                    setSelectAll(false);
                                                    setShowModal(false);
                                                    setDeleteMode("");
                                                });
                                            }
                                            else if (deleteMode === "single" && selectedTodo) {
                                                // Single delete
                                                deleteTodo(selectedTodo);
                                                setShowModal(false);
                                                setDeleteMode(""); // reset mode
                                            }
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

            {/*Send Email Model */}
            {openEmailModal && (
                <SendEmailModal
                    selectedTodo={selectedTodo}
                    closeModal={() => setOpenEmailModal(false)}
                />
            )}
        </Fragment>
    );
};

export default ListTodos;