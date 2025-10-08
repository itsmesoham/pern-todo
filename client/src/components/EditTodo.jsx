import React, { Fragment, useState } from "react";

const EditTodo = ({ todo }) => {
    const [description, setDescription] = useState(todo.description);
    const [amount, setAmount] = useState(todo.amount); // Added state for amount

    //edit description function
    const updateDescription = async (e) => {
        e.preventDefault();
        try {
            const body = { description, amount }; // Include amount here
            const response = await fetch(`http://localhost:5000/todos/${todo.todo_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            //refresh the page
            window.location = "/";
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <Fragment>
            {/* <!-- Button to Open the Modal --> */}
            <button
                type="button"
                className="btn btn-warning"
                data-bs-toggle="modal"
                data-bs-target={`#id${todo.todo_id}`}
            >
                Edit
            </button>

            {/* <!-- The Modal --> */}
            <div
                className="modal fade"
                id={`id${todo.todo_id}`}
                onClick={() => {
                    setDescription(todo.description);
                    setAmount(todo.amount); // Reset amount on modal close
                }}
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        {/* <!-- Modal Header --> */}
                        <div className="modal-header">
                            <h4 className="modal-title">Edit Todo</h4>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                onClick={() => {
                                    setDescription(todo.description);
                                    setAmount(todo.amount); // Reset amount when closing
                                }}
                            ></button>
                        </div>

                        {/* <!-- Modal body --> */}
                        <div className="modal-body">
                            <input
                                type="text"
                                className="form-control mb-2"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            {/* Added input for amount */}
                            <input
                                type="number"
                                className="form-control"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount..."
                            />
                        </div>

                        {/* <!-- Modal footer --> */}
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-warning"
                                data-bs-dismiss="modal"
                                onClick={(e) => updateDescription(e)}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                data-bs-dismiss="modal"
                                onClick={() => {
                                    setDescription(todo.description);
                                    setAmount(todo.amount); // Reset amount
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default EditTodo;
