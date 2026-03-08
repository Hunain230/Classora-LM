import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";

export default function InstituteInfo({ instituteId }) {
  const [institute, setInstitute] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!instituteId) return;
    apiClient
      .get(`/api/institute/${instituteId}/`)
      .then((res) => setInstitute(res.data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load institute information.");
      });
  }, [instituteId]);

  if (error) {
    return (
      <div className="dashboard-card" style={{ color: "#d32f2f" }}>{error}</div>
    );
  }

  if (!institute) {
    return <div className="dashboard-card">Loading institute info...</div>;
  }

  return (
    <div className="dashboard-card">
      <div className="card-title">
        <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
        </svg>
        Institute Information
      </div>
      <h2 style={{ margin: '0 0 10px 0', color: '#2196F3' }}>{institute.name}</h2>
      <div style={{ display: 'flex', gap: '30px', color: '#666', fontSize: '0.9rem' }}>
        <span><strong>CODE:</strong> {institute.institute_code}</span>
        <span><strong>CREATED:</strong> {new Date(institute.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
