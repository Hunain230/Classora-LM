import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiClient } from "../api/client";
import "./AssignmentsPage.css";

const TABS = { CREATE: "create", SUBMISSIONS: "submissions" };

export default function TeacherAssignmentsPage() {
    const [user] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
    const [activeTab, setActiveTab] = useState(TABS.CREATE);
    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [grading, setGrading] = useState({}); // { [subId]: { score, feedback } }
    const [attachmentFile, setAttachmentFile] = useState(null);
    const fileInputRef = useRef();

    const [formData, setFormData] = useState({
        title: "", course: "", description: "",
        dueDate: "", dueTime: "23:59", totalMarks: 100, lateSubmit: true
    });

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchCourses();
        fetchAssignments();
    }, []);

    useEffect(() => {
        if (selectedAssignment) fetchSubmissions(selectedAssignment);
    }, [selectedAssignment]);

    const fetchCourses = () => {
        apiClient.get("/api/lms/courses/")
            .then(res => setCourses(Array.isArray(res.data) ? res.data : (res.data.results || [])))
            .catch(err => console.error(err));
    };

    const fetchAssignments = () => {
        apiClient.get("/api/lms/assignments/")
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setAssignments(data);
            })
            .catch(err => console.error(err));
    };

    const fetchSubmissions = (assignmentId) => {
        apiClient.get(`/api/lms/assignment-submissions/?assignment=${assignmentId}`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setSubmissions(data);
            })
            .catch(console.error);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) setAttachmentFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) setAttachmentFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: "", text: "" });
        try {
            const payload = new FormData();
            payload.append("title", formData.title);
            payload.append("course", formData.course);
            payload.append("description", formData.description);
            payload.append("due_date", `${formData.dueDate}T${formData.dueTime}:00Z`);
            payload.append("total_marks", formData.totalMarks);
            payload.append("allow_late_submission", formData.lateSubmit);
            if (attachmentFile) payload.append("attachment", attachmentFile);

            await apiClient.post("/api/lms/assignments/", payload, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setMessage({ type: "success", text: "✅ Assignment published! Students have been notified." });
            setFormData({ title: "", course: "", description: "", dueDate: "", dueTime: "23:59", totalMarks: 100, lateSubmit: true });
            setAttachmentFile(null);
            fetchAssignments();
        } catch (err) {
            setMessage({ type: "error", text: "❌ Failed to create assignment." });
        } finally {
            setSubmitting(false);
        }
    };

    const handleGradeChange = (subId, field, value) => {
        setGrading(prev => ({ ...prev, [subId]: { ...prev[subId], [field]: value } }));
    };

    const submitGrade = async (subId) => {
        const { score, feedback } = grading[subId] || {};
        try {
            await apiClient.patch(`/api/lms/assignment-submissions/${subId}/`, {
                score: parseInt(score, 10),
                feedback: feedback || "",
                status: "GRADED"
            });
            setMessage({ type: "success", text: "Grade saved!" });
            fetchSubmissions(selectedAssignment);
        } catch {
            setMessage({ type: "error", text: "Failed to save grade." });
        }
    };

    const isPastDue = (dueDate) => new Date() > new Date(dueDate);

    return (
        <DashboardLayout user={user}>
            <div className="asgn-page">
                <div className="asgn-header">
                    <div>
                        <h1 className="asgn-title">Assignments</h1>
                        <p className="asgn-subtitle">Create assignments and grade student submissions</p>
                    </div>
                    <div className="asgn-tabs">
                        <button className={`asgn-tab ${activeTab === TABS.CREATE ? "active" : ""}`}
                            onClick={() => setActiveTab(TABS.CREATE)}>
                            <span className="material-icons-round">add_circle</span> Create
                        </button>
                        <button className={`asgn-tab ${activeTab === TABS.SUBMISSIONS ? "active" : ""}`}
                            onClick={() => { setActiveTab(TABS.SUBMISSIONS); }}>
                            <span className="material-icons-round">grading</span> Submissions
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`asgn-message ${message.type}`}>{message.text}</div>
                )}

                {activeTab === TABS.CREATE && (
                    <div className="asgn-card">
                        <form onSubmit={handleSubmit} className="asgn-form">
                            <div className="asgn-form-row">
                                <div className="asgn-form-group flex-2">
                                    <label>Assignment Title</label>
                                    <input className="asgn-input" name="title" placeholder="e.g. Midterm Report..."
                                        value={formData.title} onChange={handleInputChange} required />
                                </div>
                                <div className="asgn-form-group flex-1">
                                    <label>Course</label>
                                    <select className="asgn-input" name="course" value={formData.course}
                                        onChange={handleInputChange} required>
                                        <option value="">Select course</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="asgn-form-group">
                                <label>Instructions / Description</label>
                                <textarea className="asgn-input asgn-textarea" name="description"
                                    placeholder="Write detailed assignment instructions here..."
                                    value={formData.description} onChange={handleInputChange} required />
                            </div>

                            {/* File Drop Zone */}
                            <div className="asgn-form-group">
                                <label>Attachment (Optional — PDF, DOCX, ZIP, etc.)</label>
                                <div className="asgn-dropzone" onClick={() => fileInputRef.current.click()}
                                    onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                                    <input ref={fileInputRef} type="file" hidden
                                        accept=".pdf,.doc,.docx,.zip,.pptx,.xlsx,.txt"
                                        onChange={handleFileSelect} />
                                    {attachmentFile ? (
                                        <div className="asgn-file-selected">
                                            <span className="material-icons-round">insert_drive_file</span>
                                            <span>{attachmentFile.name}</span>
                                            <button type="button" className="asgn-remove-file"
                                                onClick={(e) => { e.stopPropagation(); setAttachmentFile(null); }}>
                                                <span className="material-icons-round">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="asgn-dropzone-hint">
                                            <span className="material-icons-round">cloud_upload</span>
                                            <p>Drag & drop or <u>click to browse</u></p>
                                            <span>PDF · DOCX · ZIP · PPTX · XLSX</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="asgn-form-row">
                                <div className="asgn-form-group flex-1">
                                    <label>Due Date</label>
                                    <input className="asgn-input" type="date" name="dueDate"
                                        value={formData.dueDate} onChange={handleInputChange} required />
                                </div>
                                <div className="asgn-form-group flex-1">
                                    <label>Due Time</label>
                                    <input className="asgn-input" type="time" name="dueTime"
                                        value={formData.dueTime} onChange={handleInputChange} required />
                                </div>
                                <div className="asgn-form-group flex-1">
                                    <label>Total Marks</label>
                                    <input className="asgn-input" type="number" name="totalMarks"
                                        value={formData.totalMarks} onChange={handleInputChange} min="1" />
                                </div>
                                <div className="asgn-form-group flex-1">
                                    <label>Allow Late Submission</label>
                                    <div className="asgn-toggle-row">
                                        <div className={`asgn-toggle ${formData.lateSubmit ? "on" : "off"}`}
                                            onClick={() => setFormData(p => ({ ...p, lateSubmit: !p.lateSubmit }))}>
                                            <div className="asgn-toggle-thumb" />
                                        </div>
                                        <span>{formData.lateSubmit ? "Allowed" : "Blocked"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="asgn-form-actions">
                                <button type="button" className="asgn-btn secondary"
                                    onClick={() => setFormData({ title: "", course: "", description: "", dueDate: "", dueTime: "23:59", totalMarks: 100, lateSubmit: true })}>
                                    Clear
                                </button>
                                <button type="submit" className="asgn-btn primary" disabled={submitting}>
                                    {submitting ? "Publishing..." : "Publish Assignment"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === TABS.SUBMISSIONS && (
                    <div className="asgn-two-col">
                        {/* Left: list of assignments */}
                        <div className="asgn-list-panel">
                            <h3 className="asgn-panel-title">Your Assignments</h3>
                            {assignments.length === 0 && <p className="asgn-empty">No assignments yet.</p>}
                            {assignments.map(a => (
                                <div key={a.id}
                                    className={`asgn-list-item ${selectedAssignment === a.id ? "selected" : ""} ${isPastDue(a.due_date) ? "past-due" : ""}`}
                                    onClick={() => setSelectedAssignment(a.id)}>
                                    <div className="asgn-item-title">{a.title}</div>
                                    <div className="asgn-item-meta">
                                        <span className="material-icons-round">schedule</span>
                                        {new Date(a.due_date).toLocaleString()}
                                        {isPastDue(a.due_date) && <span className="asgn-badge red">Closed</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Right: submissions for selected */}
                        <div className="asgn-sub-panel">
                            {!selectedAssignment ? (
                                <div className="asgn-empty-state">
                                    <span className="material-icons-round">assignment</span>
                                    <p>Select an assignment to view submissions</p>
                                </div>
                            ) : (
                                <>
                                    <h3 className="asgn-panel-title">
                                        Submissions ({submissions.length})
                                    </h3>
                                    {submissions.length === 0 && <p className="asgn-empty">No submissions yet.</p>}
                                    {submissions.map(sub => (
                                        <div key={sub.id} className="asgn-submission-card">
                                            <div className="asgn-sub-header">
                                                <div>
                                                    <div className="asgn-sub-name">{sub.student_name}</div>
                                                    <div className="asgn-sub-time">
                                                        Submitted: {new Date(sub.submitted_at).toLocaleString()}
                                                    </div>
                                                </div>
                                                <span className={`asgn-badge ${sub.status === "GRADED" ? "green" : sub.status === "LATE" ? "red" : "blue"}`}>
                                                    {sub.status}
                                                </span>
                                            </div>
                                            {sub.attachment && (
                                                <a href={`http://localhost:8000${sub.attachment}`}
                                                    target="_blank" rel="noreferrer" className="asgn-download-btn">
                                                    <span className="material-icons-round">download</span>
                                                    Download Submission
                                                </a>
                                            )}
                                            <div className="asgn-grade-row">
                                                <input className="asgn-input sm" type="number" placeholder="Score"
                                                    defaultValue={sub.score ?? ""}
                                                    onChange={(e) => handleGradeChange(sub.id, "score", e.target.value)} />
                                                <input className="asgn-input" placeholder="Feedback..."
                                                    defaultValue={sub.feedback ?? ""}
                                                    onChange={(e) => handleGradeChange(sub.id, "feedback", e.target.value)} />
                                                <button className="asgn-btn primary sm" onClick={() => submitGrade(sub.id)}>
                                                    Save Grade
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
