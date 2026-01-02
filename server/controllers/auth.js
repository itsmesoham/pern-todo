const router = require("express").Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtAuth = require("../middleware/jwtAuth");

require("dotenv").config();

// Register
router.post("/register", async (req, res) => {
    try {
        const { username, password, role_id } = req.body;

        const userExists = await pool.query(
            "SELECT 1 FROM users WHERE username = $1",
            [username]
        );

        if (userExists.rows.length > 0)
            return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `
      INSERT INTO users (username, password, role_id)
      VALUES ($1, $2, $3)
      RETURNING user_id, username, role_id
      `,
            [username, hashedPassword, role_id]
        );

        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const result = await pool.query(
            `
      SELECT 
        u.user_id,
        u.username,
        u.password,
        u.isactive,
        r.role_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.username = $1
      `,
            [username]
        );

        if (result.rows.length === 0)
            return res.status(400).json({ error: "Invalid username or password" });

        const user = result.rows[0];

        if (!user.isactive)
            return res.status(403).json({
                error: "Your account is inactive. Contact admin."
            });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            return res.status(400).json({ error: "Invalid username or password" });

        // ✅ JWT WITH role_name
        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                role_name: user.role_name
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        res.json({
            message: "Logged in",
            user: {
                user_id: user.user_id,
                username: user.username,
                role_name: user.role_name
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Check login status
router.get("/me", jwtAuth, (req, res) => {
  res.json({
    user_id: req.user.user_id,
    username: req.user.username,
    role_name: req.user.role_name
  });
});

module.exports = router;
