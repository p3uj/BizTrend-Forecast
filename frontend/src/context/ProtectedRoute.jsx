import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

export default function ProtectedRoute({ roles }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const currentUser = JSON.parse(sessionStorage.getItem("current_user"));

  const role = currentUser
    ? currentUser.is_superuser
      ? "admin"
      : "operator"
    : "guest";
  const authenticated = token ? true : false;

  // Redirect the user back to the previous page.
  useEffect(() => {
    if (authenticated && !roles.includes(role)) {
      navigate(-1);
    }
  }, [authenticated, roles, role, navigate]);

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  if (!roles.includes(role)) {
    return null; // Render nothing if the user is not authorized
  }

  return <Outlet />;
}
