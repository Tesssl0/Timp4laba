const pool = require("../db");
const asyncHandler = require("../middleware/asyncHandler");

// GET /api/moderation/queue — материалы, ожидающие проверки
exports.getQueue = asyncHandler(async (req, res) => {

  const result = await pool.query(
    `SELECT a.id, a.title, a.category, a.created_at, u.username AS author
     FROM articles a
     JOIN users u ON u.id = a.user_id
     WHERE a.status = 'pending'
     ORDER BY a.created_at ASC`
  );

  res.json(result.rows);

});

const logAction = (articleId, moderatorId, action, reason) =>
  pool.query(
    `INSERT INTO moderation_logs (article_id, moderator_id, action, reason)
     VALUES ($1, $2, $3, $4)`,
    [articleId, moderatorId, action, reason || null]
  );

const setStatus = async (req, res, status, action) => {

  const { id } = req.params;
  const { reason } = req.body;

  const result = await pool.query(
    `UPDATE articles SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );

  if (result.rows.length === 0) {
    const err = new Error("Статья не найдена");
    err.status = 404;
    throw err;
  }

  await logAction(id, req.user.id, action, reason);

  res.json(result.rows[0]);

};

// POST /api/moderation/:id/approve — «Одобрить»
exports.approve = asyncHandler((req, res) =>
  setStatus(req, res, "published", "approve")
);

// POST /api/moderation/:id/reject — «Отклонить»
exports.reject = asyncHandler((req, res) => {
  if (!req.body.reason) {
    const err = new Error("Укажите причину отклонения");
    err.status = 400;
    throw err;
  }
  return setStatus(req, res, "rejected", "reject");
});

// POST /api/moderation/:id/revise — «Отправить на доработку»
exports.revise = asyncHandler((req, res) => {
  if (!req.body.reason) {
    const err = new Error("Укажите причину возврата на доработку");
    err.status = 400;
    throw err;
  }
  return setStatus(req, res, "draft", "revise");
});

// POST /api/moderation/:id/archive — «В архив»
exports.archive = asyncHandler((req, res) =>
  setStatus(req, res, "archived", "archive")
);

// GET /api/moderation/:id/log — журнал модерации конкретной статьи
exports.getLog = asyncHandler(async (req, res) => {

  const { id } = req.params;

  const result = await pool.query(
    `SELECT l.id, l.action, l.reason, l.created_at, u.username AS moderator
     FROM moderation_logs l
     LEFT JOIN users u ON u.id = l.moderator_id
     WHERE l.article_id = $1
     ORDER BY l.created_at DESC`,
    [id]
  );

  res.json(result.rows);

});

// GET /api/moderation/complaints — жалобы на комментарии, сгруппированные
// по комментарию, с количеством жалоб
exports.getComplaints = asyncHandler(async (req, res) => {

  const result = await pool.query(
    `SELECT
       c.id AS comment_id,
       c.content,
       c.status,
       cu.username AS comment_author,
       COUNT(cr.id) AS report_count,
       MAX(cr.reason) AS last_reason,
       MAX(cr.created_at) AS last_reported_at
     FROM comment_reports cr
     JOIN comments c ON c.id = cr.comment_id
     JOIN users cu ON cu.id = c.user_id
     GROUP BY c.id, c.content, c.status, cu.username
     ORDER BY report_count DESC`
  );

  res.json(result.rows);

});

// POST /api/moderation/comments/:id/hide — «Скрыть комментарий»
exports.hideComment = asyncHandler(async (req, res) => {

  const { id } = req.params;

  const result = await pool.query(
    `UPDATE comments SET status = 'hidden' WHERE id = $1 RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    const err = new Error("Комментарий не найден");
    err.status = 404;
    throw err;
  }

  res.json(result.rows[0]);

});

// POST /api/moderation/comments/:id/restore — «Вернуть комментарий»
exports.restoreComment = asyncHandler(async (req, res) => {

  const { id } = req.params;

  const result = await pool.query(
    `UPDATE comments SET status = 'visible' WHERE id = $1 RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    const err = new Error("Комментарий не найден");
    err.status = 404;
    throw err;
  }

  res.json(result.rows[0]);

});
