import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerInstitute } from "../api/auth";

export default function InstituteRegisterPage() {
  const navigate = useNavigate();

  const [instituteName, setInstituteName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!instituteName || !adminName || !adminEmail || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      setSubmitting(true);
      await registerInstitute({
        institute_name: instituteName,
        admin_name: adminName,
        admin_email: adminEmail,
        password,
      });
      setSuccess(
        "Institute registered successfully. You can now log in with the admin credentials."
      );
      setInstituteName("");
      setAdminName("");
      setAdminEmail("");
      setPassword("");
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
        } else if (data.admin_email) {
          setError(data.admin_email.join(" "));
        } else {
          setError("Error registering institute.");
        }
      } else {
        setError("Error registering institute.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#eef2ff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#ffffff",
          padding: "2rem",
          borderRadius: "0.75rem",
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>
          Register Institute
        </h2>
        <p style={{ marginBottom: "1.5rem", color: "#6b7280", fontSize: 14 }}>
          Create a new institute and its first admin account.
        </p>

        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              background: "#fef2f2",
              color: "#b91c1c",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              background: "#ecfdf3",
              color: "#166534",
              fontSize: 14,
            }}
          >
            {success}
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                marginLeft: 8,
                padding: "0.25rem 0.5rem",
                fontSize: 12,
                borderRadius: 999,
                border: "none",
                backgroundColor: "#16a34a",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              Go to login
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "0.75rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Institute Name
            </label>
            <input
              type="text"
              value={instituteName}
              onChange={(e) => setInstituteName(e.target.value)}
              placeholder="Classora Academy"
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ marginBottom: "0.75rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Admin Full Name
            </label>
            <input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Admin User"
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ marginBottom: "0.75rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Admin Email
            </label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@example.com"
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                fontSize: 14,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: "#4f46e5",
              color: "#ffffff",
              fontWeight: 600,
              cursor: submitting ? "default" : "pointer",
              opacity: submitting ? 0.7 : 1,
              fontSize: 14,
            }}
          >
            {submitting ? "Registering..." : "Register Institute"}
          </button>
        </form>

        <p
          style={{
            marginTop: "1rem",
            fontSize: 14,
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              border: "none",
              background: "transparent",
              color: "#2563eb",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
              fontSize: 14,
            }}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

