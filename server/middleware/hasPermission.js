const pool = require("../config/db");

module.exports = function hasPermission(permissionName) {
  return async function (req, res, next) {
    try {
      const { user_id } = req.user;

      const result = await pool.query(
        `
        SELECT 1
        FROM role_permissions rp
        JOIN users u ON rp.role_id = u.role_id
        JOIN permissions p ON rp.permission_id = p.permission_id
        WHERE u.user_id = $1
          AND p.permission_name = $2
        `,
        [user_id, permissionName]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ error: "Permission denied" });
      }

      next();
    } catch (err) {
      console.error("PERMISSION ERROR →", err.message);
      res.status(500).json({ error: "Server error" });
    }
  };
};
