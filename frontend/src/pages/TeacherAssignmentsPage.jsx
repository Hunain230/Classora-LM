import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiClient } from "../api/client";
import "./TeacherLMS.css";

export default function TeacherAssignmentsPage() {
    const [user] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
    const [courses, setCourses] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        course: "",
        description: "",
        dueDate: "",
        dueTime: "23:59",
        totalMarks: 100,
        lateSubmit: true
    });

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        apiClient.get("/api/lms/courses/")
            .then(res => setCourses(res.data.results || []))
            .catch(err => console.error("Error fetching courses", err));
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post("/api/lms/assignments/", {
                title: formData.title,
                course: formData.course,
                description: formData.description,
                due_date: `${formData.dueDate}T${formData.dueTime}:00Z`,
                total_marks: formData.totalMarks,
                allow_late_submission: formData.lateSubmit
            });
            setMessage({ type: "success", text: "Assignment created!" });
            setFormData({ title: "", course: "", description: "", dueDate: "", dueTime: "23:59", totalMarks: 100, lateSubmit: true });
        } catch (err) {
            setMessage({ type: "error", text: "Error creating assignment." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout user={user}>
            <div className="lms-page-container">
                <h2 className="section-title">CREATE ASSIGNMENT</h2>
                <div className="title-divider"></div>

                <form onSubmit={handleSubmit} className="lms-main-form">
                    <div className="form-row">
                        <div className="form-group flex-2">
                            <label>Title:</label>
                            <div className="pill-input-wrapper">
                                <input name="title" placeholder="Assignment name..." value={formData.title} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="form-group flex-1">
                            <label>Course:</label>
                            <div className="pill-input-wrapper">
                                <select name="course" value={formData.course} onChange={handleInputChange} required>
                                    <option value="">Select course</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description:</label>
                        <div className="pill-input-wrapper" style={{ borderRadius: '25px', padding: '15px' }}>
                            <textarea name="description" placeholder="Write Instructions here..." value={formData.description} onChange={handleInputChange} required style={{ height: '150px', background: 'transparent', border: 'none', width: '100%', resize: 'none' }} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label>Attachments:</label>
                            <div className="upload-placeholder pill-input-wrapper">
                                <span className="material-icons-round">upload_file</span>
                                [Upload File]
                                <div style={{ fontSize: '0.7rem', color: '#999' }}>PDF/Video/Slides</div>
                            </div>
                        </div>
                        <div className="form-group flex-1">
                            <label>Due Date:</label>
                            <div className="pill-input-wrapper">
                                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <div className="form-group flex-1">
                            <label>Time:</label>
                            <div className="pill-input-wrapper">
                                <input type="time" name="dueTime" value={formData.dueTime} onChange={handleInputChange} required />
                            </div>
                        </div>
                    </div>

                    <div className="form-row" style={{ alignItems: 'center' }}>
                        <div className="form-group">
                            <label>Total Marks:</label>
                            <div className="pill-input-wrapper" style={{ width: '120px' }}>
                                <input type="number" name="totalMarks" value={formData.totalMarks} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginLeft: '40px' }}>
                            <label>Late Submit:</label>
                            <div className="late-toggle" onClick={() => handleInputChange({ target: { name: 'lateSubmit', value: !formData.lateSubmit, type: 'checkbox', checked: !formData.lateSubmit } })}>
                                <div className={`toggle-pill ${formData.lateSubmit ? 'on' : 'off'}`}>
                                    {formData.lateSubmit ? '[ON]' : '[OFF]'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="preview-section" style={{ marginTop: '30px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Preview:</label>
                        <div className="preview-box">
                            <div className="file-info">
                                <span className="material-icons-round">description</span>
                                [File] filename.pdf
                            </div>
                            <div className="file-actions">
                                <span>[View]</span> <span>[Remove]</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '40px' }}>
                        <button type="button" className="pill-submit-btn secondary">Cancel</button>
                        <button type="submit" className="pill-submit-btn primary" disabled={submitting}>
                            {submitting ? "Creating..." : "Create Assignment"}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
