import { useState } from "react";
import { apiClient } from "../../api/client";

export default function CreateUserForm({ instituteId }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("TEACHER");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post("/api/users/create/", {
        full_name: fullName,
        email,
        role,
        password,
        institute_id: instituteId,
      });
      setFullName("");
      setEmail("");
      setPassword("");
      setError("");
      // Better to use a non-blocking notification, but keeping current flow for now
      alert("User created successfully!");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        // Flatten error object for display
        const message = typeof data === "string"
          ? data
          : Object.entries(data).map(([field, msgs]) => `${field}: ${msgs.join(" ")}`).join("; ");
        setError(message || "Error creating user. Check your details.");
      } else {
        setError("Network error. Is the server running?");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-title">
        <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        Add New Member
      </div>

      {error && <p className="pill-error-msg" style={{ borderRadius: '12px', textAlign: 'left' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="dashboard-form-grid">
          <div className="dashboard-pill-input">
            <input
              placeholder="FULL NAME"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="dashboard-pill-input">
            <input
              placeholder="EMAIL ADDRESS"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="dashboard-pill-input">
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="dashboard-pill-input">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="TEACHER">TEACHER</option>
              <option value="STUDENT">STUDENT</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="dashboard-submit-btn"
          disabled={submitting}
        >
          {submitting ? "ADDING..." : "REGISTER USER"}
        </button>
      </form>
    </div>
  );
}
