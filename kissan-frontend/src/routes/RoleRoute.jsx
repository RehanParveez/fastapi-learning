import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allowedRoles, children }) {
  const { user, isLoggedIn, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}