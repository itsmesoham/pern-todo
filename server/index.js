const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

app.use(cors());
app.use(express.json());

// Auth routes
const authRoutes = require("./auth");
app.use("/auth", authRoutes);

// Create Todo
app.post("/todos", async (req, res) => {
    try {
        const { description, amount, user_id } = req.body;

        if (!description.trim())
            return res.status(400).json({ error: "Description cannot be empty" });

        if (amount === undefined || amount === null || isNaN(amount))
            return res.status(400).json({ error: "Amount must be a number" });

        if (!user_id)
            return res.status(400).json({ error: "User ID is required" });

        const newTodo = await pool.query(
            `INSERT INTO todo 
            (description, amount, user_id, created_by, updated_by, created_at, updated_at)
            VALUES ($1, $2, $3, $3, NULL, NOW(), NOW())
            RETURNING *`,
            [description.trim(), amount, user_id]
        );

        res.json(newTodo.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Get Todos (role based)
app.get("/todos", async (req, res) => {
    try {
        const { user_id, role } = req.query;

        let query;
        let params = [];

        if (role === "superadmin") {
            query = `
                SELECT 
                    t.todo_id, t.description, t.amount,
                    t.created_at, t.updated_at,
                    t.created_by, t.updated_by,
                    u1.username AS created_by_user,
                    u2.username AS updated_by_user
                FROM todo t
                JOIN users u1 ON t.created_by = u1.user_id
                LEFT JOIN users u2 ON t.updated_by = u2.user_id
                ORDER BY t.updated_at DESC
            `;
        } else {
            query = `
                SELECT 
                    t.todo_id, t.description, t.amount,
                    t.created_at, t.updated_at,
                    t.created_by, t.updated_by,
                    u1.username AS created_by_user,
                    u2.username AS updated_by_user
                FROM todo t
                JOIN users u1 ON t.created_by = u1.user_id
                LEFT JOIN users u2 ON t.updated_by = u2.user_id
                WHERE t.user_id = $1
                ORDER BY t.updated_at DESC
            `;
            params = [user_id];
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Get one todo
app.get("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const todo = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [id]);
        res.json(todo.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Update Todo
app.put("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { description, amount, user_id, role } = req.body;

        if (!description.trim())
            return res.status(400).json({ error: "Description cannot be empty" });

        if (amount === undefined || amount === null || isNaN(amount))
            return res.status(400).json({ error: "Amount must be a number" });

        let result;

        if (role === "superadmin") {
            result = await pool.query(
                `UPDATE todo
                 SET description = $1, amount = $2, updated_at = NOW(), updated_by = $3
                 WHERE todo_id = $4`,
                [description.trim(), amount, user_id, id]
            );
        } else {
            result = await pool.query(
                `UPDATE todo
                 SET description = $1, amount = $2, updated_at = NOW(), updated_by = $3
                 WHERE todo_id = $4 AND user_id = $5`,
                [description.trim(), amount, user_id, id, user_id]
            );
        }

        if (result.rowCount === 0)
            return res.status(404).json({ error: "Todo not found or no permission" });

        res.json({ message: "Todo updated successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, role } = req.body;

        console.log("DELETE BODY:", req.body);  // debug

        let deleted;

        if (role === "superadmin") {
            // superadmin → delete any todo
            deleted = await pool.query(
                "DELETE FROM todo WHERE todo_id = $1 RETURNING *",
                [id]
            );
        } else {
            // normal user → can delete only their own todo
            deleted = await pool.query(
                "DELETE FROM todo WHERE todo_id = $1 AND created_by = $2 RETURNING *",
                [id, user_id]
            );
        }

        if (deleted.rows.length === 0) {
            return res.status(403).json({ error: "Not authorized or todo not found" });
        }

        res.json({ message: "Todo deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
