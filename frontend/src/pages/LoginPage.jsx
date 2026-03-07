import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      const data = await loginRequest(email, password);

      window.localStorage.setItem("access_token", data.access);
      window.localStorage.setItem("refresh_token", data.refresh);
      window.localStorage.setItem("current_user", JSON.stringify(data.user));

      const role = data.user.role;
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "TEACHER") {
        navigate("/teacher");
      } else if (role === "STUDENT") {
        navigate("/student");
      } else {
        navigate("/");
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        if (status === 400) {
          if (typeof data === "string") {
            setError(data);
          } else if (data.detail) {
            setError(data.detail);
          } else {
            setError("Please check the form fields.");
          }
        } else if (status === 401) {
          setError(data.detail || "Invalid email or password.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Cannot connect to server. Please try again.");
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
        background: "#f3f4f6",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#ffffff",
          padding: "2rem",
          borderRadius: "0.75rem",
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>
          Classora Login
        </h2>
        <p style={{ marginBottom: "1.5rem", color: "#6b7280", fontSize: 14 }}>
          Sign in with your email and password.
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #d1d5db",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Password
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
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontWeight: 600,
              cursor: submitting ? "default" : "pointer",
              opacity: submitting ? 0.7 : 1,
              fontSize: 14,
            }}
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      <p
        style={{
          marginTop: "1rem",
          fontSize: 14,
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        Need an account for your institute?{" "}
        <button
          type="button"
          onClick={() => navigate("/register")}
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
          Register institute
        </button>
      </p>
    </div>
  );
}

