import { useEffect, useState } from "react";
import api from "../services/api";

function Moderation() {

  const [queue, setQueue] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");
  const [reasonDrafts, setReasonDrafts] = useState({});

  const load = async () => {
    try {
      const [queueRes, complaintsRes] = await Promise.all([
        api.get("/moderation/queue"),
        api.get("/moderation/complaints")
      ]);
      setQueue(queueRes.data);
      setComplaints(complaintsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Не удалось загрузить данные модерации");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const runAction = async (articleId, action, needsReason) => {
    try {
      const reason = reasonDrafts[articleId];

      if (needsReason && !reason) {
        setError("Укажите причину перед отправкой");
        return;
      }

      await api.post(`/moderation/${articleId}/${action}`, { reason });
      setError("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Действие не выполнено");
    }
  };

  const hideComment = async (commentId) => {
    try {
      await api.post(`/moderation/comments/${commentId}/hide`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Не удалось скрыть комментарий");
    }
  };

  const restoreComment = async (commentId) => {
    try {
      await api.post(`/moderation/comments/${commentId}/restore`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Не удалось вернуть комментарий");
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Модерация</h1>

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2 className="card__title">Очередь материалов</h2>

        {queue.length === 0 ? (
          <p className="muted">Очередь пуста</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Заголовок</th>
                <th>Автор</th>
                <th>Категория</th>
                <th>Дата создания</th>
                <th>Причина (для отклонения / доработки)</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((article) => (
                <tr key={article.id}>
                  <td>{article.title}</td>
                  <td>{article.author}</td>
                  <td>{article.category || "—"}</td>
                  <td>{new Date(article.created_at).toLocaleString("ru-RU")}</td>
                  <td>
                    <input
                      type="text"
                      placeholder="Причина"
                      value={reasonDrafts[article.id] || ""}
                      onChange={(e) =>
                        setReasonDrafts({ ...reasonDrafts, [article.id]: e.target.value })
                      }
                    />
                  </td>
                  <td className="table__actions">
                    <button className="btn-success" onClick={() => runAction(article.id, "approve", false)}>
                      Одобрить
                    </button>
                    <button className="btn-danger" onClick={() => runAction(article.id, "reject", true)}>
                      Отклонить
                    </button>
                    <button className="btn-warning" onClick={() => runAction(article.id, "revise", true)}>
                      На доработку
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <h2 className="card__title">Жалобы на комментарии</h2>

        {complaints.length === 0 ? (
          <p className="muted">Жалоб нет</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Комментарий</th>
                <th>Автор комментария</th>
                <th>Причина</th>
                <th>Количество жалоб</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.comment_id}>
                  <td>{c.content}</td>
                  <td>{c.comment_author}</td>
                  <td>{c.last_reason}</td>
                  <td>{c.report_count}</td>
                  <td>
                    <span className={`badge badge--${c.status === "hidden" ? "danger" : "success"}`}>
                      {c.status === "hidden" ? "Скрыт" : "Виден"}
                    </span>
                  </td>
                  <td className="table__actions">
                    {c.status === "hidden" ? (
                      <button className="btn-success" onClick={() => restoreComment(c.comment_id)}>
                        Вернуть
                      </button>
                    ) : (
                      <button className="btn-danger" onClick={() => hideComment(c.comment_id)}>
                        Скрыть
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Moderation;
