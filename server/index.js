const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

//middleware
app.use(cors());
app.use(express.json()); //req.body

// ROUTES //

// Create a todo
app.post("/todos", async (req, res) => {
    try {
        const { description, amount } = req.body;

        if (!description || description.trim() === "") {
            return res.status(400).json({ error: "Description cannot be empty" });
        }

        if (amount === undefined || amount === null || isNaN(amount)) {
            return res.status(400).json({ error: "Amount must be a number" });
        }

        const newTodo = await pool.query(
            `INSERT INTO todo (description, amount, created_at, updated_at) 
             VALUES ($1, $2, NOW(), NOW()) RETURNING *`,
            [description.trim(), amount]
        );

        res.json(newTodo.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Get all todos
app.get("/todos", async (req, res) => {
    try {
        const allTodos = await pool.query(
            "SELECT todo_id, description, amount, created_at, updated_at FROM todo ORDER BY updated_at DESC"
        );
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
        const { description, amount } = req.body;

        if (!description || description.trim() === "") {
            return res.status(400).json({ error: "Description cannot be empty" });
        }

        if (amount === undefined || amount === null || isNaN(amount)) {
            return res.status(400).json({ error: "Amount must be a number" });
        }

        await pool.query(
            `UPDATE todo 
             SET description = $1, amount = $2, updated_at = NOW() 
             WHERE todo_id = $3`,
            [description.trim(), amount, id]
        );

        res.json({ message: "Todo was updated!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Delete a todo
app.delete("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM todo WHERE todo_id = $1", [id]);
        res.json({ message: "Todo was deleted!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(5000, () => {
    console.log("Server has started on port 5000");
});