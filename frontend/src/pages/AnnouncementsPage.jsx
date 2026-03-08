import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiClient } from "../api/client";
import "./TeacherLMS.css";

export default function AnnouncementsPage() {
    const [user] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
    const [announcements, setAnnouncements] = useState([]);
    const [formData, setFormData] = useState({ title: "", content: "", course: "" });
    const [courses, setCourses] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
        apiClient.get("/api/lms/courses/")
            .then(res => setCourses(res.data.results || []))
            .catch(err => console.error(err));
    }, []);

    const fetchAnnouncements = () => {
        apiClient.get("/api/lms/announcements/")
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setAnnouncements(data);
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
            await apiClient.post("/api/lms/announcements/", {
                ...formData,
                institute: user.institute_id
            });
            setFormData({ title: "", content: "", course: "" });
            fetchAnnouncements();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout user={user}>
            <div className="lms-page-container">
                <h2 className="section-title">ANNOUNCEMENTS</h2>
                <div className="title-divider"></div>

                {/* Create Announcement Form */}
                {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                    <div className="lms-main-form" style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '20px' }}>Make an Announcement</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group flex-2">
                                    <label>Title:</label>
                                    <div className="pill-input-wrapper">
                                        <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Urgent: Class rescheduled..." required />
                                    </div>
                                </div>
                                <div className="form-group flex-1">
                                    <label>Post to Course (Optional):</label>
                                    <div className="pill-input-wrapper">
                                        <select name="course" value={formData.course} onChange={handleInputChange}>
                                            <option value="">Whole Institute</option>
                                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Content:</label>
                                <div className="pill-input-wrapper" style={{ height: '100px', padding: '15px' }}>
                                    <textarea name="content" value={formData.content} onChange={handleInputChange} placeholder="Type announcement details here..." required style={{ height: '100%', width: '100%', background: 'transparent', border: 'none', resize: 'none' }} />
                                </div>
                            </div>
                            <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '30px' }}>
                                <button type="submit" className="pill-submit-btn primary" style={{ width: '300px', padding: '24px' }} disabled={submitting}>
                                    {submitting ? "POSTING..." : "POST ANNOUNCEMENT"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Announcements List */}
                <div className="announcements-list">
                    {announcements.length === 0 ? (
                        <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                            <span className="material-icons-round" style={{ fontSize: '3rem' }}>campaign</span>
                            <p>No announcements yet.</p>
                        </div>
                    ) : (
                        announcements.map(a => (
                            <div key={a.id} className="dashboard-card" style={{ marginBottom: '20px', borderLeft: '4px solid #2196F3' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{a.title}</h4>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '5px' }}>
                                            Posted by {a.author_name} • {new Date(a.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    {a.course && <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '50px', fontWeight: 700 }}>COURSE: {a.course}</span>}
                                </div>
                                <p style={{ marginTop: '15px', color: '#475569', lineHeight: '1.6' }}>{a.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
