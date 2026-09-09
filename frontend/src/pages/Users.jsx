import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ROLE_LABELS = {
  user: "USER",
  moderator: "MODERATOR",
  admin: "ADMIN"
};

function Users() {

  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Не удалось загрузить пользователей");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      setError("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Не удалось изменить роль");
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Пользователи</h1>

      {error && <p className="error">{error}</p>}

      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Дата регистрации</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge badge--role-${u.role}`}>{ROLE_LABELS[u.role]}</span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString("ru-RU")}</td>
                <td className="table__actions">
                  {u.id === currentUser.id ? (
                    <span className="muted">Это вы</span>
                  ) : (
                    <>
                      {u.role !== "moderator" && (
                        <button className="btn-ghost" onClick={() => changeRole(u.id, "moderator")}>
                          Назначить модератором
                        </button>
                      )}
                      {u.role !== "admin" && (
                        <button className="btn-ghost" onClick={() => changeRole(u.id, "admin")}>
                          Назначить администратором
                        </button>
                      )}
                      {u.role !== "user" && (
                        <button className="btn-ghost" onClick={() => changeRole(u.id, "user")}>
                          Вернуть роль пользователя
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Users;
