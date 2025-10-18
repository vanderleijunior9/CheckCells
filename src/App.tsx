import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import AllTestsPage from "./components/table/AllTestsPage";
import Navbar from "./components/Navbar";
import { Newtestpage } from "./components/Newtestpage";
import StartedTestPage from "./components/StartedTestPage";
import Dashboard from "./components/Dashboard";
import CameraView from "./components/CameraView";
import TestDetails from "./components/TestDetails";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginRoute />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

// Redirect to dashboard if already authenticated
function LoginRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Login />;
}

// Main application layout with sidebar and navbar
function MainLayout() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 bg-washed-white">
        <Sidebar />
        <main className="flex-1 p-6 bg-white rounded-tl-3xl overflow-y-auto mt-8">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/all-tests" element={<AllTestsPage />} />
            <Route path="/new-test" element={<Newtestpage />} />
            <Route path="/started-test" element={<StartedTestPage />} />
            <Route path="/camera-view" element={<CameraView />} />
            <Route path="/test-details" element={<TestDetails />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
