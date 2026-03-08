import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import { logout } from "../api/auth";
import DashboardLayout from "../components/DashboardLayout";
import "./admin/Dashboard.css";

export default function TeacherDashboard() {
  // We need the user object, which is usually in localStorage after login
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get("/api/teacher/dashboard/")
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.status === 403) {
          setError("You do not have permission to view the teacher dashboard.");
        } else {
          setError("Failed to load teacher dashboard data.");
        }
      });
  }, []);

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-inner">
          <p className="pill-error-msg">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-inner">
          <div className="dashboard-card">Loading Teacher Dashboard...</div>
        </div>
      </div>
    );
  }

  const { students } = data;

  return (
    <DashboardLayout user={user}>
      <div className="dashboard-header" style={{ marginBottom: '40px' }}>
        <div className="dashboard-welcome">
          <h1 style={{ color: '#1e293b', fontWeight: 800 }}>Welcome, {user.full_name}</h1>
          <p style={{ color: '#2196F3', fontWeight: 600 }}>TEACHER CONSOLE</p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-title">
          <span className="material-icons-round">groups</span>
          Students in your institute
        </div>

        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>No students found yet.</td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.full_name}</td>
                    <td>{s.email}</td>
                    <td><span style={{ color: '#4CAF50', fontWeight: 600, background: 'rgba(76, 175, 80, 0.1)', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem' }}>STUDENT</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-form-grid" style={{ marginTop: '20px' }}>
        <div className="dashboard-card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Total Students</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2196F3' }}>{students.length}</div>
        </div>
        <div className="dashboard-card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Active Classes</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2196F3' }}>--</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
