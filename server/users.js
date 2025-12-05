const router = require("express").Router();
const pool = require("./db");

// GET USERS
router.get("/", async (req, res) => {
  try {
    const users = await pool.query(`
        SELECT user_id, username, role, created_at, updated_at, isActive 
        FROM users
        WHERE role != 'superadmin'
        ORDER BY user_id ASC;
        `);
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

// UPDATE USER ROLE
router.put("/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const updated = await pool.query(
      `
            UPDATE users
            SET role = $1, updated_at = NOW()
            WHERE user_id = $2
            RETURNING *
            `,
      [role.toLowerCase(), id]   // ensure lowercase roles
    );

    res.json({ message: "Role updated", user: updated.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// UPDATE USER STATUS
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isactive } = req.body;

    const updated = await pool.query(
      `
            UPDATE users
            SET isActive = $1, updated_at = NOW()
            WHERE user_id = $2
            RETURNING *
            `,
      [isactive, id]
    );

    res.json({ message: "Status updated", user: updated.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
