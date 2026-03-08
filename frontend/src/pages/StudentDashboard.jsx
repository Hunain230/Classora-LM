import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import { logout } from "../api/auth";
import DashboardLayout from "../components/DashboardLayout";
import "./admin/Dashboard.css";

export default function StudentDashboard() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get("/api/student/dashboard/")
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.status === 403) {
          setError("You do not have permission to view the student dashboard.");
        } else {
          setError("Failed to load student dashboard data.");
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
          <div className="dashboard-card">Loading Student Dashboard...</div>
        </div>
      </div>
    );
  }

  const { institute } = data;

  return (
    <DashboardLayout user={user}>
      <div className="dashboard-header" style={{ marginBottom: '40px' }}>
        <div className="dashboard-welcome">
          <h1 style={{ color: '#1e293b', fontWeight: 800 }}>Welcome, {user.full_name}</h1>
          <p style={{ color: '#2196F3', fontWeight: 600 }}>STUDENT HUB</p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-title">
          <span className="material-icons-round">school</span>
          Your Institute
        </div>

        {institute ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Name</label>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#333', marginTop: '5px' }}>{institute.name}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Institute Code</label>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2196F3', marginTop: '5px' }}>{institute.institute_code}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Joined Date</label>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#333', marginTop: '5px' }}>{new Date(user.date_joined || Date.now()).toLocaleDateString()}</div>
            </div>
          </div>
        ) : (
          <p>No institute information available.</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
        <div className="dashboard-card" style={{ marginBottom: 0 }}>
          <div className="card-title">
            <span className="material-icons-round">import_contacts</span>
            My Courses
          </div>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>You haven't been enrolled in any courses yet.</p>
        </div>

        <div className="dashboard-card" style={{ marginBottom: 0 }}>
          <div className="card-title">
            <span className="material-icons-round">campaign</span>
            Announcements
          </div>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>All quiet here. Check back later for updates from your institute.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
