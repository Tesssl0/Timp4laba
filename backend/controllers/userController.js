const pool = require("../db");
const asyncHandler = require("../middleware/asyncHandler");

exports.getAll = asyncHandler(async (req, res) => {

  const result = await pool.query(
    `SELECT id, username, email, role, created_at
     FROM users
     ORDER BY created_at DESC`
  );

  res.json(result.rows);

});

const ALLOWED_ROLES = ["user", "moderator", "admin"];

// PATCH /api/users/:id/role — «Назначить модератором» / «Назначить
// администратором» / «Вернуть роль пользователя» из спецификации.
exports.updateRole = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const { role } = req.body;

  if (!ALLOWED_ROLES.includes(role)) {
    const err = new Error("Недопустимая роль");
    err.status = 400;
    throw err;
  }

  if (Number(id) === req.user.id) {
    const err = new Error("Нельзя изменить собственную роль");
    err.status = 400;
    throw err;
  }

  const result = await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2
     RETURNING id, username, email, role, created_at`,
    [role, id]
  );

  if (result.rows.length === 0) {
    const err = new Error("Пользователь не найден");
    err.status = 404;
    throw err;
  }

  res.json(result.rows[0]);

});
