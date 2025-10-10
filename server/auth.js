const express = require("express");
const router = express.Router();
const pool = require("./db");

// REGISTER

router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await pool.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
            [username, password]
        );
        res.json({ success: true, user: user.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "User already exists or error occured" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await pool.query(
            "SELECT * FROM users WHERE username = $1 AND password = $2",
            [username, password]
        );

        if (user.rows.length > 0) {
            res.json({ success: true, message: "Login successful", user: user.rows[0] });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Error occurred" });
    }
});

module.exports = router;