import React, { Fragment, useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import SortDropdown from "../components/SortDropdown";
import Pagination from "../components/Pagination";

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
            // Update role
            await fetch(`http://localhost:5000/users/${selectedUser.user_id}/role`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })
            });

            // Update status (already exists)
            await fetch(`http://localhost:5000/users/${selectedUser.user_id}/status`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isactive: newStatus })
            });

            // Update role + status in React UI
            setUsers(prev =>
                prev.map(u =>
                    u.user_id === selectedUser.user_id
                        ? { ...u, role: newRole, isactive: newStatus }
                        : u
                )
            );

        } catch (err) {
            console.error(err);
        }

        setShowModal(false);
    };

    return (
        <Fragment>
            {/* Search Input */}
            <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={(value) => {
                    setSearchTerm(value);
                    setCurrentPage(1);
                }}
                placeholder="Search users by username..."
            />

            {/* Sorting Dropdown */}
            <SortDropdown
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                options={[
                    { value: "default", label: "Default (Newest First)" },
                    { value: "username_asc", label: "Username Ascending (A → Z)" },
                    { value: "username_desc", label: "Username Descending (Z → A)" },
                ]}
            />

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
                                {/* EDIT BUTTON */}
                                {u.user_id === user.user_id ? (
                                    <span
                                        className="text-muted"
                                        title="You can't edit yourself"
                                        style={{ cursor: "not-allowed" }}
                                    >
                                        —
                                    </span>
                                ) : (
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => openEditModal(u)}
                                    >
                                        Edit
                                    </button>
                                )}
                            </td>

                            <td>
                                {/* DELETE BUTTON */}
                                {u.user_id === user.user_id ? (
                                    <span
                                        className="text-muted"
                                        title="You can't delete yourself"
                                        style={{ cursor: "not-allowed" }}
                                    >
                                        —
                                    </span>
                                ) : (
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => {
                                            setUserToDelete(u);
                                            setShowDeleteModal(true);
                                        }}
                                    >
                                        Delete
                                    </button>
                                )}
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
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                startPage={startPage}
                endPage={endPage}
                setCurrentPage={setCurrentPage}
            />

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
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="editor">Editor</option>
                                        <option value="viewer">Viewer</option>
                                        <option value="guest">Guest</option>
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

        </Fragment>
    );
}