import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { apiClient } from "../../api/client";
import "./AdminCourse.css";

export default function CreateCoursePage() {
    const [user] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        department: "",
        semester: "Fall 2024",
        description: "",
        credits: 3,
        duration_weeks: 16,
        max_students: 50,
        is_published: false,
        assigned_teachers: [], // IDs
    });

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        // Fetch teachers for the multi-select
        apiClient.get(`/api/users/?role=TEACHER&institute=${user.institute_id}`)
            .then(res => setTeachers(res.data.results || []))
            .catch(err => console.error("Error fetching teachers", err));
    }, [user.institute_id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleTeacherToggle = (teacherId) => {
        setFormData(prev => {
            const alreadyAssigned = prev.assigned_teachers.includes(teacherId);
            if (alreadyAssigned) {
                return { ...prev, assigned_teachers: prev.assigned_teachers.filter(id => id !== teacherId) };
            }
            return { ...prev, assigned_teachers: [...prev.assigned_teachers, teacherId] };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: "", text: "" });

        try {
            await apiClient.post("/api/lms/courses/", {
                ...formData,
                institute: user.institute_id,
                teachers: formData.assigned_teachers
            });
            setMessage({ type: "success", text: "Course created successfully!" });
            setFormData({
                name: "", code: "", department: "", semester: "Fall 2024",
                description: "", credits: 3, duration_weeks: 16, max_students: 50,
                is_published: false, assigned_teachers: []
            });
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Failed to create course. Check your inputs." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout user={user}>
            <div className="course-page-container">
                <h2 className="section-title">CREATE NEW COURSE</h2>
                <div className="title-divider"></div>

                {message.text && (
                    <div className={`pill-error-msg ${message.type === 'success' ? 'success-msg' : ''}`} style={{ marginBottom: '30px' }}>
                        {message.text}
                    </div>
                )}

                <div className="course-grid-layout">
                    {/* Main Form */}
                    <form onSubmit={handleSubmit} className="course-main-form">
                        <div className="form-row">
                            <div className="form-group flex-2">
                                <label>Course Name:</label>
                                <div className="pill-input-wrapper">
                                    <input name="name" placeholder="e.g., Introduction to Psychology" value={formData.name} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="form-group flex-1">
                                <label>Course Code:</label>
                                <div className="pill-input-wrapper">
                                    <input name="code" placeholder="PSY101" value={formData.code} onChange={handleInputChange} required />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label>Department:</label>
                                <div className="pill-input-wrapper">
                                    <select name="department" value={formData.department} onChange={handleInputChange}>
                                        <option value="">Select Department</option>
                                        <option value="Psychology">Psychology</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Business">Business</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group flex-1">
                                <label>Semester:</label>
                                <div className="pill-input-wrapper">
                                    <select name="semester" value={formData.semester} onChange={handleInputChange}>
                                        <option value="Fall 2024">Fall 2024</option>
                                        <option value="Spring 2025">Spring 2025</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Assign Teachers:</label>
                            <div className="teacher-chips-container pill-input-wrapper" style={{ flexWrap: 'wrap', minHeight: '60px', padding: '10px 20px' }}>
                                {formData.assigned_teachers.map(tid => {
                                    const t = teachers.find(teacher => teacher.id === tid);
                                    return t ? (
                                        <div key={tid} className="teacher-chip">
                                            {t.full_name}
                                            <span className="material-icons-round" onClick={() => handleTeacherToggle(tid)}>close</span>
                                        </div>
                                    ) : null;
                                })}
                                <div className="add-teacher-btn">
                                    + Add more...
                                    <select className="hidden-select" onChange={(e) => handleTeacherToggle(parseInt(e.target.value))}>
                                        <option value="">Select Teacher</option>
                                        {teachers.filter(t => !formData.assigned_teachers.includes(t.id)).map(t => (
                                            <option key={t.id} value={t.id}>{t.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Course Icon:</label>
                            <div className="upload-placeholder pill-input-wrapper">
                                <span className="material-icons-round">cloud_upload</span>
                                [Upload]
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Course Description:</label>
                            <div className="pill-input-wrapper" style={{ borderRadius: '25px', padding: '15px 20px' }}>
                                <textarea name="description" placeholder="Course overview, learning objectives, syllabus..." value={formData.description} onChange={handleInputChange} style={{ height: '120px', resize: 'none', border: 'none', width: '100%', background: 'transparent' }} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Prerequisites:</label>
                            <div className="pill-input-wrapper">
                                <input placeholder="None / Select courses" />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                                <span style={{ fontSize: '0.9rem', color: '#666' }}>Auto-enroll eligible students</span>
                            </div>
                        </div>

                        <div className="settings-row">
                            <div className="settings-item">
                                <label>Credits:</label>
                                <div className="pill-input-wrapper small"><input type="number" name="credits" value={formData.credits} onChange={handleInputChange} /></div>
                            </div>
                            <div className="settings-item">
                                <label>Duration (Weeks):</label>
                                <div className="pill-input-wrapper small"><input type="number" name="duration_weeks" value={formData.duration_weeks} onChange={handleInputChange} /></div>
                            </div>
                            <div className="settings-item">
                                <label>Max Students:</label>
                                <div className="pill-input-wrapper small"><input type="number" name="max_students" value={formData.max_students} onChange={handleInputChange} /></div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="pill-submit-btn secondary" onClick={() => navigate("/admin")}>CANCEL</button>
                            <button type="submit" className="pill-submit-btn primary" disabled={submitting}>
                                {submitting ? "CREATING..." : "CREATE COURSE"}
                            </button>
                        </div>
                    </form>

                    {/* Preview Sidebar */}
                    <div className="course-preview-area">
                        <div className="preview-label">Course Preview:</div>
                        <div className="dashboard-card preview-card">
                            <div className="preview-header">
                                <div className="preview-icon">
                                    <span className="material-icons-round">import_contacts</span>
                                </div>
                                <div className="preview-meta">
                                    <div className="preview-code">{formData.code || "CODE101"}</div>
                                    <div className="preview-name">{formData.name || "Course Name"}</div>
                                </div>
                            </div>
                            <div className="preview-details">
                                <div className="preview-stat">Teachers: {formData.assigned_teachers.length} assigned</div>
                                <div className="status-badge">Status: Ready to publish</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
