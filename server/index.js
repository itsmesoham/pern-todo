const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

//middleware
app.use(cors());
app.use(express.json()); //req.body

// ROUTES //

const authRoutes = require("./auth");
app.use("/auth", authRoutes);

// Create a todo
app.post("/todos", async (req, res) => {
    try {
        const { description, amount, user_id } = req.body;

        if (!description || description.trim() === "") {
            return res.status(400).json({ error: "Description cannot be empty" });
        }
        if (amount === undefined || amount === null || isNaN(amount)) {
            return res.status(400).json({ error: "Amount must be a number" });
        }
        if (!user_id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const newTodo = await pool.query(
            `INSERT INTO todo (description, amount, user_id, created_at, updated_at) 
             VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
            [description.trim(), amount, user_id]
        );

        res.json(newTodo.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});


// Get all todos
app.get("/todos/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params;
        const { role } = req.query;

        let allTodos;
        if (role === "superadmin") {
            // superadmin sees all todos
            allTodos = await pool.query(
                "SELECT todo_id, description, amount, created_at, updated_at, user_id FROM todo ORDER BY updated_at DESC"
            );
        } else {
            // normal user sees only their todos
            allTodos = await pool.query(
                "SELECT todo_id, description, amount, created_at, updated_at FROM todo WHERE user_id = $1 ORDER BY updated_at DESC",
                [user_id]
            );
        }

        res.json(allTodos.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Get a specific todo
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

// Update a todo
app.put("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { description, amount, user_id, role } = req.body;

        if (!description || description.trim() === "") return res.status(400).json({ error: "Description cannot be empty" });
        if (!amount || isNaN(amount)) return res.status(400).json({ error: "Amount must be a number" });

        let result;
        if (role === "superadmin") {
            result = await pool.query(
                `UPDATE todo SET description = $1, amount = $2, updated_at = NOW() WHERE todo_id = $3`,
                [description.trim(), amount, id]
            );
        } else {
            result = await pool.query(
                `UPDATE todo SET description = $1, amount = $2, updated_at = NOW() WHERE todo_id = $3 AND user_id = $4`,
                [description.trim(), amount, id, user_id]
            );
        }

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Todo not found or you don't have permission" });
        }

        res.json({ message: "Todo updated successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Delete a todo (role-based: Superadmin or Owner)
app.delete("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, role } = req.body; // coming from frontend

        // if user is a normal user, they can only delete their own todos
        if (role === "user") {
            const result = await pool.query(
                "DELETE FROM todo WHERE todo_id = $1 AND user_id = $2",
                [id, user_id]
            );

            if (result.rowCount === 0) {
                return res
                    .status(404)
                    .json({ error: "Todo not found or you don't have permission" });
            }

            return res.json({ message: "Todo deleted successfully" });
        }

        // if user is superadmin, they can delete any todo
        if (role === "superadmin") {
            await pool.query("DELETE FROM todo WHERE todo_id = $1", [id]);
            return res.json({ message: "Todo deleted by superadmin" });
        }

        // invalid role case
        return res.status(403).json({ error: "Invalid role or access denied" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));