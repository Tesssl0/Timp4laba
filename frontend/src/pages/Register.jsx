import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Register() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен содержать не менее 6 символов");
      return;
    }

    setLoading(true);

    try {

      await api.post(
        "/auth/register",
        {
          username,
          email,
          password
        }
      );

      // После успешной регистрации сразу логиним пользователя,
      // чтобы не заставлять его вводить данные повторно.
      const loginResponse = await api.post(
        "/auth/login",
        {
          email,
          password
        }
      );

      login(loginResponse.data.token, loginResponse.data.user);

      const role = loginResponse.data.user.role;
      navigate(role === "user" ? "/articles" : "/dashboard");

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Ошибка регистрации"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >

        <h1>MediaGuard</h1>

        <h2>Регистрация</h2>

        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          required
        />

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

        <input
          type="password"
          placeholder="Повторите пароль"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          required
        />

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </button>

      </form>

      <p className="auth-note">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>

    </div>
  );
}

export default Register;
