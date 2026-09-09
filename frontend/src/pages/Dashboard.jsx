import { useEffect, useState } from "react";
import { FileCheck2, Clock3, Flag, Timer } from "lucide-react";
import api from "../services/api";

function formatSeconds(seconds) {
  if (seconds == null) return "—";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours === 0) return `${minutes} мин`;
  return `${hours} ч ${minutes} мин`;
}

function Dashboard() {

  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get("/dashboard/stats");
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Не удалось загрузить статистику");
      }
    })();
  }, []);

  const maxCount = stats?.byCategory?.length
    ? Math.max(...stats.byCategory.map((c) => c.count))
    : 0;

  return (
    <div className="page">
      <h1 className="page-title">Дашборд</h1>

      {error && <p className="error">{error}</p>}

      {stats && (
        <>
          <div className="metric-grid">
            <div className="metric-card">
              <FileCheck2 className="metric-card__icon" />
              <div>
                <div className="metric-card__value">{stats.published}</div>
                <div className="metric-card__label">Опубликованные материалы</div>
              </div>
            </div>

            <div className="metric-card">
              <Clock3 className="metric-card__icon" />
              <div>
                <div className="metric-card__value">{stats.pending}</div>
                <div className="metric-card__label">Статьи на модерации</div>
              </div>
            </div>

            <div className="metric-card">
              <Flag className="metric-card__icon" />
              <div>
                <div className="metric-card__value">{stats.complaints}</div>
                <div className="metric-card__label">Жалобы пользователей</div>
              </div>
            </div>

            <div className="metric-card">
              <Timer className="metric-card__icon" />
              <div>
                <div className="metric-card__value">
                  {formatSeconds(stats.avgReactionSeconds)}
                </div>
                <div className="metric-card__label">Среднее время реакции модератора</div>
              </div>
            </div>
          </div>

          <section className="card">
            <h2 className="card__title">Публикации по рубрикам</h2>

            {stats.byCategory.length === 0 ? (
              <p className="muted">Пока нет опубликованных материалов</p>
            ) : (
              <div className="bar-chart">
                {stats.byCategory.map((row) => (
                  <div className="bar-chart__row" key={row.category}>
                    <div className="bar-chart__label">{row.category}</div>
                    <div className="bar-chart__track">
                      <div
                        className="bar-chart__fill"
                        style={{ width: `${(row.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <div className="bar-chart__value">{row.count}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
