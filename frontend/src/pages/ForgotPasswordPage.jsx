import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  forgotPasswordRequest,
  resetPasswordRequest,
  verifyResetCodeRequest,
} from "../api/auth";
import { Logo } from "../components/Logo";
import "./ForgotPasswordPage.css";

const STEP_EMAIL = 1;
const STEP_CODE = 2;
const STEP_PASSWORD = 3;
const STEP_SUCCESS = 4;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(STEP_EMAIL);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (step !== STEP_SUCCESS) return;

    const timer = window.setTimeout(() => {
      navigate("/login");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [step, navigate]);

  const stepTitle = useMemo(() => {
    if (step === STEP_EMAIL) return "Enter your email";
    if (step === STEP_CODE) return "Verify reset code";
    if (step === STEP_PASSWORD) return "Set a new password";
    return "Password updated";
  }, [step]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await forgotPasswordRequest(email.trim());
      setInfo(response?.message || "Reset code sent to your email.");
      setStep(STEP_CODE);
    } catch (err) {
      const message = err?.response?.data;
      if (typeof message === "string") {
        setError(message);
      } else if (message?.email?.[0]) {
        setError(message.email[0]);
      } else if (message?.detail) {
        setError(message.detail);
      } else {
        setError("Unable to send reset code. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const cleanCode = code.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    try {
      setSubmitting(true);
      await verifyResetCodeRequest(email.trim(), cleanCode);
      setCode(cleanCode);
      setInfo("Code verified. You can set your new password now.");
      setStep(STEP_PASSWORD);
    } catch (err) {
      const message = err?.response?.data;
      if (typeof message === "string") {
        setError(message);
      } else if (message?.non_field_errors?.[0]) {
        setError(message.non_field_errors[0]);
      } else if (message?.detail) {
        setError(message.detail);
      } else {
        setError("Code verification failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!newPassword) {
      setError("New password is required.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      await resetPasswordRequest(email.trim(), code, newPassword);
      setInfo("Password reset successful. Redirecting to login...");
      setStep(STEP_SUCCESS);
    } catch (err) {
      const message = err?.response?.data;
      if (typeof message === "string") {
        setError(message);
      } else if (message?.new_password?.[0]) {
        setError(message.new_password[0]);
      } else if (message?.non_field_errors?.[0]) {
        setError(message.non_field_errors[0]);
      } else if (message?.detail) {
        setError(message.detail);
      } else {
        setError("Could not reset password. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="forgot-page-container">
      <div className="forgot-floating-shape shape-one" aria-hidden="true" />
      <div className="forgot-floating-shape shape-two" aria-hidden="true" />

      <div className="forgot-content">
        <div className="forgot-logo-wrapper">
          <Link to="/">
            <Logo className="forgot-logo-svg" />
          </Link>
        </div>

        <p className="forgot-slogan">Secure account recovery in under a minute</p>

        <div className="forgot-form-card">
          <div className="forgot-steps" aria-label="Password reset progress">
            <span className={`step-dot ${step >= STEP_EMAIL ? "active" : ""}`}>1</span>
            <span className={`step-dot ${step >= STEP_CODE ? "active" : ""}`}>2</span>
            <span className={`step-dot ${step >= STEP_PASSWORD ? "active" : ""}`}>3</span>
          </div>

          <h1 className="forgot-step-title">{stepTitle}</h1>

          {error && <div className="pill-error-msg">{error}</div>}
          {info && <div className="pill-info-msg">{info}</div>}

          {step === STEP_EMAIL && (
            <form onSubmit={handleSendCode}>
              <div className="pill-input-wrapper">
                <div className="pill-input-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <div className="pill-input-divider" />
                <input
                  className="pill-input-field"
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <button type="submit" className="pill-submit-btn" disabled={submitting}>
                {submitting ? "Sending..." : "Send Code"}
              </button>
            </form>
          )}

          {step === STEP_CODE && (
            <form onSubmit={handleVerifyCode}>
              <div className="pill-input-wrapper">
                <div className="pill-input-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2v-9a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm3 8H9V6a3 3 0 016 0v3z" />
                  </svg>
                </div>
                <div className="pill-input-divider" />
                <input
                  className="pill-input-field"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-DIGIT CODE"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              <button type="submit" className="pill-submit-btn" disabled={submitting}>
                {submitting ? "Verifying..." : "Verify Code"}
              </button>
            </form>
          )}

          {step === STEP_PASSWORD && (
            <form onSubmit={handleResetPassword}>
              <div className="pill-input-wrapper">
                <div className="pill-input-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                </div>
                <div className="pill-input-divider" />
                <input
                  className="pill-input-field"
                  type="password"
                  placeholder="NEW PASSWORD"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="pill-input-wrapper">
                <div className="pill-input-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
                <div className="pill-input-divider" />
                <input
                  className="pill-input-field"
                  type="password"
                  placeholder="CONFIRM PASSWORD"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button type="submit" className="pill-submit-btn" disabled={submitting}>
                {submitting ? "Updating..." : "Reset Password"}
              </button>
            </form>
          )}

          {step === STEP_SUCCESS && (
            <div className="forgot-success-state" role="status" aria-live="polite">
              <div className="success-ring">✓</div>
              <p>Your password has been reset.</p>
              <p>Redirecting to login...</p>
            </div>
          )}

          <div className="forgot-footer-link-row">
            <Link to="/login" className="forgot-back-link">Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
