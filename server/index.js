const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db")

//middleware

app.use(cors());
app.use(express.json()); //req.body

//ROUTES//

//create a todo

app.post("/todos", async (req, res) => {
    try {
        const { description } = req.body;

        if (!description || description.trim() === "") {
            return res.status(400).json({ error: "Description cannot be empty" });
        }

        const newTodo = await pool.query(
            `INSERT INTO todo (description, created_at, updated_at) 
            VALUES($1, NOW(), NOW()) RETURNING *`,
            [description.trim()]
        );

        res.json(newTodo.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//get all todos

app.get("/todos", async (req, res) => {
    try {
        const allTodos = await pool.query("SELECT todo_id, description, created_at, updated_at FROM todo ORDER BY updated_at DESC");
        res.json(allTodos.rows);
    } catch (error) {
        console.error(err.message);
    }
});

//get a todo

app.get("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const todos = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [id]);

        res.json(todos.rows[0]);
    } catch (error) {
        console.error(err.message);
    }
});

//update a todo

app.put("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const updateTodo = await pool.query(`UPDATE todo 
        SET description = $1, updated_at = NOW() 
        WHERE todo_id = $2`,
            [description, id]
        );

        res.json("Todo was updated!");
    } catch (error) {
        console.error(err.message);
    }
});

//delete a todo

app.delete("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleteTodo = await pool.query("DELETE FROM todo WHERE todo_id = $1", [id]);

        res.json("Todo was deleted!");
    } catch (err) {
        console.log(err.message);
    }
});

app.listen(5000, () => {
    console.log("server has started on port 5000")
});