import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginRequest } from "../api/auth";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const formShellRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("auth-page");
    return () => {
      document.body.classList.remove("auth-page");
    };
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      if (formShellRef.current) formShellRef.current.classList.add("shake");
      setTimeout(() => formShellRef.current?.classList.remove("shake"), 400);
      return;
    }

    try {
      setSubmitting(true);
      const data = await loginRequest(email, password);

      window.localStorage.setItem("access_token", data.access);
      window.localStorage.setItem("refresh_token", data.refresh);
      window.localStorage.setItem("current_user", JSON.stringify(data.user));

      const role = data.user.role;
      if (role === "ADMIN") navigate("/admin");
      else if (role === "TEACHER") navigate("/teacher");
      else if (role === "STUDENT") navigate("/student");
      else navigate("/");
    } catch (err) {
      if (err.response) {
        const { data } = err.response;
        setError(typeof data === "string" ? data : (data.detail || "Invalid credentials"));
      } else {
        setError("Connection failed");
      }
      if (formShellRef.current) formShellRef.current.classList.add("shake");
      setTimeout(() => formShellRef.current?.classList.remove("shake"), 400);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-login">
      <div className="page">
        <div className="panel-left">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="geo-lines">
            <svg viewBox="0 0 500 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="200" x2="500" y2="600" stroke="#2572e6" strokeWidth="1" />
              <line x1="0" y1="600" x2="500" y2="100" stroke="#2572e6" strokeWidth="1" />
              <circle cx="250" cy="400" r="180" stroke="#2572e6" strokeWidth="1" fill="none" />
              <circle cx="250" cy="400" r="280" stroke="#2572e6" strokeWidth="0.5" fill="none" />
              <polygon points="250,100 450,500 50,500" stroke="#5599f5" strokeWidth="0.8" fill="none" />
              <line x1="250" y1="0" x2="250" y2="800" stroke="#2572e6" strokeWidth="0.5" />
              <line x1="0" y1="400" x2="500" y2="400" stroke="#2572e6" strokeWidth="0.5" />
            </svg>
          </div>
          <Link to="/" className="panel-logo">
            <div className="logo-mark">Cl</div>
            <span className="logo-name">Classora</span>
          </Link>
          <div className="panel-center">
            <div className="panel-tagline">School Management Platform</div>
            <h2 className="panel-headline">
              Welcome
              <br />
              back to
              <br />
              <em>Classora.</em>
            </h2>
            <p className="panel-sub">
              Your entire school in one platform — students, staff, grades, attendance, and more.
            </p>
            <div className="panel-stats">
              <div className="stat-pill">
                <div className="stat-pill-dot" />
                <span><strong>50+</strong> Schools live</span>
              </div>
              <div className="stat-pill">
                <div className="stat-pill-dot" style={{ background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
                <span><strong>99.9%</strong> Uptime</span>
              </div>
              <div className="stat-pill">
                <div className="stat-pill-dot" style={{ background: "#fbbf24", boxShadow: "0 0 8px #fbbf24" }} />
                <span><strong>4.9★</strong> Rating</span>
              </div>
            </div>
          </div>
          <div className="panel-bottom">
            <p>© 2025 Classora Technologies · Privacy Policy · Terms</p>
          </div>
        </div>

        <div className="panel-right">
          <div className="form-shell" ref={formShellRef}>
            <div className="form-header">
              <div className="form-eyebrow">Sign in</div>
              <h1 className="form-title">
                Good to see you again
                <span>Enter your credentials to continue</span>
              </h1>
            </div>

            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label className="field-label" htmlFor="email">Email address</label>
                <div className="field-wrap">
                  <svg className="field-icon" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    className="field-input"
                    id="email"
                    type="email"
                    placeholder="you@school.edu"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="password">Password</label>
                <div className="field-wrap">
                  <svg className="field-icon" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    className="field-input has-eye"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="field-eye"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="field-extras">
                <label className="checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className="checkbox-label">Keep me signed in</span>
                </label>
                <button type="button" className="forgot-link">Forgot password?</button>
              </div>

              <button type="submit" className={`btn-submit ${submitting ? "loading" : ""}`} disabled={submitting}>
                <div className="spinner" />
                <span className="btn-text" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  Sign In
                  <svg viewBox="0 0 24 24">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </button>
            </form>

            <div className="or-divider"><span>or continue with</span></div>
            <div className="sso-row">
              <button type="button" className="sso-btn">
                <svg viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button type="button" className="sso-btn">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="4" fill="#0078D4" />
                  <text x="12" y="16.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="sans-serif">M</text>
                </svg>
                Microsoft
              </button>
            </div>

            <p className="switch-link">
              Don&apos;t have an account?{" "}
              <button type="button" onClick={() => navigate("/register")}>Create one free →</button>
            </p>
            <p className="back-home">
              <button type="button" onClick={() => navigate("/")}>← Back to home</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
