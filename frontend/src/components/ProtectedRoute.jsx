import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// roles: необязательный список допустимых ролей. Если не задан —
// достаточно быть авторизованным.
function ProtectedRoute({ children, roles }) {

  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/articles" replace />;
  }

  return children;

}

export default ProtectedRoute;
