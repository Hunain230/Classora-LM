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
      <div style={{ marginBottom: 24, color: "#b91c1c" }}>{error}</div>
    );
  }

  if (!institute) {
    return <div style={{ marginBottom: 24 }}>Loading institute info...</div>;
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ marginBottom: 4 }}>{institute.name}</h2>
      <p style={{ margin: 0 }}>Code: {institute.institute_code}</p>
      <p style={{ margin: 0 }}>
        Created: {new Date(institute.created_at).toLocaleString()}
      </p>
    </div>
  );
}

