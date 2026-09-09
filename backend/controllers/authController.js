const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const asyncHandler = require("../middleware/asyncHandler");

exports.register = asyncHandler(async (req, res) => {

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    const err = new Error("Поля username, email и password обязательны");
    err.status = 400;
    throw err;
  }

  if (password.length < 6) {
    const err = new Error("Пароль должен содержать не менее 6 символов");
    err.status = 400;
    throw err;
  }

  const hash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, role`,
    [username, email, hash]
  );

  res.status(201).json(result.rows[0]);

});

exports.login = asyncHandler(async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    const err = new Error("Поля email и password обязательны");
    err.status = 400;
    throw err;
  }

  const user = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  if (user.rows.length === 0) {
    const err = new Error("User not found");
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.rows[0].password_hash);

  if (!valid) {
    const err = new Error("Wrong password");
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { id: user.rows[0].id, role: user.rows[0].role, username: user.rows[0].username },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.json({
    token,
    user: {
      id: user.rows[0].id,
      username: user.rows[0].username,
      email: user.rows[0].email,
      role: user.rows[0].role
    }
  });

});
