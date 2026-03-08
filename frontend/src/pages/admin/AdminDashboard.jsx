import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMe, logout } from "../../api/auth";
import InstituteInfo from "./InstituteInfo";
import UserList from "./UserList";
import CreateUserForm from "./CreateUserForm";
import DashboardLayout from "../../components/DashboardLayout";
import "./Dashboard.css";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch((err) => {
        console.error(err);
        setError("Failed to load admin data. Please log in again.");
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

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-inner">
          <div className="dashboard-card">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="dashboard-header" style={{ marginBottom: '40px' }}>
        <div className="dashboard-welcome">
          <h1 style={{ color: '#1e293b', fontWeight: 800 }}>Welcome, {user.full_name}</h1>
          <p style={{ color: '#2196F3', fontWeight: 600 }}>INSTITUTE OVERVIEW</p>
        </div>
      </div>

      <InstituteInfo instituteId={user.institute_id} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px', marginTop: '30px' }}>
        <CreateUserForm instituteId={user.institute_id} />
        <UserList instituteId={user.institute_id} />
      </div>
    </DashboardLayout>
  );
}
