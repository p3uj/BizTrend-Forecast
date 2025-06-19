import { Outlet, Navigate } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/" />;
  }

  if (sessionStorage.getItem("current_user")) {
    const currentUser = JSON.parse(sessionStorage.getItem("current_user"));
    if (!currentUser.is_superuser) {
      return <Navigate to="/" />;
    }
  }

  return token ? <Outlet /> : <Navigate to="/" />;
}
