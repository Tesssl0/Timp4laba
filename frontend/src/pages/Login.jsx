import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();
    setError("");

    try {

      const response = await api.post(
        "/auth/login",
        {
          email,
          password
        }
      );

      login(response.data.token, response.data.user);

      const role = response.data.user.role;
      navigate(role === "user" ? "/articles" : "/dashboard");

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Ошибка авторизации"
      );

    }
  };

  return (
    <div className="auth-container">

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >

        <h1>MediaGuard</h1>

        <h2>Вход</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <button type="submit">
          Войти
        </button>

      </form>

      <p className="auth-note">
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>

    </div>
  );
}

export default Login;
