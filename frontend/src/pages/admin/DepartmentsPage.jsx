import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { apiClient } from "../../api/client";
import "./AdminCourse.css"; // Reuse some styles

export default function DepartmentsPage() {
    const [user] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({ name: "", code: "", description: "" });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = () => {
        apiClient.get("/api/lms/departments/")
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setDepartments(data);
            })
            .catch(err => console.error(err));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post("/api/lms/departments/", {
                ...formData,
                institute: user.institute_id
            });
            setFormData({ name: "", code: "", description: "" });
            setMessage({ type: "success", text: "Department created!" });
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
            fetchDepartments();
        } catch (err) {
            setMessage({ type: "error", text: "Failed to create department." });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this department?")) return;
        try {
            await apiClient.delete(`/api/lms/departments/${id}/`);
            fetchDepartments();
        } catch (err) {
            alert("Failed to delete department.");
        }
    };

    return (
        <DashboardLayout user={user}>
            <div className="lms-page-container">
                <h2 className="section-title">DEPARTMENTS</h2>
                <div className="title-divider"></div>

                <div className="course-grid-layout" style={{ gridTemplateColumns: '1fr 350px' }}>
                    <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>NAME</th>
                                    <th>CODE</th>
                                    <th>COURSES</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map(d => (
                                    <tr key={d.id}>
                                        <td style={{ fontWeight: 700 }}>{d.name}</td>
                                        <td>{d.code}</td>
                                        <td>{d.courses_count || 0}</td>
                                        <td>
                                            <button onClick={() => handleDelete(d.id)} className="topbar-icon-btn" style={{ color: '#ef4444' }}>
                                                <span className="material-icons-round">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {departments.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                            No departments found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="lms-main-form" style={{ padding: '35px', borderRadius: '40px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '30px', color: '#1e293b', letterSpacing: '1px' }}>ADD DEPARTMENT</h3>
                        {message.text && (
                            <div className={`pill-error-msg ${message.type === 'success' ? 'success-msg' : ''}`} style={{ marginBottom: '20px' }}>
                                {message.text}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name:</label>
                                <div className="pill-input-wrapper">
                                    <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Computer Science" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Code:</label>
                                <div className="pill-input-wrapper">
                                    <input name="code" value={formData.code} onChange={handleInputChange} placeholder="CS" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description (Optional):</label>
                                <div className="pill-input-wrapper" style={{ height: '100px', padding: '15px' }}>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ border: 'none', background: 'transparent', width: '100%', height: '100%', resize: 'none' }} />
                                </div>
                            </div>
                            <button type="submit" className="pill-submit-btn primary" disabled={submitting} style={{ width: '100%', marginTop: '30px', padding: '22px' }}>
                                {submitting ? "CREATING..." : "ADD DEPARTMENT"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
