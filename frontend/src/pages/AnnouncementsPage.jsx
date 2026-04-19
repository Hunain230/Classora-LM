import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiClient } from "../api/client";
import "./AnnouncementsPage.css";

export default function AnnouncementsPage() {
    const user = JSON.parse(localStorage.getItem("current_user") || "{}");
    const [announcements, setAnnouncements] = useState([]);
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        target_role: "ALL",
        course: "",
        department: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [commentTexts, setCommentTexts] = useState({}); // { announcementId: text }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [annRes, crsRes, deptRes] = await Promise.all([
                apiClient.get("/api/lms/announcements/"),
                user.role !== "STUDENT" ? apiClient.get("/api/lms/courses/") : Promise.resolve({ data: [] }),
                user.role === "ADMIN" ? apiClient.get("/api/lms/departments/") : Promise.resolve({ data: [] })
            ]);
            setAnnouncements(Array.isArray(annRes.data) ? annRes.data : (annRes.data.results || []));
            setCourses(Array.isArray(crsRes.data) ? crsRes.data : (crsRes.data.results || []));
            setDepartments(Array.isArray(deptRes.data) ? deptRes.data : (deptRes.data.results || []));
        } catch (err) {
            console.error("Failed fetching data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                title: formData.title,
                content: formData.content,
                target_role: formData.target_role,
            };
            if (formData.course) payload.course = formData.course;
            if (formData.department && user.role === "ADMIN") payload.department = formData.department;

            await apiClient.post("/api/lms/announcements/", payload);
            setFormData({ title: "", content: "", target_role: "ALL", course: "", department: "" });
            fetchData();
        } catch (err) {
            alert("Failed to post announcement. " + JSON.stringify(err.response?.data || ""));
        } finally {
            setSubmitting(false);
        }
    };

    const postComment = async (announcementId) => {
        const txt = commentTexts[announcementId];
        if (!txt || !txt.trim()) return;
        try {
            await apiClient.post("/api/lms/announcement-comments/", {
                announcement: announcementId,
                content: txt
            });
            setCommentTexts({ ...commentTexts, [announcementId]: "" });
            fetchData(); // Refresh to show new comment
        } catch (err) {
            alert("Failed to post comment.");
        }
    };

    const deleteAnnouncement = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await apiClient.delete(`/api/lms/announcements/${id}/`);
            fetchData();
        } catch(err) {
            alert("Failed to delete announcement.");
        }
    };

    const deleteComment = async (id) => {
        if (!window.confirm("Delete your comment?")) return;
        try {
            await apiClient.delete(`/api/lms/announcement-comments/${id}/`);
            fetchData();
        } catch(err) {
            alert("Failed to delete comment.");
        }
    };

    return (
        <DashboardLayout user={user}>
            <div className="ann-page-container">
                <div className="ann-header">
                    <h1 className="ann-title">Announcements</h1>
                    <p className="ann-subtitle">Broadcast messages and engage with your classes</p>
                </div>

                <div className="ann-layout">
                    {/* LEFT PANEL: Creation Form (Only Admin & Teacher) */}
                    {user.role !== "STUDENT" && (
                        <div className="ann-create-panel">
                            <h3 className="ann-panel-title">
                                <span className="material-icons-round">campaign</span> Make an Announcement
                            </h3>
                            <form onSubmit={handleSubmit} className="ann-form">
                                <div className="ann-form-group">
                                    <label>Title</label>
                                    <input type="text" name="title" className="ann-input" value={formData.title} onChange={handleInputChange} required placeholder="e.g., Campus closed on Friday" />
                                </div>

                                <div className="ann-form-row">
                                    <div className="ann-form-group">
                                        <label>Target Audience</label>
                                        <select name="target_role" className="ann-input" value={formData.target_role} onChange={handleInputChange}>
                                            <option value="ALL">Everyone</option>
                                            <option value="STUDENT">Students Only</option>
                                            <option value="TEACHER">Teachers Only</option>
                                        </select>
                                    </div>

                                    {user.role === "ADMIN" && (
                                        <div className="ann-form-group">
                                            <label>Specific Department</label>
                                            <select name="department" className="ann-input" value={formData.department} onChange={handleInputChange}>
                                                <option value="">-- All Departments --</option>
                                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="ann-form-group">
                                    <label>Specific Class {formData.department ? "(Filter by dept)" : ""}</label>
                                    <select name="course" className="ann-input" value={formData.course} onChange={handleInputChange}>
                                        <option value="">-- Across {(user.role === "TEACHER" ? "My Classes" : "All Classes")} --</option>
                                        {courses
                                            .filter(c => !formData.department || c.department === parseInt(formData.department))
                                            .map(c => <option key={c.id} value={c.id}>{c.code}: {c.name}</option>)
                                        }
                                    </select>
                                </div>

                                <div className="ann-form-group" style={{ flex: 1 }}>
                                    <label>Message</label>
                                    <textarea name="content" className="ann-input ann-textarea" value={formData.content} onChange={handleInputChange} required placeholder="Type the announcement details here..."></textarea>
                                </div>

                                <button type="submit" className="ann-submit-btn" disabled={submitting}>
                                    {submitting ? "Posting..." : "Post Announcement"}
                                    <span className="material-icons-round">send</span>
                                </button>
                            </form>
                        </div>
                    )}

                    {/* RIGHT PANEL: Feed */}
                    <div className="ann-feed">
                        {loading && <p style={{ color: '#94a3b8' }}>Loading announcements...</p>}
                        {!loading && announcements.length === 0 && (
                            <div className="ann-empty">
                                <span className="material-icons-round">notifications_none</span>
                                <p>No announcements right now.</p>
                            </div>
                        )}

                        {!loading && announcements.map(ann => {
                            const d = new Date(ann.created_at);
                            return (
                                <div key={ann.id} className="ann-card">
                                    <div className="ann-card-header">
                                        <div className="ann-avatar">
                                            <span className="material-icons-round">person</span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="ann-author">{ann.author_name}</div>
                                            <div className="ann-meta">
                                                {d.toLocaleDateString()} at {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {ann.target_role !== "ALL" && ` · To ${ann.target_role}s`}
                                            </div>
                                        </div>
                                        {/* Target Chip */}
                                        {ann.course ? (
                                            <span className="ann-chip blue">Class Specific</span>
                                        ) : ann.department ? (
                                            <span className="ann-chip purple">Department Wide</span>
                                        ) : (
                                            <span className="ann-chip gray">Global</span>
                                        )}
                                        {/* Actions */}
                                        {(user.role === 'ADMIN' || user.id === ann.author) && (
                                            <button 
                                                style={{ marginLeft: 10, background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: 4 }}
                                                onClick={() => deleteAnnouncement(ann.id)}
                                                title="Delete Announcement"
                                            >
                                                <span className="material-icons-round" style={{ fontSize: 20 }}>delete</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="ann-card-title">{ann.title}</div>
                                    <div className="ann-card-content">{ann.content}</div>

                                    {/* Comments Section */}
                                    <div className="ann-comments-section">
                                        <div className="ann-comments-list">
                                            {(ann.comments || []).map(cmt => (
                                                <div key={cmt.id} className="ann-comment">
                                                    <div className="ann-comment-avatar">
                                                        <span className="material-icons-round" style={{ fontSize: 14 }}>person</span>
                                                    </div>
                                                    <div className="ann-comment-body">
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                            <div className="ann-comment-author">
                                                                {cmt.user_name} <span style={{ fontWeight: 400, color: '#94a3b8' }}>· {cmt.user_role}</span>
                                                            </div>
                                                            {(user.role === 'ADMIN' || user.id === cmt.user) && (
                                                                <button
                                                                    style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: 0 }}
                                                                    onClick={() => deleteComment(cmt.id)}
                                                                >
                                                                    <span className="material-icons-round" style={{ fontSize: 14 }}>delete</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="ann-comment-text">{cmt.content}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="ann-comment-input-row">
                                            <div className="ann-comment-avatar you"><span className="material-icons-round">person</span></div>
                                            <input
                                                type="text"
                                                className="ann-comment-input"
                                                placeholder="Write a comment..."
                                                value={commentTexts[ann.id] || ""}
                                                onChange={e => setCommentTexts({ ...commentTexts, [ann.id]: e.target.value })}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        postComment(ann.id);
                                                    }
                                                }}
                                            />
                                            <button className="ann-comment-send" onClick={() => postComment(ann.id)}>
                                                <span className="material-icons-round">send</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
