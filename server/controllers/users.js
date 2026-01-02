const router = require("express").Router();
const pool = require("../config/db");
const hasPermission = require("../middleware/hasPermission");

// GET USERS
router.get("/", async (req, res) => {
  try {
    const users = await pool.query(`
      SELECT 
        u.user_id,
        u.username,
        u.role_id,
        r.role_name,
        u.created_at,
        u.updated_at,
        u.isactive
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE r.role_name != 'superadmin'
      ORDER BY u.user_id ASC
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
    const { role_id } = req.body;

    const updated = await pool.query(
      `
      UPDATE users
      SET role_id = $1, updated_at = NOW()
      WHERE user_id = $2
      RETURNING *
      `,
      [role_id, id]
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
