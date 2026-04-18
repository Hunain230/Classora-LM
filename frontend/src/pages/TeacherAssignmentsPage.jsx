import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiClient } from "../api/client";
import "./AssignmentsPage.css";

const TABS = { CREATE: "create", SUBMISSIONS: "submissions" };

const BACKEND = "http://localhost:8000";

// Opens a file URL safely — uses absolute URL from backend
function openFile(url) {
    if (!url) return;
    // If already absolute, use directly; otherwise prefix backend
    const href = url.startsWith("http") ? url : `${BACKEND}${url.startsWith("/") ? "" : "/media/"}${url}`;
    window.open(href, "_blank", "noopener,noreferrer");
}

export default function TeacherAssignmentsPage() {
    const [user] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
    const [activeTab, setActiveTab] = useState(TABS.CREATE);
    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [grading, setGrading] = useState({});
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [links, setLinks] = useState([]);          // [{label, url}]
    const [linkInput, setLinkInput] = useState({ label: "", url: "" });
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

    const fetchCourses = () =>
        apiClient.get("/api/lms/courses/")
            .then(res => setCourses(Array.isArray(res.data) ? res.data : (res.data.results || [])))
            .catch(console.error);

    const fetchAssignments = () =>
        apiClient.get("/api/lms/assignments/")
            .then(res => setAssignments(Array.isArray(res.data) ? res.data : (res.data.results || [])))
            .catch(console.error);

    const fetchSubmissions = (id) =>
        apiClient.get(`/api/lms/assignment-submissions/?assignment=${id}`)
            .then(res => setSubmissions(Array.isArray(res.data) ? res.data : (res.data.results || [])))
            .catch(console.error);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    // Link management
    const addLink = () => {
        if (!linkInput.url) return;
        const label = linkInput.label || linkInput.url;
        setLinks(prev => [...prev, { label, url: linkInput.url }]);
        setLinkInput({ label: "", url: "" });
    };
    const removeLink = (idx) => setLinks(prev => prev.filter((_, i) => i !== idx));

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
            payload.append("links", JSON.stringify(links));
            if (attachmentFile) payload.append("attachment", attachmentFile);

            await apiClient.post("/api/lms/assignments/", payload, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setMessage({ type: "success", text: "✅ Assignment published! Enrolled students have been notified." });
            setFormData({ title: "", course: "", description: "", dueDate: "", dueTime: "23:59", totalMarks: 100, lateSubmit: true });
            setAttachmentFile(null);
            setLinks([]);
            fetchAssignments();
        } catch (err) {
            setMessage({ type: "error", text: "❌ Failed to create assignment. " + (err?.response?.data ? JSON.stringify(err.response.data) : "") });
        } finally {
            setSubmitting(false);
        }
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

    const isPastDue = (d) => new Date() > new Date(d);

    const selectedAsgn = assignments.find(a => a.id === selectedAssignment);

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
                            onClick={() => setActiveTab(TABS.SUBMISSIONS)}>
                            <span className="material-icons-round">grading</span> Submissions ({assignments.length})
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`asgn-message ${message.type}`}>{message.text}</div>
                )}

                {/* ── CREATE TAB ── */}
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

                            {/* File Attach */}
                            <div className="asgn-form-group">
                                <label>Attach File (PDF, DOCX, ZIP, PPTX…)</label>
                                <div className="asgn-dropzone"
                                    onClick={() => fileInputRef.current.click()}
                                    onDrop={(e) => { e.preventDefault(); setAttachmentFile(e.dataTransfer.files[0]); }}
                                    onDragOver={(e) => e.preventDefault()}>
                                    <input ref={fileInputRef} type="file" hidden
                                        accept=".pdf,.doc,.docx,.zip,.pptx,.xlsx,.txt,.png,.jpg"
                                        onChange={(e) => setAttachmentFile(e.target.files[0])} />
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
                                            <span>PDF · DOCX · ZIP · PPTX · XLSX · Images</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* External Links */}
                            <div className="asgn-form-group">
                                <label>Attach Links (Google Drive, Slides, Videos…)</label>
                                <div className="asgn-link-row">
                                    <input className="asgn-input flex-1" placeholder="Label (e.g. 'Lecture Slides')"
                                        value={linkInput.label}
                                        onChange={(e) => setLinkInput(p => ({ ...p, label: e.target.value }))} />
                                    <input className="asgn-input flex-2" placeholder="https://..."
                                        value={linkInput.url}
                                        onChange={(e) => setLinkInput(p => ({ ...p, url: e.target.value }))} />
                                    <button type="button" className="asgn-btn primary sm" onClick={addLink}>
                                        <span className="material-icons-round">add</span>
                                    </button>
                                </div>
                                {links.map((lk, i) => (
                                    <div key={i} className="asgn-link-chip">
                                        <span className="material-icons-round" style={{ fontSize: 15 }}>link</span>
                                        <a href={lk.url} target="_blank" rel="noreferrer">{lk.label}</a>
                                        <button type="button" onClick={() => removeLink(i)}>
                                            <span className="material-icons-round">close</span>
                                        </button>
                                    </div>
                                ))}
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
                                    onClick={() => { setFormData({ title: "", course: "", description: "", dueDate: "", dueTime: "23:59", totalMarks: 100, lateSubmit: true }); setAttachmentFile(null); setLinks([]); }}>
                                    Clear
                                </button>
                                <button type="submit" className="asgn-btn primary" disabled={submitting}>
                                    {submitting ? "Publishing..." : "Publish Assignment"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── SUBMISSIONS TAB ── */}
                {activeTab === TABS.SUBMISSIONS && (
                    <div className="asgn-two-col">
                        <div className="asgn-list-panel">
                            <h3 className="asgn-panel-title">Your Assignments</h3>
                            {assignments.length === 0 && <p className="asgn-empty">No assignments yet.</p>}
                            {[...assignments].sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).map(a => (
                                <div key={a.id}
                                    className={`asgn-list-item ${selectedAssignment === a.id ? "selected" : ""} ${isPastDue(a.due_date) ? "past-due" : ""}`}
                                    onClick={() => setSelectedAssignment(a.id)}>
                                    <div className="asgn-item-title">{a.title}</div>
                                    <div className="asgn-item-meta">
                                        <span className="material-icons-round">schedule</span>
                                        {new Date(a.due_date).toLocaleDateString()}
                                        {isPastDue(a.due_date)
                                            ? <span className="asgn-badge red">Closed</span>
                                            : <span className="asgn-badge blue">Open</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="asgn-sub-panel">
                            {!selectedAssignment ? (
                                <div className="asgn-empty-state">
                                    <span className="material-icons-round">assignment</span>
                                    <p>Select an assignment to view submissions</p>
                                </div>
                            ) : (
                                <>
                                    <div className="asgn-sub-panel-header">
                                        <h3 className="asgn-panel-title">{selectedAsgn?.title}</h3>
                                        <span className="asgn-badge blue">{submissions.length} Submissions</span>
                                    </div>

                                    {submissions.length === 0 && <p className="asgn-empty">No submissions yet.</p>}
                                    {submissions.map(sub => (
                                        <div key={sub.id} className="asgn-submission-card">
                                            <div className="asgn-sub-header">
                                                <div>
                                                    <div className="asgn-sub-name">{sub.student_name}</div>
                                                    <div className="asgn-sub-time">
                                                        {new Date(sub.submitted_at).toLocaleString()}
                                                    </div>
                                                </div>
                                                <span className={`asgn-badge ${sub.status === "GRADED" ? "green" : sub.status === "LATE" ? "red" : "blue"}`}>
                                                    {sub.status.replace("_", " ")}
                                                </span>
                                            </div>

                                            {/* Student's file */}
                                            {(sub.attachment_url || sub.attachment) && (
                                                <button className="asgn-download-btn"
                                                    onClick={() => openFile(sub.attachment_url || sub.attachment)}>
                                                    <span className="material-icons-round">open_in_new</span>
                                                    Open Submission File
                                                </button>
                                            )}

                                            {/* Student's links */}
                                            {sub.links?.length > 0 && (
                                                <div className="asgn-links-list">
                                                    {sub.links.map((lk, i) => (
                                                        <a key={i} href={lk.url} target="_blank" rel="noreferrer" className="asgn-link-chip">
                                                            <span className="material-icons-round" style={{ fontSize: 14 }}>link</span>
                                                            {lk.label}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Grade */}
                                            <div className="asgn-grade-row">
                                                <input className="asgn-input sm" type="number"
                                                    placeholder={`/ ${selectedAsgn?.total_marks ?? "?"}`}
                                                    defaultValue={sub.score ?? ""}
                                                    onChange={(e) => setGrading(p => ({ ...p, [sub.id]: { ...p[sub.id], score: e.target.value } }))} />
                                                <input className="asgn-input" placeholder="Feedback to student..."
                                                    defaultValue={sub.feedback ?? ""}
                                                    onChange={(e) => setGrading(p => ({ ...p, [sub.id]: { ...p[sub.id], feedback: e.target.value } }))} />
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
