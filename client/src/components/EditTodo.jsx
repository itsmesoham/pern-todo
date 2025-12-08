import React, { useEffect, useRef, useState } from "react";

const EditTodo = ({ todo, getTodos, user, closeModal }) => {
    const [description, setDescription] = useState(todo.description);
    const [amount, setAmount] = useState(todo.amount ?? "");
    const inputRef = useRef(null);

    const updateTodo = async (e) => {
        e.preventDefault();

        // Skip if nothing changed
        const descUnchanged = description.trim() === (todo.description ?? "").trim();
        const amtUnchanged = String(amount) === String(todo.amount ?? "");
        if (descUnchanged && amtUnchanged) return closeModal();

        if (amount !== "" && isNaN(Number(amount))) {
            alert("Amount must be a number!");
            return;
        }

        try {
            const body = {
                description: description.trim(),
                amount: amount === "" ? null : Number(amount),
                user_id: todo.user_id ?? user.user_id,
                role: user.role,
            };

            await fetch(`http://localhost:5000/todos/${todo.todo_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
            });

            if (getTodos) getTodos();
            closeModal(); // CLOSE after update
        } catch (err) {
            console.error(err.message);
        }
    };

    // Auto-focus on modal open
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop fade show"></div>

            {/* Modal */}
            <div className="modal show d-block" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h4 className="modal-title">Edit Todo</h4>
                            <button className="btn-close" onClick={closeModal}></button>
                        </div>

                        <div className="modal-body">
                            <input
                                ref={inputRef}
                                type="text"
                                className="form-control mb-3"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />

                            <input
                                type="number"
                                className="form-control"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount..."
                            />
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-warning"
                                onClick={updateTodo}
                            >
                                Save Changes
                            </button>

                            <button className="btn btn-secondary" onClick={closeModal}>
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default EditTodo;
