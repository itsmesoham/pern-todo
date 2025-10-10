import React, { useState } from "react";

const Login = ({ setUser }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isRegister ? "register" : "login";

        const response = await fetch(`http://localhost:5000/auth/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        setMessage(data.message);

        if (data.success) {
            setUser(data.user); // store user in state
            localStorage.setItem("user", JSON.stringify(data.user)); // optional
        }
    };

    return (
        <div className="login-container">
            <h2>{isRegister ? "Register" : "Login"}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">{isRegister ? "Register" : "Login"}</button>
            </form>
            <p>{message}</p>
            <button onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? "Already have an account? Login" : "New user? Register"}
            </button>
        </div>
    );
};

export default Login;
