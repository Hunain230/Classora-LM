import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import InstituteRegisterPage from "./pages/InstituteRegisterPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function RequireRole({ role, children }) {
  const stored = window.localStorage.getItem("current_user");
  if (!stored) {
    return <Navigate to="/login" replace />;
  }
  let user;
  try {
    user = JSON.parse(stored);
  } catch {
    window.localStorage.removeItem("current_user");
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (user.role === "TEACHER") return <Navigate to="/teacher" replace />;
    if (user.role === "STUDENT") return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<InstituteRegisterPage />} />
        <Route
          path="/admin"
          element={
            <RequireRole role="ADMIN">
              <AdminDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/teacher"
          element={
            <RequireRole role="TEACHER">
              <TeacherDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/student"
          element={
            <RequireRole role="STUDENT">
              <StudentDashboard />
            </RequireRole>
          }
        />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
