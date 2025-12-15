import React, { Fragment, useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import SortDropdown from "../components/SortDropdown";
import Pagination from "../components/Pagination";
import DataTable from "../components/DataTable";

export default function Users({ user, handleLogout }) {
    const [users, setUsers] = useState([]);

    //Search state
    const [searchTerm, setSearchTerm] = useState("");

    //Sort state
    const [sortOrder, setSortOrder] = useState("default");

    //Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 6;

    //Edit (-> role & status change) states
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRoleId, setNewRoleId] = useState("");
    const [newStatus, setNewStatus] = useState("");

    //Delete modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Checkbox states
    const [checkedUsers, setCheckedUsers] = useState([]);
    const [selectAll, setSelectAll] = useState(false); // select all on current page
    const [deleteMode, setDeleteMode] = useState("");  // 'bulk' or 'single'

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

    const roleMap = {
        1: "superadmin",
        2: "user",
        3: "admin",
        4: "manager",
        5: "editor",
        6: "viewer",
        7: "guest"
    };

    const deleteUser = async () => {
        try {
            let idsToDelete = [];

            if (deleteMode === "bulk") {
                idsToDelete = checkedUsers;
            } else if (deleteMode === "single") {
                idsToDelete = [userToDelete.user_id];
            }

            await Promise.all(
                idsToDelete.map(id =>
                    fetch(`http://localhost:5000/users/${id}`, {
                        method: "DELETE",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" }
                    })
                )
            );

            setUsers(prev => prev.filter(u => !idsToDelete.includes(u.user_id)));
        } catch (err) {
            console.error(err);
        }

        setCheckedUsers([]);
        setSelectAll(false);
        setShowDeleteModal(false);
        setDeleteMode("");
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setNewRoleId(user.role_id);
        setNewStatus(user.isactive);
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
                body: JSON.stringify({ role_id: Number(newRoleId) })
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
                        ? {
                            ...u,
                            role_id: newRoleId,
                            role_name: roleMap[newRoleId],
                            isactive: newStatus
                        }
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

            {/* Bulk Delete / Delete Page / Deselect Buttons */}
            <div className="container mb-2">

                {/* Delete All Users (all pages) */}
                {users.length > 0 && (
                    <button
                        className="btn btn-danger me-2"
                        onClick={() => {
                            setCheckedUsers(users.map(u => u.user_id)); // Select ALL users
                            setDeleteMode("bulk");
                            setShowDeleteModal(true);
                        }}
                    >
                        Delete All Users
                    </button>
                )}

                {/* Delete This Page Users */}
                {paginatedUsers.length > 0 && (
                    <button
                        className="btn btn-danger me-2"
                        onClick={() => {
                            // IDs on current page but exclude current logged-in user
                            const ids = paginatedUsers
                                .map(u => u.user_id)
                                .filter(id => id !== user.user_id);

                            if (ids.length === 0) {
                                alert("No deletable users on this page (you cannot delete yourself).");
                                return;
                            }

                            setCheckedUsers(ids);
                            setDeleteMode("bulk");
                            setShowDeleteModal(true);
                        }}
                    >
                        Delete This Page Users
                    </button>
                )}

                {/* Delete Selected Button */}
                {checkedUsers.length > 0 && (
                    <button
                        className="btn btn-danger me-2"
                        onClick={() => {
                            setDeleteMode("bulk");
                            setShowDeleteModal(true);
                        }}
                    >
                        Delete Selected ({checkedUsers.length})
                    </button>
                )}

                {/* Deselect All Button */}
                {checkedUsers.length > 0 && (
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            setCheckedUsers([]);
                            setSelectAll(false);
                        }}
                    >
                        Deselect All
                    </button>
                )}
            </div>

            {/* Users Table */}
            <DataTable
                data={paginatedUsers}
                enableCheckbox={false}
                selectedRows={checkedUsers}
                onSelectionChange={setCheckedUsers}
                columns={[
                    { key: "username", label: "User" },
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
                    { key: "role_name", label: "Role" },
                    {
                        key: "isactive",
                        label: "Status",
                        format: (v) => (v ? "Active" : "Inactive")
                    }
                ]}
                actions={[
                    {
                        customElement: "checkbox",
                        checked: (u) => checkedUsers.includes(u.user_id),
                        disabled: (u) => u.user_id === user.user_id,
                        onClick: (u, checked) => {
                            if (checked) {
                                setCheckedUsers(prev => [...prev, u.user_id]);
                            } else {
                                setCheckedUsers(prev => prev.filter(id => id !== u.user_id));
                            }
                        }
                    },
                    {
                        customElement: "button",
                        label: "Edit",
                        className: "btn-warning btn-sm",
                        disabled: (u) => u.user_id === user.user_id,
                        onClick: (u) => openEditModal(u)
                    }
                ]}
            />

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
                                        value={newRoleId}
                                        onChange={(e) => setNewRoleId(Number(e.target.value))}
                                    >
                                        <option value={2}>User</option>
                                        <option value={3}>Admin</option>
                                        <option value={4}>Manager</option>
                                        <option value={5}>Editor</option>
                                        <option value={6}>Viewer</option>
                                        <option value={7}>Guest</option>
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
                                        Are you sure you want to delete this/these user(s)?
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