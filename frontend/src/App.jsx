import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LogIn";
import HomePage from "./pages/Home";
import UserManagement from "./pages/user-management/UserManagement";
import AccountDetails from "./pages/AccountDetails";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";
import ProtectedRoute from "./context/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/password/reset/confirm/:uid/:token"
          element={<ResetPasswordConfirm />}
        />

        {/* Protected routes for admin only*/}
        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/user-management" element={<UserManagement />} />
        </Route>

        {/* Protected routes for admin and operator only */}
        <Route element={<ProtectedRoute roles={["admin", "operator"]} />}>
          <Route path="/account" element={<AccountDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
