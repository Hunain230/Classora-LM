import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerInstitute } from "../api/auth";
import "./LoginPage.css"; // Reuse themed styles

export default function InstituteRegisterPage() {
  const navigate = useNavigate();

  // Institute Details
  const [formData, setFormData] = useState({
    institute_name: "",
    institute_code: "",
    description: "",
    primary_color: "#2196F3",
    website: "",
    contact_email: "",
    phone: "",
    address: "",
    academic_year: "2024-2025",
    semester: "Fall",
    // Admin Details
    admin_name: "",
    admin_email: "",
    password: "",
  });

  const [autoGenAdmin, setAutoGenAdmin] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sync auto-gen admin details
  useEffect(() => {
    if (autoGenAdmin) {
      setFormData(prev => ({
        ...prev,
        admin_email: prev.contact_email,
        admin_name: prev.admin_name || "Admin User"
      }));
    }
  }, [autoGenAdmin, formData.contact_email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate code from name if code is empty
      if (name === "institute_name" && !prev.institute_code) {
        newData.institute_code = value.toLowerCase().replace(/\s+/g, '-').slice(0, 50);
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Sanitize website URL
    let submissionData = { ...formData };
    if (submissionData.website && !submissionData.website.startsWith("http")) {
      submissionData.website = `https://${submissionData.website}`;
    }

    try {
      setSubmitting(true);
      await registerInstitute(submissionData);
      setSuccess("Institute registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      console.error("Full Registration Error:", err);
      if (err.response) {
        const data = err.response.data;
        const message = typeof data === "string" ? data : (data.detail || JSON.stringify(data));
        setError(`Error (${err.response.status}): ${message}`);
      } else if (err.request) {
        setError("Connection failed: The server did not respond. Is the backend running at localhost:8000?");
      } else {
        setError(`Request error: ${err.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page-container" style={{ padding: '60px 20px', height: 'auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="login-content" style={{ maxWidth: '1000px', width: '100%' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: '#333', marginBottom: '10px', textTransform: 'uppercase' }}>REGISTER NEW INSTITUTE</h2>
        <p style={{ color: '#666', marginBottom: '50px', fontSize: '1.1rem' }}>Set up your multi-tenant learning environment in seconds.</p>

        {error && <div className="pill-error-msg" style={{ borderRadius: '50px', marginBottom: '30px' }}>{error}</div>}
        {success && <div className="pill-error-msg" style={{ background: '#e8f5e9', color: '#2e7d32', borderRadius: '50px', marginBottom: '30px' }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px', alignItems: 'start' }}>

            {/* Left Column: Institute Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2196F3', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Institute Details</div>

              <div className="pill-input-wrapper">
                <input className="pill-input-field" name="institute_name" placeholder="INSTITUTE NAME (e.g. Harvard)" value={formData.institute_name} onChange={handleInputChange} required />
              </div>

              <div className="pill-input-wrapper">
                <input className="pill-input-field" name="institute_code" placeholder="INSTITUTE CODE (URL SLUG)" value={formData.institute_code} onChange={handleInputChange} required />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'white', padding: '10px 20px', borderRadius: '50px', border: '1px solid #edf2f7', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <label style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Primary Theme Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <input
                    type="color"
                    name="primary_color"
                    value={formData.primary_color}
                    onChange={handleInputChange}
                    style={{ border: 'none', width: '50px', height: '35px', padding: '0', cursor: 'pointer', background: 'none' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#888', fontStyle: 'italic' }}>{formData.primary_color.toUpperCase()}</span>
                </div>
              </div>

              <div className="pill-input-wrapper" style={{ borderRadius: '25px', padding: '15px 20px' }}>
                <textarea className="pill-input-field" name="description" placeholder="INSTITUTE DESCRIPTION, MISSION, VISION..." value={formData.description} onChange={handleInputChange} style={{ height: '120px', resize: 'none', border: 'none', background: 'transparent', width: '100%' }} />
              </div>
            </div>

            {/* Right Column: Contact & Schedule */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2196F3', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact & Schedule</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="pill-input-wrapper"><input className="pill-input-field" name="website" placeholder="WEBSITE URL" value={formData.website} onChange={handleInputChange} /></div>
                <div className="pill-input-wrapper"><input className="pill-input-field" name="contact_email" placeholder="CONTACT EMAIL" value={formData.contact_email} onChange={handleInputChange} required /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="pill-input-wrapper"><input className="pill-input-field" name="phone" placeholder="PHONE NUMBER" value={formData.phone} onChange={handleInputChange} /></div>
                <div className="pill-input-wrapper"><input className="pill-input-field" name="academic_year" placeholder="ACADEMIC YEAR" value={formData.academic_year} onChange={handleInputChange} /></div>
              </div>

              <div className="pill-input-wrapper">
                <input className="pill-input-field" name="address" placeholder="PHYSICAL ADDRESS (City, State, Country)" value={formData.address} onChange={handleInputChange} />
              </div>

              <div className="pill-input-wrapper" style={{ padding: '4px 10px' }}>
                <select className="pill-input-field" name="semester" value={formData.semester} onChange={handleInputChange} style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}>
                  <option value="Fall">Fall Semester</option>
                  <option value="Spring">Spring Semester</option>
                  <option value="Summer">Summer Semester</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '50px', padding: '40px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: '35px', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#333', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Account Set-up</div>

            <label className="remember-me-label" style={{ marginBottom: '25px', fontWeight: 500 }}>
              <input type="checkbox" checked={autoGenAdmin} onChange={(e) => setAutoGenAdmin(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              Auto-generate default admin account (using contact email)
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', opacity: autoGenAdmin ? 0.6 : 1, transition: 'opacity 0.3s ease' }}>
              <div className="pill-input-wrapper"><input className="pill-input-field" name="admin_name" placeholder="ADMIN FULL NAME" value={formData.admin_name} onChange={handleInputChange} disabled={autoGenAdmin} /></div>
              <div className="pill-input-wrapper"><input className="pill-input-field" name="admin_email" placeholder="ADMIN EMAIL ADDRESS" value={formData.admin_email} onChange={handleInputChange} disabled={autoGenAdmin} /></div>
              <div className="pill-input-wrapper"><input className="pill-input-field" type="password" name="password" placeholder="SECURE PASSWORD" value={formData.password} onChange={handleInputChange} required /></div>
            </div>
          </div>

          <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', gap: '25px', marginBottom: '60px' }}>
            <button type="button" onClick={() => navigate("/login")} className="pill-submit-btn" style={{ background: 'white', color: '#666', border: '2px solid #edf2f7' }}>CANCEL</button>
            <button type="submit" className="pill-submit-btn" disabled={submitting}>
              {submitting ? "PREPARING..." : "CREATE INSTITUTE"}
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.8)', padding: '20px 40px', borderRadius: '50px', display: 'inline-flex', gap: '20px', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <strong>READY AT:</strong>
            <span style={{ color: '#2196F3', fontWeight: 700 }}>{formData.institute_code ? `${formData.institute_code}.classora.com` : "your-tenant.classora.com"}</span>
            <span style={{ color: '#4CAF50', background: 'rgba(76, 175, 80, 0.1)', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 }}>ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
