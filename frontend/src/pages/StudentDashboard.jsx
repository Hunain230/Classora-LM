import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import { logout } from "../api/auth";

export default function StudentDashboard() {
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
      <div style={{ padding: 24 }}>
        <p style={{ color: "#b91c1c" }}>{error}</p>
      </div>
    );
  }

  if (!data) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  const { user, institute } = data;

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

      <h2 style={{ marginTop: 16, marginBottom: 8 }}>Your Institute</h2>
      {institute ? (
        <div>
          <p style={{ margin: 0 }}>Name: {institute.name}</p>
          <p style={{ margin: 0 }}>Code: {institute.institute_code}</p>
        </div>
      ) : (
        <p>No institute information available.</p>
      )}
    </div>
  );
}

