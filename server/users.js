const router = require("express").Router();
const pool = require("./db");

router.get("/", async (req, res) => {
    try {
        const users = await pool.query(`
        SELECT user_id, username, role, created_at, updated_at, isActive 
        FROM users
        WHERE role != 'superadmin'
        ORDER BY user_id ASC;
        `
        );
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// DELETE USER
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE user_id = $1", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
