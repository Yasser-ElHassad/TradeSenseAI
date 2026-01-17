import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TradingDashboard from "./pages/TradingDashboard";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.08),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.08),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.08),transparent_22%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.1),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(52,211,153,0.12),transparent_20%),radial-gradient(circle_at_50%_80%,rgba(96,165,250,0.1),transparent_22%)] blur-3xl"
        aria-hidden="true"
      ></div>
      <div className="relative">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TradingDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
