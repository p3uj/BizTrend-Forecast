import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LogIn";
import HomePage from "./pages/Home";
import RegisterPage from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoutes";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />

        <Route element={<ProtectedRoute />}>
          {/* <Route path="/home" element={<HomePage />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
