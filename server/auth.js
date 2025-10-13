const express = require("express");
const router = express.Router();
const pool = require("./db");

// REGISTER
router.post("/register", async (req, res) => {
    try {
        let { username, password } = req.body;

        // Trim and validate
        username = username.trim();
        password = password.trim();

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username and password are required." });
        }

        if (/\s/.test(username) || /\s/.test(password)) {
            return res.status(400).json({ success: false, message: "Username and password cannot contain spaces." });
        }

        // Check if user already exists
        const existingUser = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: "User already exists." });
        }

        // Insert new user
        const newUser = await pool.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
            [username, password]
        );

        res.json({ success: true, message: "Registration successful", user: newUser.rows[0] });
    } catch (err) {
        console.error("Error during registration:", err.message);
        res.status(500).json({ success: false, message: "Server error during registration." });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        let { username, password } = req.body;

        // Trim and validate
        username = username.trim();
        password = password.trim();

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username and password are required." });
        }

        if (/\s/.test(username) || /\s/.test(password)) {
            return res.status(400).json({ success: false, message: "Username and password cannot contain spaces." });
        }

        // Check credentials
        const user = await pool.query(
            "SELECT * FROM users WHERE username = $1 AND password = $2",
            [username, password]
        );

        if (user.rows.length > 0) {
            res.json({ success: true, message: "Login successful", user: user.rows[0] });
        } else {
            res.json({ success: false, message: "Invalid credentials." });
        }
    } catch (err) {
        console.error("Error during login:", err.message);
        res.status(500).json({ success: false, message: "Server error during login." });
    }
});

module.exports = router;
