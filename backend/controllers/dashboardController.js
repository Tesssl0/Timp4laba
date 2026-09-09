const pool = require("../db");
const asyncHandler = require("../middleware/asyncHandler");

// GET /api/dashboard/stats
exports.getStats = asyncHandler(async (req, res) => {

  const [published, pending, complaints, avgReaction, byCategory] = await Promise.all([

    pool.query(`SELECT COUNT(*) FROM articles WHERE status = 'published'`),

    pool.query(`SELECT COUNT(*) FROM articles WHERE status = 'pending'`),

    pool.query(`SELECT COUNT(*) FROM comment_reports`),

    // Среднее время между созданием статьи и первым решением модератора
    pool.query(`
      SELECT AVG(first_action.created_at - a.created_at) AS avg_reaction
      FROM articles a
      JOIN LATERAL (
        SELECT created_at
        FROM moderation_logs l
        WHERE l.article_id = a.id
        ORDER BY l.created_at ASC
        LIMIT 1
      ) first_action ON true
    `),

    pool.query(`
      SELECT COALESCE(category, 'Без рубрики') AS category, COUNT(*) AS count
      FROM articles
      WHERE status = 'published'
      GROUP BY category
      ORDER BY count DESC
    `)

  ]);

  const avgIntervalSeconds = avgReaction.rows[0].avg_reaction
    ? Math.round(
        // node-postgres возвращает interval как объект {hours, minutes, ...}
        (avgReaction.rows[0].avg_reaction.hours || 0) * 3600 +
        (avgReaction.rows[0].avg_reaction.minutes || 0) * 60 +
        (avgReaction.rows[0].avg_reaction.seconds || 0) +
        (avgReaction.rows[0].avg_reaction.days || 0) * 86400
      )
    : null;

  res.json({
    published: Number(published.rows[0].count),
    pending: Number(pending.rows[0].count),
    complaints: Number(complaints.rows[0].count),
    avgReactionSeconds: avgIntervalSeconds,
    byCategory: byCategory.rows.map((r) => ({
      category: r.category,
      count: Number(r.count)
    }))
  });

});
