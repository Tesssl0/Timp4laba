const pool = require("../db");
const asyncHandler = require("../middleware/asyncHandler");

const isStaff = (role) => role === "moderator" || role === "admin";

// GET /api/comments/article/:articleId
exports.getByArticle = asyncHandler(async (req, res) => {

  const { articleId } = req.params;
  const staff = req.user && isStaff(req.user.role);

  const result = staff
    ? await pool.query(
        `SELECT c.*, u.username AS author
         FROM comments c
         JOIN users u ON u.id = c.user_id
         WHERE c.article_id = $1
         ORDER BY c.created_at ASC`,
        [articleId]
      )
    : await pool.query(
        `SELECT c.*, u.username AS author
         FROM comments c
         JOIN users u ON u.id = c.user_id
         WHERE c.article_id = $1 AND c.status = 'visible'
         ORDER BY c.created_at ASC`,
        [articleId]
      );

  res.json(result.rows);

});

// POST /api/comments/article/:articleId
exports.create = asyncHandler(async (req, res) => {

  const { articleId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    const err = new Error("Комментарий не может быть пустым");
    err.status = 400;
    throw err;
  }

  const result = await pool.query(
    `INSERT INTO comments (article_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [articleId, req.user.id, content.trim()]
  );

  res.status(201).json(result.rows[0]);

});

// POST /api/comments/:id/report — читатель жалуется на комментарий
exports.report = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    const err = new Error("Укажите причину жалобы");
    err.status = 400;
    throw err;
  }

  const comment = await pool.query(`SELECT id FROM comments WHERE id = $1`, [id]);

  if (comment.rows.length === 0) {
    const err = new Error("Комментарий не найден");
    err.status = 404;
    throw err;
  }

  await pool.query(
    `INSERT INTO comment_reports (comment_id, reporter_id, reason)
     VALUES ($1, $2, $3)`,
    [id, req.user.id, reason.trim()]
  );

  res.status(201).json({ message: "Жалоба отправлена" });

});
