import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import InstituteRegisterPage from "./pages/InstituteRegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CoursesPage from "./pages/CoursesPage";
import TeacherAssignmentsPage from "./pages/TeacherAssignmentsPage";
import StudentAssignmentsPage from "./pages/StudentAssignmentsPage";
import TeacherQuizzesPage from "./pages/TeacherQuizzesPage";
import StudentQuizzesPage from "./pages/StudentQuizzesPage";
import TeacherAttendancePage from "./pages/TeacherAttendancePage";
import TeacherLecturePage from "./pages/TeacherLecturePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import DepartmentsPage from "./pages/admin/DepartmentsPage";
import EnrollStudentPage from "./pages/admin/EnrollStudentPage";

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

function AssignmentsRoute() {
  const stored = window.localStorage.getItem("current_user");
  if (!stored) return <Navigate to="/login" replace />;
  let user;
  try { user = JSON.parse(stored); } catch { return <Navigate to="/login" replace />; }
  if (user.role === "STUDENT") return <StudentAssignmentsPage />;
  return <TeacherAssignmentsPage />;
}

function QuizzesRoute() {
  const stored = window.localStorage.getItem("current_user");
  if (!stored) return <Navigate to="/login" replace />;
  let user;
  try { user = JSON.parse(stored); } catch { return <Navigate to="/login" replace />; }
  if (user.role === "STUDENT") return <StudentQuizzesPage />;
  return <TeacherQuizzesPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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

        {/* LMS Feature Routes */}
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/departments" element={
          <RequireRole role="ADMIN">
            <DepartmentsPage />
          </RequireRole>
        } />
        <Route path="/enrollment" element={
          <RequireRole role="ADMIN">
            <EnrollStudentPage />
          </RequireRole>
        } />

        <Route path="/assignments" element={<AssignmentsRoute />} />
        <Route path="/quizzes" element={<QuizzesRoute />} />
        <Route path="/attendance" element={<TeacherAttendancePage />} />
        <Route path="/lectures" element={<TeacherLecturePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
