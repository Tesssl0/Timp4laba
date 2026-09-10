const pool = require("../db");
const asyncHandler = require("../middleware/asyncHandler");

const isStaff = (role) => role === "moderator" || role === "admin";

// GET /api/articles
// Модератор/админ видят все статьи. Обычный пользователь — только
// опубликованные и свои собственные (включая черновики и статьи на модерации).
exports.getAll = asyncHandler(async (req, res) => {

  const { status } = req.query;

  let result;

  if (req.user && isStaff(req.user.role)) {

    result = status
      ? await pool.query(
          `SELECT a.*, u.username AS author
           FROM articles a
           JOIN users u ON u.id = a.user_id
           WHERE a.status = $1
           ORDER BY a.id DESC`,
          [status]
        )
      : await pool.query(
          `SELECT a.*, u.username AS author
           FROM articles a
           JOIN users u ON u.id = a.user_id
           ORDER BY a.id DESC`
        );

  } else if (req.user) {

    result = await pool.query(
      `SELECT a.*, u.username AS author
       FROM articles a
       JOIN users u ON u.id = a.user_id
       WHERE a.status = 'published' OR a.user_id = $1
       ORDER BY a.id DESC`,
      [req.user.id]
    );

  } else {

    result = await pool.query(
      `SELECT a.*, u.username AS author
       FROM articles a
       JOIN users u ON u.id = a.user_id
       WHERE a.status = 'published'
       ORDER BY a.id DESC`
    );

  }

  res.json(result.rows);

});

exports.getOne = asyncHandler(async (req, res) => {

  const { id } = req.params;

  const result = await pool.query(
    `SELECT a.*, u.username AS author
     FROM articles a
     JOIN users u ON u.id = a.user_id
     WHERE a.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    const err = new Error("Статья не найдена");
    err.status = 404;
    throw err;
  }

  const article = result.rows[0];

  const isOwner = req.user && req.user.id === article.user_id;
  const canSeeAny = req.user && isStaff(req.user.role);

  if (article.status !== "published" && !isOwner && !canSeeAny) {
    const err = new Error("Статья не найдена");
    err.status = 404;
    throw err;
  }

  res.json(article);

});

// POST /api/articles — новая статья всегда уходит на модерацию
exports.create = asyncHandler(async (req, res) => {

  const { title, content, category } = req.body;

  if (!title || !content) {
    const err = new Error("Поля title и content обязательны");
    err.status = 400;
    throw err;
  }

  const result = await pool.query(
    `INSERT INTO articles (title, content, category, user_id, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [title, content, category || null, req.user.id]
  );

  res.status(201).json(result.rows[0]);

});

// PUT /api/articles/:id
// Автор может править свою статью, только пока она в черновике/на модерации.
// Модератор/админ может редактировать в любом статусе.
exports.update = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const { title, content, category } = req.body;

  if (!title || !content) {
    const err = new Error("Поля title и content обязательны");
    err.status = 400;
    throw err;
  }

  const existing = await pool.query(
    `SELECT * FROM articles WHERE id = $1`,
    [id]
  );

  if (existing.rows.length === 0) {
    const err = new Error("Статья не найдена");
    err.status = 404;
    throw err;
  }

  const article = existing.rows[0];
  const isOwner = req.user.id === article.user_id;
  const staff = isStaff(req.user.role);

  if (!staff && !(isOwner && ["draft", "pending"].includes(article.status))) {
    const err = new Error("Недостаточно прав для редактирования статьи");
    err.status = 403;
    throw err;
  }

  // Если автор дорабатывает статью, возвращённую модератором (статус
  // draft), при сохранении она автоматически уходит обратно в очередь
  // на модерацию. Модератор/админ, редактируя статью, статус не меняет.
  const nextStatus = !staff && article.status === "draft" ? "pending" : article.status;

  const result = await pool.query(
    `UPDATE articles
     SET title = $1, content = $2, category = $3, status = $4, updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [title, content, category || null, nextStatus, id]
  );

  res.json(result.rows[0]);

});

// DELETE /api/articles/:id
exports.remove = asyncHandler(async (req, res) => {

  const { id } = req.params;

  const existing = await pool.query(
    `SELECT * FROM articles WHERE id = $1`,
    [id]
  );

  if (existing.rows.length === 0) {
    const err = new Error("Статья не найдена");
    err.status = 404;
    throw err;
  }

  const article = existing.rows[0];
  const isOwner = req.user.id === article.user_id;
  const staff = isStaff(req.user.role);

  if (!staff && !isOwner) {
    const err = new Error("Недостаточно прав для удаления статьи");
    err.status = 403;
    throw err;
  }

  await pool.query(`DELETE FROM articles WHERE id = $1`, [id]);

  res.json({ message: "Deleted" });

});
