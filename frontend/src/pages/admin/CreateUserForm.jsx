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
      setError("Full name, email, and password are required.");
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
      alert("User created!");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          setError(data);
        } else if (data.detail) {
          setError(data.detail);
        } else if (data.non_field_errors) {
          setError(data.non_field_errors.join(" "));
        } else if (data.email) {
          setError(data.email.join(" "));
        } else {
          setError("Error creating user.");
        }
      } else {
        setError("Error creating user.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: 24,
        padding: 16,
        borderRadius: 8,
        border: "1px solid #e5e7eb",
      }}
    >
      <h3 style={{ marginBottom: 12 }}>Create User</h3>
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #d1d5db",
            marginBottom: 8,
          }}
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #d1d5db",
            marginBottom: 8,
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #d1d5db",
            marginBottom: 8,
          }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #d1d5db",
            marginBottom: 8,
          }}
        >
          <option value="ADMIN">Admin</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: 6,
          border: "none",
          backgroundColor: "#10b981",
          color: "#ffffff",
          fontWeight: 600,
          cursor: submitting ? "default" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Creating..." : "Create"}
      </button>
    </form>
  );
}

