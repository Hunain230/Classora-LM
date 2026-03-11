import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerInstitute } from "../api/auth";
import "./InstituteRegisterPage.css";

/* ─── helpers ─────────────────────────────── */
const COLOR_PRESETS = [
  "#2572e6","#7c3aed","#0891b2","#059669",
  "#dc2626","#d97706","#db2777","#16a34a",
];

function calcStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8)           s++;
  if (pw.length >= 12)          s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw))  s++;
  return s;
}
const STRENGTH_LABEL = ["","Weak","Fair","Good","Strong","Excellent"];
const STRENGTH_COLOR = ["","#ef4444","#f97316","#eab308","#22c55e","#00d4ff"];

/* ─── floating-label field wrapper ─────────── */
function Field({ id, label, required, icon, hint, suffix, children }) {
  return (
    <div className="irp-field">
      <div className="irp-fw">
        {icon && (
          <svg className="irp-ficon" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {icon}
          </svg>
        )}
        {children}
        <label className="irp-flabel" htmlFor={id}>
          {label}{required && <span className="irp-req"> *</span>}
        </label>
        {suffix}
      </div>
      {hint && <p className="irp-fhint">{hint}</p>}
    </div>
  );
}

/* ─── step definitions ──────────────────────── */
const STEPS = [
  { id: 1, label: "Institute" },
  { id: 2, label: "Contact"   },
  { id: 3, label: "Admin"     },
];

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function InstituteRegisterPage() {
  const navigate = useNavigate();

  /* wizard state */
  const [step,    setStep]    = useState(1);
  const [visited, setVisited] = useState([1]);

  /* form data */
  const [formData, setFormData] = useState({
    institute_name: "",
    institute_code: "",
    description:    "",
    primary_color:  "#2572e6",
    website:        "",
    contact_email:  "",
    phone:          "",
    address:        "",
    academic_year:  "2024-2025",
    semester:       "Fall",
    admin_name:     "",
    admin_email:    "",
    password:       "",
  });

  const [autoGenAdmin, setAutoGenAdmin] = useState(true);
  const [showPw,       setShowPw]       = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");
  const [slugManual,   setSlugManual]   = useState(false);

  const rightRef = useRef(null);

  /* inject fonts */
  useEffect(() => {
    if (!document.getElementById("irp-fonts")) {
      const l = document.createElement("link");
      l.id = "irp-fonts"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap";
      document.head.appendChild(l);
    }
    document.body.classList.add("irp-body");
    return () => document.body.classList.remove("irp-body");
  }, []);

  /* sync admin from contact */
  useEffect(() => {
    if (autoGenAdmin) {
      setFormData(p => ({
        ...p,
        admin_email: p.contact_email,
        admin_name:  p.admin_name || "Admin User",
      }));
    }
  }, [autoGenAdmin, formData.contact_email]);

  /* field change */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const n = { ...prev, [name]: value };
      if (name === "institute_name" && !slugManual) {
        n.institute_code = value.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 50);
      }
      return n;
    });
  };

  /* step nav */
  const goTo = (next) => {
    setStep(next);
    setVisited(v => v.includes(next) ? v : [...v, next]);
    rightRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const data = { ...formData };
    if (data.website && !data.website.startsWith("http")) data.website = `https://${data.website}`;
    try {
      setSubmitting(true);
      await registerInstitute(data);
      setSuccess("Institute registered! Redirecting to login…");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      if (err.response) {
        const d = err.response.data;
        setError(`Error ${err.response.status}: ${typeof d === "string" ? d : d.detail || JSON.stringify(d)}`);
      } else if (err.request) {
        setError("Connection failed — is the backend running at localhost:8000?");
      } else {
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* derived */
  const strength   = calcStrength(formData.password);
  const tenantSlug = formData.institute_code
    ? `${formData.institute_code}.classora.com`
    : "your-school.classora.com";
  const step1Ok = !!(formData.institute_name && formData.institute_code);
  const step2Ok = !!formData.contact_email;
  const step3Ok = !!(formData.admin_email && formData.password);

  /* ── render ─────────────────────────────────── */
  return (
    <div className="irp-root">

      {/* ══════════ LEFT PANEL ══════════ */}
      <aside className="irp-left">
        <div className="irp-orb irp-orb-a" />
        <div className="irp-orb irp-orb-b" />
        <div className="irp-orb irp-orb-c" />
        <div className="irp-grid-bg" aria-hidden="true" />

        <div className="irp-geo" aria-hidden="true">
          <svg viewBox="0 0 500 800" preserveAspectRatio="xMidYMid slice">
            <circle cx="250" cy="400" r="200" stroke="#2572e6" strokeWidth="1"   fill="none" opacity=".35"/>
            <circle cx="250" cy="400" r="320" stroke="#2572e6" strokeWidth=".5"  fill="none" opacity=".2"/>
            <circle cx="250" cy="400" r="430" stroke="#5599f5" strokeWidth=".3"  fill="none" opacity=".12"/>
            <polygon points="250,50 480,550 20,550" stroke="#5599f5" strokeWidth=".8" fill="none" opacity=".2"/>
            <line x1="0"   y1="0"   x2="500" y2="800" stroke="#2572e6" strokeWidth=".6" opacity=".15"/>
            <line x1="500" y1="0"   x2="0"   y2="800" stroke="#2572e6" strokeWidth=".6" opacity=".15"/>
            <line x1="250" y1="0"   x2="250" y2="800" stroke="#2572e6" strokeWidth=".3" opacity=".1"/>
            <line x1="0"   y1="400" x2="500" y2="400" stroke="#2572e6" strokeWidth=".3" opacity=".1"/>
            <rect x="150"  y="280" width="200" height="240" stroke="#93bffa" strokeWidth=".6" fill="none" opacity=".15"/>
            <circle cx="250" cy="400" r="6" fill="#2572e6" opacity=".7"/>
            <circle cx="250" cy="400" r="3" fill="#00d4ff"/>
          </svg>
        </div>

        <Link to="/" className="irp-logo">
          <div className="irp-logo-mark"><span>Cl</span></div>
          <div className="irp-logo-text">
            <span className="irp-logo-name">Classora</span>
            <span className="irp-logo-tagline">School OS</span>
          </div>
        </Link>

        <div className="irp-left-body">
          <p className="irp-left-eyebrow">New institution</p>
          <h2 className="irp-left-hed">
            Set up your<br/>school in<br/><em>minutes.</em>
          </h2>
          <p className="irp-left-sub">
            No technical expertise needed. Import your data, invite your staff,
            and start managing everything from day one.
          </p>

          <ul className="irp-feats">
            {[
              { title: "14-day free trial",    desc: "No credit card required",
                icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
              { title: "Live in 5 minutes",    desc: "CSV import or manual entry",
                icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/> },
              { title: "Dedicated onboarding", desc: "Our team helps you launch",
                icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></> },
              { title: "Instant analytics",    desc: "Insights from day one",
                icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></> },
            ].map((f, i) => (
              <li className="irp-feat" key={f.title} style={{ animationDelay: `${0.4 + i * 0.09}s` }}>
                <div className="irp-feat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {f.icon}
                  </svg>
                </div>
                <div>
                  <p className="irp-feat-title">{f.title}</p>
                  <p className="irp-feat-desc">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* live tenant card */}
          <div className="irp-tenant">
            <p className="irp-tenant-label">Your school URL</p>
            <p className="irp-tenant-url">
              <span className="irp-tenant-scheme">https://</span>
              <span className={`irp-tenant-slug${formData.institute_code ? " has-slug" : ""}`}>
                {tenantSlug}
              </span>
            </p>
          </div>
        </div>

        <p className="irp-left-foot">© 2025 Classora Technologies · Privacy · Terms</p>
      </aside>

      {/* ══════════ RIGHT PANEL ══════════ */}
      <main className="irp-right" ref={rightRef}>
        <div className="irp-shell">

          {/* ── step rail ── */}
          <div className="irp-stepper" role="navigation" aria-label="Registration steps">
            {STEPS.map((s, i) => {
              const done      = visited.includes(s.id) && step > s.id;
              const active    = step === s.id;
              const reachable = visited.includes(s.id);
              return (
                <div key={s.id} className="irp-step-item">
                  <button
                    type="button"
                    className={[
                      "irp-step-btn",
                      active    ? "is-active"  : "",
                      done      ? "is-done"    : "",
                      reachable ? "is-reach"   : "",
                    ].join(" ").trim()}
                    onClick={() => reachable && goTo(s.id)}
                    disabled={!reachable}
                    aria-current={active ? "step" : undefined}
                  >
                    <span className="irp-step-circle">
                      {done
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        : s.id
                      }
                    </span>
                    <span className="irp-step-lbl">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`irp-connector${done ? " done" : ""}`}>
                      <div className="irp-connector-fill"/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── alerts ── */}
          {error   && (
            <div className="irp-alert irp-alert-err" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="irp-alert irp-alert-ok" role="status">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {success}
            </div>
          )}

          {/* ── step heading ── */}
          <header className="irp-step-hd" key={`hd-${step}`}>
            <p className="irp-eyebrow">Step {step} of 3</p>
            <h1 className="irp-title">
              {step === 1 && <><em>Institute</em> Details</>}
              {step === 2 && <><em>Contact</em> &amp; Schedule</>}
              {step === 3 && <><em>Admin</em> Account</>}
            </h1>
            <p className="irp-subtitle">
              {step === 1 && "Name your school, set a URL slug, and choose your brand colour."}
              {step === 2 && "Add contact info and configure your academic calendar."}
              {step === 3 && "Create the first admin account — you can add more staff later."}
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate>

            {/* ════ STEP 1 — Institute ════ */}
            {step === 1 && (
              <div className="irp-fields">
                <Field id="institute_name" label="Institute name" required
                  icon={<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}>
                  <input id="institute_name" name="institute_name" type="text"
                    placeholder=" " value={formData.institute_name}
                    onChange={handleChange} required className="irp-input"/>
                </Field>

                <Field id="institute_code" label="URL slug (auto-generated)" required
                  hint={formData.institute_code ? `🔗 ${formData.institute_code}.classora.com` : ""}
                  icon={<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>}>
                  <input id="institute_code" name="institute_code" type="text"
                    placeholder=" " value={formData.institute_code}
                    onChange={e => { setSlugManual(true); handleChange(e); }}
                    required className="irp-input"/>
                </Field>

                {/* colour picker */}
                <div className="irp-field">
                  <div className="irp-color-card">
                    <p className="irp-color-title">Primary theme colour</p>
                    <div className="irp-color-row">
                      <label className="irp-color-swatch" style={{ background: formData.primary_color }}
                        title="Open colour picker">
                        <input type="color" name="primary_color"
                          value={formData.primary_color} onChange={handleChange}/>
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9"/>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                      </label>
                      <div className="irp-presets">
                        {COLOR_PRESETS.map(c => (
                          <button key={c} type="button" title={c}
                            className={`irp-preset${formData.primary_color === c ? " on" : ""}`}
                            style={{ background: c }}
                            onClick={() => setFormData(p => ({ ...p, primary_color: c }))}/>
                        ))}
                      </div>
                      <code className="irp-color-val">{formData.primary_color}</code>
                    </div>
                  </div>
                </div>

                <Field id="description" label="Description (optional)"
                  icon={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>}>
                  <textarea id="description" name="description" placeholder=" "
                    value={formData.description} onChange={handleChange}
                    className="irp-input irp-ta" rows={3}/>
                </Field>

                <div className="irp-nav">
                  <button type="button" className="irp-btn-ghost" onClick={() => navigate("/")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    Back to home
                  </button>
                  <button type="button" className="irp-btn-primary" onClick={() => goTo(2)}
                    disabled={!step1Ok}>
                    Continue
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ════ STEP 2 — Contact ════ */}
            {step === 2 && (
              <div className="irp-fields">
                <div className="irp-row">
                  <Field id="contact_email" label="Contact email" required
                    icon={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>}>
                    <input id="contact_email" name="contact_email" type="email"
                      placeholder=" " value={formData.contact_email}
                      onChange={handleChange} required className="irp-input"/>
                  </Field>
                  <Field id="phone" label="Phone (optional)"
                    icon={<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.21 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>}>
                    <input id="phone" name="phone" type="tel"
                      placeholder=" " value={formData.phone}
                      onChange={handleChange} className="irp-input"/>
                  </Field>
                </div>

                <Field id="website" label="Website (optional)"
                  icon={<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>}>
                  <input id="website" name="website" type="url"
                    placeholder=" " value={formData.website}
                    onChange={handleChange} className="irp-input"/>
                </Field>

                <Field id="address" label="Address (optional)"
                  icon={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>}>
                  <input id="address" name="address" type="text"
                    placeholder=" " value={formData.address}
                    onChange={handleChange} className="irp-input"/>
                </Field>

                <div className="irp-row">
                  <Field id="academic_year" label="Academic year"
                    icon={<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}>
                    <input id="academic_year" name="academic_year" type="text"
                      placeholder=" " value={formData.academic_year}
                      onChange={handleChange} className="irp-input"/>
                  </Field>
                  <Field id="semester" label="Semester"
                    icon={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}>
                    <select id="semester" name="semester"
                      value={formData.semester} onChange={handleChange}
                      className="irp-input irp-select">
                      <option value="Fall">Fall Semester</option>
                      <option value="Spring">Spring Semester</option>
                      <option value="Summer">Summer Semester</option>
                    </select>
                  </Field>
                </div>

                <div className="irp-nav">
                  <button type="button" className="irp-btn-ghost" onClick={() => goTo(1)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    Back
                  </button>
                  <button type="button" className="irp-btn-primary" onClick={() => goTo(3)}
                    disabled={!step2Ok}>
                    Continue
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ════ STEP 3 — Admin ════ */}
            {step === 3 && (
              <div className="irp-fields">

                {/* toggle */}
                <label className="irp-toggle">
                  <div className="irp-toggle-track">
                    <input type="checkbox" checked={autoGenAdmin}
                      onChange={e => setAutoGenAdmin(e.target.checked)}/>
                    <div className="irp-toggle-thumb"/>
                  </div>
                  <div className="irp-toggle-text">
                    <span className="irp-toggle-title">Auto-generate admin from contact email</span>
                    <span className="irp-toggle-sub">
                      {autoGenAdmin
                        ? (formData.contact_email ? `→ ${formData.contact_email}` : "Set contact email in step 2")
                        : "Enter custom admin credentials below"}
                    </span>
                  </div>
                </label>

                <div className={`irp-admin-block${autoGenAdmin ? " locked" : ""}`}>
                  <div className="irp-row">
                    <Field id="admin_name" label="Admin name" required
                      icon={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}>
                      <input id="admin_name" name="admin_name" type="text"
                        placeholder=" " value={formData.admin_name}
                        onChange={handleChange} disabled={autoGenAdmin}
                        className="irp-input" required/>
                    </Field>
                    <Field id="admin_email" label="Admin email" required
                      icon={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>}>
                      <input id="admin_email" name="admin_email" type="email"
                        placeholder=" " value={formData.admin_email}
                        onChange={handleChange} disabled={autoGenAdmin}
                        className="irp-input" required/>
                    </Field>
                  </div>
                </div>

                <Field id="password" label="Password" required
                  icon={<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}
                  suffix={
                    <button type="button" className="irp-eye"
                      onClick={() => setShowPw(s => !s)}
                      aria-label={showPw ? "Hide password" : "Show password"}>
                      {showPw
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                      }
                    </button>
                  }>
                  <input id="password" name="password"
                    type={showPw ? "text" : "password"}
                    placeholder=" " value={formData.password}
                    onChange={handleChange} required
                    className="irp-input irp-input-eye"/>
                </Field>

                {/* strength meter */}
                {formData.password && (
                  <div className="irp-strength" aria-label={`Password strength: ${STRENGTH_LABEL[strength]}`}>
                    <div className="irp-strength-bars">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="irp-strength-bar"
                          style={{ background: i <= strength ? STRENGTH_COLOR[strength] : undefined }}/>
                      ))}
                    </div>
                    <span className="irp-strength-lbl" style={{ color: STRENGTH_COLOR[strength] }}>
                      {STRENGTH_LABEL[strength]}
                    </span>
                  </div>
                )}

                <div className="irp-nav">
                  <button type="button" className="irp-btn-ghost" onClick={() => goTo(2)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    Back
                  </button>
                  <button type="submit" className="irp-btn-submit" disabled={submitting || !step3Ok}>
                    {submitting
                      ? <><span className="irp-spin"/>Creating…</>
                      : <>Create Institute
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </>
                    }
                  </button>
                </div>
              </div>
            )}

          </form>

          <p className="irp-switch">
            Already have an account?{" "}
            <button type="button" onClick={() => navigate("/login")}>Log in here →</button>
          </p>
        </div>
      </main>
    </div>
  );
}