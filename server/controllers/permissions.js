const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| GET ALL ROLES (excluding superadmin)
|--------------------------------------------------------------------------
*/
router.get("/roles", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT role_id, role_name
      FROM roles
      WHERE role_name != 'superadmin'
      ORDER BY role_id ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET ROLES ERROR →", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/*
|--------------------------------------------------------------------------
| GET ALL PERMISSIONS
|--------------------------------------------------------------------------
*/
router.get("/permissions", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT permission_id, permission_name
      FROM permissions
      ORDER BY permission_id ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET PERMISSIONS ERROR →", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/*
|--------------------------------------------------------------------------
| GET PERMISSIONS FOR A ROLE
|--------------------------------------------------------------------------
*/
router.get("/role-permissions/:role_id", async (req, res) => {
  try {
    const { role_id } = req.params;

    const result = await pool.query(
      `
      SELECT p.permission_id, p.permission_name
      FROM role_permissions rp
      JOIN permissions p
        ON rp.permission_id = p.permission_id
      WHERE rp.role_id = $1
      ORDER BY p.permission_id ASC
      `,
      [role_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET ROLE PERMISSIONS ERROR →", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/*
|--------------------------------------------------------------------------
| UPDATE ROLE PERMISSIONS
| - Deletes old permissions
| - Inserts new permissions
| - Wrapped in transaction
|--------------------------------------------------------------------------
*/
router.put("/role-permissions/:role_id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { role_id } = req.params;
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds)) {
      return res.status(400).json({ error: "permissionIds must be an array" });
    }

    await client.query("BEGIN");

    // Remove existing permissions
    await client.query(
      "DELETE FROM role_permissions WHERE role_id = $1",
      [role_id]
    );

    // Insert new permissions
    for (const permission_id of permissionIds) {
      await client.query(
        `
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES ($1, $2)
        `,
        [role_id, permission_id]
      );
    }

    await client.query("COMMIT");

    res.json({ message: "Role permissions updated successfully" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("UPDATE ROLE PERMISSIONS ERROR →", err.message);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

module.exports = router;
