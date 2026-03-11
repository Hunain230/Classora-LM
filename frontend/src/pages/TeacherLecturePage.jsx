import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiClient } from "../api/client";
import "./TeacherLMS.css";

export default function TeacherLecturePage() {
    const [user] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
    const [courses, setCourses] = useState([]);

    const [formData, setFormData] = useState({
        course: "",
        moduleTopic: "",
        lectureTitle: "",
        description: "",
        scheduleDate: "",
        publishNow: true,
        externalLink: ""
    });

    const [files, setFiles] = useState([
        { name: "lecture1_slides.pptx", size: "12.5 MB", status: "Ready" },
        { name: "lecture1_recording.mp4", size: "45.2 MB", status: "Processing..." }
    ]);

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        apiClient.get("/api/lms/courses/")
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setCourses(data);
            })
            .catch(err => console.error("Error fetching courses", err));
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post("/api/lms/lectures/", {
                course: formData.course,
                title: formData.lectureTitle,
                description: formData.description,
                scheduled_date: formData.publishNow ? null : formData.scheduleDate,
            });
            setMessage({ type: "success", text: "Lecture uploaded successfully!" });
        } catch (err) {
            setMessage({ type: "error", text: "Failed to upload lecture." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout user={user}>
            <div className="lms-page-container">
                <h2 className="section-title">UPLOAD LECTURE</h2>
                <div className="title-divider"></div>

                <div className="course-grid-layout" style={{ gridTemplateColumns: '1fr 300px' }}>
                    <form onSubmit={handleSubmit} className="lms-main-form">
                        <div className="form-group">
                            <label>Course:</label>
                            <div className="pill-input-wrapper">
                                <select name="course" value={formData.course} onChange={handleInputChange}>
                                    <option value="">Select Course</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label>Topic/Module:</label>
                                <div className="pill-input-wrapper">
                                    <input name="moduleTopic" placeholder="e.g., Week 1: Introduction" value={formData.moduleTopic} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="form-group flex-1">
                                <label>Lecture Title:</label>
                                <div className="pill-input-wrapper">
                                    <input name="lectureTitle" placeholder="Lecture 1: What is Psychology?" value={formData.lectureTitle} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label>Upload Materials:</label>
                                <div className="upload-placeholder pill-input-wrapper" style={{ height: '120px', flexDirection: 'column' }}>
                                    <span className="material-icons-round" style={{ fontSize: '2.5rem', color: '#ef4444' }}>cloud_upload</span>
                                    <div style={{ color: '#ef4444', fontWeight: 800 }}>Drag & drop files here</div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PDF, PPT, Video (Max 100MB)</div>
                                </div>
                            </div>
                            <div className="form-group flex-1">
                                <label>External Links:</label>
                                <div className="pill-input-wrapper">
                                    <input name="externalLink" placeholder="YouTube URL, Google Docs..." value={formData.externalLink} onChange={handleInputChange} />
                                    <button type="button" className="topbar-icon-btn" style={{ width: '35px', height: '35px', background: '#2196F3', color: 'white' }}>+</button>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description:</label>
                            <div className="pill-input-wrapper" style={{ height: '100px', padding: '15px' }}>
                                <textarea name="description" placeholder="Lecture notes, summary, key points..." value={formData.description} onChange={handleInputChange} style={{ height: '100%', background: 'transparent', border: 'none', width: '100%', resize: 'none' }} />
                            </div>
                        </div>

                        <div className="form-row" style={{ alignItems: 'center' }}>
                            <div className="form-group flex-1">
                                <label>Schedule Visibility:</label>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input type="checkbox" name="publishNow" checked={formData.publishNow} onChange={handleInputChange} />
                                        <span style={{ fontSize: '0.85rem' }}>Publish immediately</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input type="checkbox" name="publishLater" checked={!formData.publishNow} onChange={() => setFormData(p => ({ ...p, publishNow: !p.publishNow }))} />
                                        <span style={{ fontSize: '0.85rem' }}>Schedule for later</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="files-list" style={{ marginTop: '30px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>Files to Upload:</label>
                            {files.map((file, i) => (
                                <div key={i} className="preview-box" style={{ marginBottom: '10px' }}>
                                    <div className="file-info">
                                        <span className="material-icons-round">description</span>
                                        <div>
                                            <div>{file.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{file.size} • {file.status}</div>
                                        </div>
                                    </div>
                                    <div className="file-actions">
                                        <span className="material-icons-round" style={{ fontSize: '18px' }}>close</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="form-actions" style={{ marginTop: '40px' }}>
                            <button type="button" className="pill-submit-btn secondary" style={{ width: '150px' }}>Cancel</button>
                            <button type="submit" className="pill-submit-btn primary" style={{ width: '200px', background: '#dcfce7', color: '#15803d', boxShadow: 'none' }} disabled={submitting}>
                                {submitting ? "Uploading..." : "Upload Lecture"}
                            </button>
                        </div>
                    </form>

                    {/* Mini Preview */}
                    <div className="course-preview-area">
                        <div className="preview-label">Lecture Preview:</div>
                        <div className="dashboard-card preview-card" style={{ border: 'none', background: '#f8fafc' }}>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>Introduction to Psychology</div>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>Week 1: Introduction</div>
                            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '5px' }}>Lecture 1: What is Psychology?</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '15px' }}>2 files attached</div>
                            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, marginTop: '5px' }}>Visible: Immediately</div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
