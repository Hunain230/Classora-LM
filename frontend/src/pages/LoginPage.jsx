import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginRequest } from "../api/auth";
import { Logo } from "../components/Logo";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
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
        setError(typeof data === "string" ? data : (data.detail || "Invalid credentials"));
      } else {
        setError("Connection failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-content">
        <div className="login-logo-wrapper">
          <Link to="/">
            <Logo className="login-logo-svg" />
          </Link>
        </div>

        <div className="login-slogan">
          Empowering Education Together
        </div>

        <div className="login-form-card">
          {error && <div className="pill-error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="pill-input-wrapper">
              <div className="pill-input-icon">
                {/* Envelope icon for Email */}
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <div className="pill-input-divider"></div>
              <input
                className="pill-input-field"
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="pill-input-wrapper">
              <div className="pill-input-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
              </div>
              <div className="pill-input-divider"></div>
              <input
                className="pill-input-field"
                type="password"
                placeholder="************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="login-options">
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className="forgot-password-link">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="pill-submit-btn"
              disabled={submitting}
            >
              {submitting ? "..." : "LOGIN"}
            </button>
          </form>
        </div>

        <p className="pill-register-footer">
          Don't have an account?
          <button type="button" onClick={() => navigate("/register")}>
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}
