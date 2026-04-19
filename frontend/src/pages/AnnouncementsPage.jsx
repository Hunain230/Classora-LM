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
    const [selectedImage, setSelectedImage] = useState(null);
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

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("content", formData.content);
            data.append("target_role", formData.target_role);
            if (formData.course) data.append("course", formData.course);
            if (formData.department && user.role === "ADMIN") data.append("department", formData.department);
            if (selectedImage) data.append("image", selectedImage);

            await apiClient.post("/api/lms/announcements/", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            
            setFormData({ title: "", content: "", target_role: "ALL", course: "", department: "" });
            setSelectedImage(null);
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
                                    <label>What's the title?</label>
                                    <input type="text" name="title" className="ann-input" value={formData.title} onChange={handleInputChange} required placeholder="e.g., Important Update..." />
                                </div>

                                <div className="ann-form-group">
                                    <label>Target Audience</label>
                                    <select name="target_role" className="ann-input" value={formData.target_role} onChange={handleInputChange}>
                                        <option value="ALL">Everyone</option>
                                        <option value="STUDENT">Students Only</option>
                                        <option value="TEACHER">Teachers Only</option>
                                    </select>
                                </div>

                                <div className="ann-form-row">
                                    {user.role === "ADMIN" && (
                                        <div className="ann-form-group">
                                            <label>Specific Department</label>
                                            <select name="department" className="ann-input" value={formData.department} onChange={handleInputChange}>
                                                <option value="">-- All Departments --</option>
                                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                    <div className="ann-form-group">
                                        <label>Specific Class</label>
                                        <select name="course" className="ann-input" value={formData.course} onChange={handleInputChange}>
                                            <option value="">-- Across {(user.role === "TEACHER" ? "My Classes" : "All Classes")} --</option>
                                            {courses
                                                .filter(c => !formData.department || c.department === parseInt(formData.department))
                                                .map(c => <option key={c.id} value={c.id}>{c.code}: {c.name}</option>)
                                            }
                                        </select>
                                    </div>
                                </div>

                                <div className="ann-form-group">
                                    <label>Announcement Message</label>
                                    <textarea name="content" className="ann-input ann-textarea" value={formData.content} onChange={handleInputChange} required placeholder="Type the announcement details here..."></textarea>
                                </div>

                                <div className="ann-form-group">
                                    <label>Attach a Picture (Optional)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} />
                                        <div className="ann-input" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: selectedImage ? '#7c3aed' : '#94a3b8' }}>
                                            <span className="material-icons-round">image</span>
                                            {selectedImage ? selectedImage.name : "Choose an image..."}
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="ann-submit-btn" disabled={submitting}>
                                    {submitting ? "Publishing..." : "Post Announcement"}
                                    <span className="material-icons-round">send</span>
                                </button>
                            </form>
                        </div>
                    )}

                    {/* RIGHT PANEL: Feed */}
                    <div className="ann-feed">
                        {loading && <div className="ann-empty"><p>Loading announcements...</p></div>}
                        {!loading && announcements.length === 0 && (
                            <div className="ann-empty">
                                <span className="material-icons-round">notifications_paused</span>
                                <p>Nothing here yet. Stay tuned!</p>
                            </div>
                        )}

                        {!loading && announcements.map(ann => {
                            const d = new Date(ann.created_at);
                            const imgUrl = ann.image_url || (ann.image ? `http://localhost:8000${ann.image}` : null);
                            
                            return (
                                <div key={ann.id} className="ann-card">
                                    <div className="ann-card-header">
                                        <div className="ann-avatar">
                                            <span className="material-icons-round">person</span>
                                        </div>
                                        <div className="ann-card-header-main">
                                            <div className="ann-author">{ann.author_name}</div>
                                            <div className="ann-meta">
                                                {d.toLocaleDateString()} at {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="ann-chips-row">
                                                {ann.author_role === "ADMIN" ? (
                                                    <span className="ann-chip admin">Admin</span>
                                                ) : (
                                                    <span className="ann-chip teacher">Teacher</span>
                                                )}
                                                {ann.course ? (
                                                    <span className="ann-chip blue">Class</span>
                                                ) : ann.department ? (
                                                    <span className="ann-chip purple">Dept</span>
                                                ) : (
                                                    <span className="ann-chip global">Global</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {(user.role === 'ADMIN' || user.id === ann.author) && (
                                            <button 
                                                className="topbar-icon-btn"
                                                style={{ color: '#f43f5e', background: 'transparent' }}
                                                onClick={() => deleteAnnouncement(ann.id)}
                                            >
                                                <span className="material-icons-round" style={{ fontSize: 20 }}>delete_outline</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="ann-card-body">
                                        <h2 className="ann-card-title">{ann.title}</h2>
                                        <p className="ann-card-content">{ann.content}</p>
                                        
                                        {imgUrl && (
                                            <div className="ann-image-container" style={{ marginBottom: '24px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                                                <img 
                                                    src={imgUrl} 
                                                    alt="Announcement" 
                                                    style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: '500px' }}
                                                    onClick={() => window.open(imgUrl, '_blank')}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Comments Section */}
                                    <div className="ann-comments-section">
                                        <div className="ann-comments-list">
                                            {(ann.comments || []).map(cmt => (
                                                <div key={cmt.id} className="ann-comment">
                                                    <div className="ann-comment-avatar">
                                                        <span className="material-icons-round" style={{ fontSize: 16 }}>account_circle</span>
                                                    </div>
                                                    <div className="ann-comment-body">
                                                        <div className="ann-comment-author">
                                                            {cmt.user_name} <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>· {cmt.user_role}</span>
                                                        </div>
                                                        <div className="ann-comment-text">{cmt.content}</div>
                                                        {(user.role === 'ADMIN' || user.id === cmt.user) && (
                                                            <button
                                                                style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', opacity: 0.4 }}
                                                                onClick={() => deleteComment(cmt.id)}
                                                            >
                                                                <span className="material-icons-round" style={{ fontSize: 14 }}>close</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="ann-comment-input-row" style={{ marginTop: '10px' }}>
                                            <div className="ann-comment-avatar you"><span className="material-icons-round">edit</span></div>
                                            <input
                                                type="text"
                                                className="ann-comment-input"
                                                placeholder="Share your thoughts..."
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
