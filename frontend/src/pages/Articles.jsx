import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_LABELS = {
  draft: "Черновик",
  pending: "На модерации",
  published: "Опубликована",
  rejected: "Отклонена",
  archived: "Архив"
};

const STATUS_BADGE = {
  draft: "muted",
  pending: "warning",
  published: "success",
  rejected: "danger",
  archived: "muted"
};

function Articles() {

  const navigate = useNavigate();
  const { isStaff } = useAuth();

  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "" });

  const load = async () => {
    try {
      const response = await api.get("/articles", {
        params: statusFilter ? { status: statusFilter } : {}
      });
      setArticles(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Не удалось загрузить статьи");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const createArticle = async (e) => {
    e.preventDefault();

    try {
      await api.post("/articles", form);
      setForm({ title: "", content: "", category: "" });
      setShowCreate(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка создания статьи");
    }
  };

  const deleteArticle = async (id) => {
    if (!confirm("Удалить статью?")) return;

    try {
      await api.delete(`/articles/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка удаления");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Статьи</h1>
        <button className="btn-primary" onClick={() => setShowCreate((v) => !v)}>
          Создать статью
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showCreate && (
        <section className="card">
          <h2 className="card__title">Новая статья</h2>
          <form onSubmit={createArticle} className="stacked-form">
            <input
              placeholder="Заголовок"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              placeholder="Рубрика"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <textarea
              placeholder="Текст статьи"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              rows={6}
            />
            <button type="submit" className="btn-primary">Отправить на модерацию</button>
          </form>
        </section>
      )}

      {isStaff && (
        <div className="filter-row">
          {["", "draft", "pending", "published", "rejected", "archived"].map((s) => (
            <button
              key={s || "all"}
              className={`chip${statusFilter === s ? " chip--active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s ? STATUS_LABELS[s] : "Все"}
            </button>
          ))}
        </div>
      )}

      <section className="card">
        {articles.length === 0 ? (
          <p className="muted">Статей пока нет</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Заголовок</th>
                <th>Рубрика</th>
                <th>Автор</th>
                <th>Статус</th>
                <th>Обновлено</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td className="link-cell" onClick={() => navigate(`/articles/${article.id}`)}>
                    {article.title}
                  </td>
                  <td>{article.category || "—"}</td>
                  <td>{article.author}</td>
                  <td>
                    <span className={`badge badge--${STATUS_BADGE[article.status]}`}>
                      {STATUS_LABELS[article.status]}
                    </span>
                  </td>
                  <td>{new Date(article.updated_at).toLocaleString("ru-RU")}</td>
                  <td className="table__actions">
                    <button className="btn-ghost" onClick={() => navigate(`/articles/${article.id}`)}>
                      Просмотр
                    </button>
                    <button className="btn-danger" onClick={() => deleteArticle(article.id)}>
                      Удалить
                    </button>
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

export default Articles;
