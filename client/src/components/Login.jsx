import React, { useState } from "react";

const Login = ({ setUser }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Trim whitespace from both fields
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();

        // Validation: disallow spaces anywhere in username or password
        if (/\s/.test(trimmedUsername) || /\s/.test(trimmedPassword)) {
            setMessage("Username and password cannot contain spaces.");
            return;
        }

        const endpoint = isRegister ? "register" : "login";

        try {
            const response = await fetch(`http://localhost:5000/auth/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword }),
            });

            const data = await response.json();
            setMessage(data.message);

            if (data.success) {
                setUser(data.user);
                localStorage.setItem("user", JSON.stringify(data.user));
            }
        } catch (error) {
            setMessage("Server error. Please try again later.");
        }
    };

    // Prevent spaces while typing
    const handleUsernameChange = (e) => {
        const value = e.target.value.replace(/\s/g, "");
        setUsername(value);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value.replace(/\s/g, "");
        setPassword(value);
    };

    return (
        <div className="min-h-screen max-w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300">
                <h2 className="text-3xl font-bold text-center text-white mb-6">
                    {isRegister ? "Create Account" : "Welcome Back"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={handleUsernameChange}
                        required
                        className="w-full px-4 py-3 bg-gray-900 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition mb-2"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-4 py-3 bg-gray-900 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition mb-2"
                    />
                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
                    >
                        {isRegister ? "Register" : "Login"}
                    </button>
                </form>

                {message && (
                    <p
                        className={`mt-4 text-center text-sm ${message.includes("success") ? "text-green-400" : "text-red-400"
                            }`}
                    >
                        {message}
                    </p>
                )}

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-indigo-400 hover:text-indigo-300 transition text-sm"
                    >
                        {isRegister
                            ? "Already have an account? Login"
                            : "New user? Register"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
