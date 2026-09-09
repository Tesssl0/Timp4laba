import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  ShieldCheck,
  Users,
  LogOut,
  ShieldHalf
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLE_LABELS = {
  user: "Пользователь",
  moderator: "Модератор",
  admin: "Администратор"
};

function Layout({ children }) {

  const { user, logout, isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">

      <header className="app-header">
        <div className="app-header__brand">
          <ShieldHalf size={22} strokeWidth={2.2} />
          <span>MediaGuard</span>
        </div>

        <div className="app-header__user">
          {user && (
            <>
              <span className="app-header__username">{user.username}</span>
              <span className="app-header__role">{ROLE_LABELS[user.role]}</span>
              <button className="btn-ghost" onClick={handleLogout}>
                <LogOut size={16} />
                Выйти
              </button>
            </>
          )}
        </div>
      </header>

      <div className="app-body">

        <nav className="app-sidebar">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <LayoutDashboard size={18} />
            Дашборд
          </NavLink>

          <NavLink
            to="/articles"
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <Newspaper size={18} />
            Статьи
          </NavLink>

          {isStaff && (
            <NavLink
              to="/moderation"
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <ShieldCheck size={18} />
              Модерация
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/users"
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <Users size={18} />
              Пользователи
            </NavLink>
          )}
        </nav>

        <main className="app-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default Layout;
