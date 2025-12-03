import React, { useEffect, useState } from "react";

export default function Users({ user, handleLogout }) {
    const [users, setUsers] = useState([]);

    //Search state
    const [searchTerm, setSearchTerm] = useState("");

    //Sort state
    const [sortOrder, setSortOrder] = useState("default");

    //Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 7;

    //Edit (-> role & status change) states
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState("");
    const [newStatus, setNewStatus] = useState("");
    //Delete modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        if (!user) return;

        fetch("http://localhost:5000/users", { credentials: "include" })
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error(err));
    }, [user]);

    // Filter users based on search
    const filteredUsers = users.filter((u) =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort users
    let sortedUsers = [...filteredUsers];

    if (sortOrder === "default") {
        sortedUsers.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    if (sortOrder === "username_asc") {
        sortedUsers.sort((a, b) => a.username.localeCompare(b.username));
    }

    if (sortOrder === "username_desc") {
        sortedUsers.sort((a, b) => b.username.localeCompare(a.username));
    }

    // Pagination calculations
    const totalUsers = sortedUsers.length;
    const totalPages = Math.ceil(totalUsers / usersPerPage);

    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;

    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

    const pageWindow = 3;
    let startPage = Math.max(1, currentPage - pageWindow);
    let endPage = Math.min(totalPages, currentPage + pageWindow);

    const deleteUser = async () => {
        if (!userToDelete) return;

        try {
            const res = await fetch(`http://localhost:5000/users/${userToDelete.user_id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                setUsers(users.filter((u) => u.user_id !== userToDelete.user_id));
            }
        } catch (err) {
            console.error(err);
        }

        setShowDeleteModal(false);
        setUserToDelete(null);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);        // UI only
        setNewStatus(user.isactive);  // DB update
        setShowModal(true);
    };

    const saveChanges = async () => {
        if (!selectedUser) return;

        try {
            const res = await fetch(`http://localhost:5000/users/${selectedUser.user_id}/status`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isactive: newStatus })
            });

            if (res.ok) {
                // update UI
                setUsers(prev =>
                    prev.map(u =>
                        u.user_id === selectedUser.user_id
                            ? { ...u, isactive: newStatus }
                            : u
                    )
                );
            }

        } catch (err) {
            console.error(err);
        }

        setShowModal(false);
    };

    return (
        <div className="container">

            {/* TOP BAR */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h2>Welcome, {user?.username}</h2>
                <button className="btn btn-danger" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <h1 className="text-center mt-2">PERN Todo List</h1>

            {/* Search Input */}
            <div className="container mt-2 d-flex justify-content-center">
                <div className="input-group mb-2 mt-2" style={{ width: "50%" }}>
                    <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Search users by username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setSearchTerm("")}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Sorting Dropdown */}
            <div className="container d-flex justify-content-center align-items-center mb-2">
                <div className="me-2 fw-bold">Sort:</div>

                <select
                    className="form-select form-select-sm me-2"
                    style={{ width: "auto" }}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <option value="default">Default (Newest First)</option>
                    <option value="username_asc">Username Ascending (A → Z)</option>
                    <option value="username_desc">Username Descending (Z → A)</option>
                </select>

                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setSortOrder("default")}
                >
                    Reset
                </button>
            </div>

            <table className="table mt-4 text-center">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Edit</th>
                        <th>Delete</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                        <th>Role</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {paginatedUsers.map(u => (
                        <tr key={u.user_id}>
                            <td>{u.username}</td>

                            <td>
                                <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() => openEditModal(u)}
                                >
                                    Edit
                                </button>
                            </td>

                            <td>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => {
                                        setUserToDelete(u);
                                        setShowDeleteModal(true);
                                    }}
                                >
                                    Delete user
                                </button>
                            </td>

                            <td>{new Date(u.created_at).toLocaleString()}</td>
                            <td>{new Date(u.updated_at).toLocaleString()}</td>
                            <td>{u.role}</td>
                            <td>{u.isactive ? "Active" : "Inactive"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {totalUsers > 0 && (
                <div className="d-flex justify-content-center mt-3">

                    <button className="btn btn-secondary mx-1"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(1)}>
                        First
                    </button>

                    <button className="btn btn-secondary mx-1"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}>
                        Previous
                    </button>

                    {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
                        .map((page) => (
                            <button
                                key={page}
                                className={`btn btn-sm mx-1 ${currentPage === page ? "btn-primary" : "btn-outline-primary"}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}

                    <button className="btn btn-secondary mx-1"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}>
                        Next
                    </button>

                    <button className="btn btn-secondary mx-1"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(totalPages)}>
                        Last
                    </button>
                </div>
            )}

            {/* Edit User Modal */}
            {showModal && selectedUser && (
                <div
                    className="modal fade show"
                    style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">Edit User: {selectedUser.username}</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>

                            <div className="modal-body">

                                {/* ROLE DROPDOWN (UI ONLY) */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Role</label>
                                    <select
                                        className="form-select"
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Editor">Editor</option>
                                        <option value="Viewer">Viewer</option>
                                        <option value="Guest">Guest</option>
                                    </select>
                                </div>

                                {/* STATUS DROPDOWN (UPDATES DB) */}
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Status</label>
                                    <select
                                        className="form-select"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value === "true")}
                                    >
                                        <option value={true}>Active</option>
                                        <option value={false}>Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Close
                                </button>
                                <button className="btn btn-primary" onClick={saveChanges}>
                                    Save Changes
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteModal && (
                <>
                    {/* Backdrop */}
                    <div className="modal-backdrop fade show"></div>

                    {/* Modal */}
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">

                                <div className="modal-header">
                                    <h5 className="modal-title">Confirm Delete</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowDeleteModal(false)}
                                    />
                                </div>

                                <div className="modal-body">
                                    <p>
                                        Are you sure you want to delete user{" "}
                                        <strong>{userToDelete?.username}</strong>?
                                    </p>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        className="btn btn-danger"
                                        onClick={deleteUser}
                                    >
                                        Delete
                                    </button>

                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowDeleteModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </>
            )}


        </div>
    );
}