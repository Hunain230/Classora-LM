import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMe, logout } from "../../api/auth";
import InstituteInfo from "./InstituteInfo";
import UserList from "./UserList";
import CreateUserForm from "./CreateUserForm";

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
      <div style={{ padding: 24 }}>
        <p style={{ color: "#b91c1c" }}>{error}</p>
      </div>
    );
  }

  if (!user) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 4 }}>Welcome, {user.full_name}</h1>
          <p style={{ margin: 0, color: "#6b7280" }}>
            Role: {user.role} | Institute ID: {user.institute_id}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: 999,
            border: "1px solid #d1d5db",
            backgroundColor: "#ffffff",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Logout
        </button>
      </div>
      <InstituteInfo instituteId={user.institute_id} />
      <CreateUserForm instituteId={user.institute_id} />
      <UserList instituteId={user.institute_id} />
    </div>
  );
}

