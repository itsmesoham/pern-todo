import React, { Fragment, useState, useRef, useEffect } from 'react';

const InputTodo = () => {
    const [description, setDescription] = useState("");
    const inputRef = useRef(null); // create a reference to the input field

    // Auto-focus the input when the component loads
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const onSubmitForm = async (e) => {
        e.preventDefault();

        if (description.trim() === "") {
            alert("Please enter a todo description before adding!");
            return;
        }

        try {
            const body = { description };
            const response = await fetch("http://localhost:5000/todos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            // Optionally check for success before continuing
            if (response.ok) {
                setDescription(""); // clear the input after adding
                inputRef.current?.focus(); // focus back to input
            }

            // Instead of reloading the page, you can also refresh todos via state (better practice)
            window.location = "/";
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <Fragment>
            <h1 className='text-center mt-4'>PERN Todo List</h1>
            <form className='d-flex mt-4' onSubmit={onSubmitForm}>
                <input
                    type='text'
                    className='form-control'
                    ref={inputRef} // attach ref here
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a todo..."
                />
                <button className='btn btn-success'>Add</button>
            </form>
        </Fragment>
    );
};

export default InputTodo;
