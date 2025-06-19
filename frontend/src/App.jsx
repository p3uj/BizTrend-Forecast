import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LogIn";
import HomePage from "./pages/Home";
import RegisterPage from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoutes";
import UserManagement from "./pages/user-management/UserManagement";
import AccountDetails from "./pages/AccountDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/account" element={<AccountDetails />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/user-management" element={<UserManagement />} />
          {/* <Route path="/home" element={<HomePage />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
