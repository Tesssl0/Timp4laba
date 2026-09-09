import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_LABELS = {
  draft: "Черновик",
  pending: "На модерации",
  published: "Опубликована",
  rejected: "Отклонена",
  archived: "Архив"
};

const ACTION_LABELS = {
  approve: "Одобрение",
  reject: "Отклонение",
  revise: "Возврат на доработку",
  archive: "Отправка в архив"
};

function ArticleDetail() {

  const { id } = useParams();
  const navigate = useNavigate();
  const { isStaff } = useAuth();

  const [article, setArticle] = useState(null);
  const [log, setLog] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [articleRes, commentsRes] = await Promise.all([
        api.get(`/articles/${id}`),
        api.get(`/comments/article/${id}`)
      ]);
      setArticle(articleRes.data);
      setComments(commentsRes.data);

      if (isStaff) {
        const logRes = await api.get(`/moderation/${id}/log`);
        setLog(logRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Не удалось загрузить статью");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const runAction = async (action, needsReason) => {
    if (needsReason && !reason) {
      setError("Укажите причину перед отправкой");
      return;
    }

    try {
      await api.post(`/moderation/${id}/${action}`, { reason });
      setReason("");
      setError("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Действие не выполнено");
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.post(`/comments/article/${id}`, { content: newComment });
      setNewComment("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Не удалось добавить комментарий");
    }
  };

  const reportComment = async (commentId) => {
    const commentReason = window.prompt("Причина жалобы:");
    if (!commentReason) return;

    try {
      await api.post(`/comments/${commentId}/report`, { reason: commentReason });
    } catch (err) {
      setError(err.response?.data?.message || "Не удалось отправить жалобу");
    }
  };

  if (!article) {
    return (
      <div className="page">
        {error ? <p className="error">{error}</p> : <p className="muted">Загрузка…</p>}
      </div>
    );
  }

  return (
    <div className="page">
      <button className="btn-ghost" onClick={() => navigate("/articles")}>
        ← К списку статей
      </button>

      {error && <p className="error">{error}</p>}

      <section className="card">
        <div className="article-detail__meta">
          <h1 className="page-title">{article.title}</h1>
          <span className={`badge badge--${article.status === "published" ? "success" : "muted"}`}>
            {STATUS_LABELS[article.status]}
          </span>
        </div>

        <p className="muted">
          {article.category || "Без рубрики"} · {article.author} ·{" "}
          {new Date(article.created_at).toLocaleString("ru-RU")}
        </p>

        <div className="article-detail__body">{article.content}</div>

        {isStaff && (
          <div className="moderator-actions">
            <input
              type="text"
              placeholder="Причина (для отклонения / доработки / архива)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="table__actions">
              <button className="btn-success" onClick={() => runAction("approve", false)}>
                Опубликовать
              </button>
              <button className="btn-danger" onClick={() => runAction("reject", true)}>
                Отклонить
              </button>
              <button className="btn-warning" onClick={() => runAction("revise", true)}>
                На доработку
              </button>
              <button className="btn-ghost" onClick={() => runAction("archive", true)}>
                В архив
              </button>
            </div>
          </div>
        )}
      </section>

      {isStaff && (
        <section className="card">
          <h2 className="card__title">Журнал модерации</h2>
          {log.length === 0 ? (
            <p className="muted">Записей пока нет</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Модератор</th>
                  <th>Действие</th>
                  <th>Причина</th>
                </tr>
              </thead>
              <tbody>
                {log.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.created_at).toLocaleString("ru-RU")}</td>
                    <td>{entry.moderator || "—"}</td>
                    <td>{ACTION_LABELS[entry.action] || entry.action}</td>
                    <td>{entry.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      <section className="card">
        <h2 className="card__title">Комментарии читателей</h2>

        {comments.length === 0 ? (
          <p className="muted">Комментариев пока нет</p>
        ) : (
          <ul className="comment-list">
            {comments.map((comment) => (
              <li className="comment-list__item" key={comment.id}>
                <div className="comment-list__head">
                  <strong>{comment.author}</strong>
                  <span className="muted">
                    {new Date(comment.created_at).toLocaleString("ru-RU")}
                  </span>
                  {comment.status === "hidden" && (
                    <span className="badge badge--danger">Скрыт</span>
                  )}
                </div>
                <p>{comment.content}</p>
                <button className="btn-ghost btn-ghost--small" onClick={() => reportComment(comment.id)}>
                  Пожаловаться
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addComment} className="stacked-form">
          <textarea
            placeholder="Написать комментарий"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <button type="submit" className="btn-primary">Отправить</button>
        </form>
      </section>
    </div>
  );
}

export default ArticleDetail;
