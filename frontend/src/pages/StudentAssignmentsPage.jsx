import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiClient } from "../api/client";
import "./AssignmentsPage.css";

const BACKEND = "http://localhost:8000";

function openFile(url) {
    if (!url) return;
    const href = url.startsWith("http") ? url : `${BACKEND}${url.startsWith("/") ? "" : "/media/"}${url}`;
    window.open(href, "_blank", "noopener,noreferrer");
}

const STATUS_ORDER = { open: 0, late_open: 1, submitted: 2, graded: 3, closed: 4 };

export default function StudentAssignmentsPage() {
    const [user] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [mySubmissions, setMySubmissions] = useState({});
    const [uploading, setUploading] = useState({});
    const [selectedFiles, setSelectedFiles] = useState({});
    const [linkInputs, setLinkInputs] = useState({});   // { [aId]: {label, url} }
    const [subLinks, setSubLinks] = useState({});        // { [aId]: [{label, url}] }
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [asgRes, subRes, crsRes] = await Promise.all([
                apiClient.get("/api/lms/assignments/"),
                apiClient.get("/api/lms/assignment-submissions/"),
                apiClient.get("/api/lms/courses/"),
            ]);
            const asgnData = Array.isArray(asgRes.data) ? asgRes.data : (asgRes.data.results || []);
            const subData  = Array.isArray(subRes.data) ? subRes.data : (subRes.data.results || []);
            const crsData  = Array.isArray(crsRes.data) ? crsRes.data : (crsRes.data.results || []);
            setAssignments(asgnData);
            setCourses(crsData);
            const subMap = {};
            subData.forEach(s => { subMap[s.assignment] = s; });
            setMySubmissions(subMap);
        } catch (err) { console.error(err); }
    };

    const isPastDue = (d) => new Date() > new Date(d);

    const timeLeft = (dueDate) => {
        const diff = new Date(dueDate) - new Date();
        if (diff <= 0) return null;
        const h = Math.floor(diff / 3600000);
        const d = Math.floor(h / 24);
        return d > 0 ? `${d}d ${h % 24}h left` : `${h}h left`;
    };

    // Determine card state for sorting & styling
    const getState = (a) => {
        const sub = mySubmissions[a.id];
        const past = isPastDue(a.due_date);
        if (sub?.status === "GRADED") return "graded";
        if (sub) return "submitted";
        if (!past) return "open";
        if (a.allow_late_submission) return "late_open";
        return "closed";
    };

    const getCardClass = (a) => {
        const s = getState(a);
        if (s === "open" || s === "late_open") return "open";
        if (s === "submitted") return "submitted";
        if (s === "graded") return "graded";
        return "late";
    };

    const getStatusBadge = (a) => {
        const s = getState(a);
        const map = {
            open:      <span className="asgn-badge blue">Open</span>,
            late_open: <span className="asgn-badge red">⚠ Late — Still Open</span>,
            submitted: <span className="asgn-badge amber">Submitted</span>,
            graded:    <span className="asgn-badge green">Graded</span>,
            closed:    <span className="asgn-badge red">Closed</span>,
        };
        return map[s] || null;
    };

    const addSubLink = (aId) => {
        const inp = linkInputs[aId] || {};
        if (!inp.url) return;
        const label = inp.label || inp.url;
        setSubLinks(prev => ({ ...prev, [aId]: [...(prev[aId] || []), { label, url: inp.url }] }));
        setLinkInputs(prev => ({ ...prev, [aId]: { label: "", url: "" } }));
    };
    const removeSubLink = (aId, idx) =>
        setSubLinks(prev => ({ ...prev, [aId]: (prev[aId] || []).filter((_, i) => i !== idx) }));

    const handleSubmit = async (assignment) => {
        const file = selectedFiles[assignment.id];
        const links = subLinks[assignment.id] || [];
        if (!file && links.length === 0) {
            setMessage({ type: "error", text: "Please attach a file or add a link to submit." });
            return;
        }
        setUploading(prev => ({ ...prev, [assignment.id]: true }));
        setMessage({ type: "", text: "" });
        try {
            const payload = new FormData();
            payload.append("assignment", assignment.id);
            if (file) payload.append("attachment", file);
            payload.append("links", JSON.stringify(links));
            await apiClient.post("/api/lms/assignment-submissions/", payload, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setMessage({ type: "success", text: `✅ "${assignment.title}" submitted successfully!` });
            setSelectedFiles(prev => ({ ...prev, [assignment.id]: null }));
            setSubLinks(prev => ({ ...prev, [assignment.id]: [] }));
            fetchAll();
        } catch (err) {
            const detail = err?.response?.data;
            if (detail && JSON.stringify(detail).includes("unique")) {
                setMessage({ type: "error", text: "You have already submitted this assignment." });
            } else {
                setMessage({ type: "error", text: "❌ Submission failed. Please try again." });
            }
        } finally {
            setUploading(prev => ({ ...prev, [assignment.id]: false }));
        }
    };

    // Group by course, sort within each group: open first
    const assignmentsByCourse = {};
    [...assignments]
        .sort((a, b) => STATUS_ORDER[getState(a)] - STATUS_ORDER[getState(b)])
        .forEach(a => {
            if (!assignmentsByCourse[a.course]) assignmentsByCourse[a.course] = [];
            assignmentsByCourse[a.course].push(a);
        });

    const openCount = assignments.filter(a => ["open","late_open"].includes(getState(a))).length;
    const subCount  = Object.keys(mySubmissions).length;
    const missCount = assignments.filter(a => getState(a) === "closed").length;

    return (
        <DashboardLayout user={user}>
            <div className="asgn-page">
                <div className="asgn-header">
                    <div>
                        <h1 className="asgn-title">My Assignments</h1>
                        <p className="asgn-subtitle">View, download, and submit your assignments</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="asgn-badge blue" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Open: {openCount}</span>
                        <span className="asgn-badge amber" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Submitted: {subCount}</span>
                        <span className="asgn-badge red" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Missing: {missCount}</span>
                    </div>
                </div>

                {message.text && (
                    <div className={`asgn-message ${message.type}`}>{message.text}</div>
                )}

                {assignments.length === 0 && (
                    <div className="asgn-empty-state" style={{ marginTop: '60px' }}>
                        <span className="material-icons-round">assignment</span>
                        <p>No assignments yet. Check back later!</p>
                    </div>
                )}

                {Object.entries(assignmentsByCourse).map(([courseId, asgns]) => {
                    const course = courses.find(c => c.id === parseInt(courseId));
                    return (
                        <div key={courseId} className="asgn-course-section">
                            <div className="asgn-course-header">
                                <span className="asgn-course-name">{course?.name || "Course"}</span>
                                {course?.code && <span className="asgn-course-code">{course.code}</span>}
                            </div>

                            {asgns.map(a => {
                                const sub = mySubmissions[a.id];
                                const state = getState(a);
                                const canSubmit = state === "open" || state === "late_open";
                                const tLeft = timeLeft(a.due_date);
                                const linkInp = linkInputs[a.id] || { label: "", url: "" };
                                const myLinks = subLinks[a.id] || [];

                                return (
                                    <div key={a.id} className={`asgn-student-card ${getCardClass(a)}`}>
                                        <div className="asgn-card-top">
                                            <div>
                                                <div className="asgn-card-title">{a.title}</div>
                                                <div className="asgn-card-due">
                                                    <span className="material-icons-round" style={{ fontSize: 14 }}>schedule</span>
                                                    &nbsp;Due: {new Date(a.due_date).toLocaleString()}
                                                    {tLeft && (
                                                        <span style={{ color: state === "late_open" ? '#ef4444' : '#f59e0b', fontWeight: 700, marginLeft: 10 }}>
                                                            ⏱ {tLeft}
                                                        </span>
                                                    )}
                                                    &nbsp;· {a.total_marks} marks
                                                </div>
                                            </div>
                                            {getStatusBadge(a)}
                                        </div>

                                        <p className="asgn-card-desc">{a.description}</p>

                                        {/* Teacher's attachment */}
                                        {(a.attachment_url || a.attachment) && (
                                            <button className="asgn-download-btn"
                                                onClick={() => openFile(a.attachment_url || a.attachment)}>
                                                <span className="material-icons-round">open_in_new</span>
                                                Open Assignment File
                                            </button>
                                        )}

                                        {/* Teacher's links */}
                                        {a.links?.length > 0 && (
                                            <div className="asgn-links-list">
                                                {a.links.map((lk, i) => (
                                                    <a key={i} href={lk.url} target="_blank" rel="noreferrer" className="asgn-link-chip">
                                                        <span className="material-icons-round" style={{ fontSize: 14 }}>link</span>
                                                        {lk.label}
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        {/* Already submitted → show their file + grade */}
                                        {sub && (
                                            <div className="asgn-sub-result">
                                                {(sub.attachment_url || sub.attachment) && (
                                                    <button className="asgn-download-btn"
                                                        onClick={() => openFile(sub.attachment_url || sub.attachment)}>
                                                        <span className="material-icons-round">open_in_new</span>
                                                        View My Submission File
                                                    </button>
                                                )}
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
                                                {sub.status === "GRADED" && (
                                                    <div className="asgn-grade-display">
                                                        <span className="asgn-grade-pill">{sub.score}/{a.total_marks}</span>
                                                        {sub.feedback && (
                                                            <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                                                                💬 {sub.feedback}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Submit zone */}
                                        {canSubmit && (
                                            <div className="asgn-submit-section">
                                                <div className="asgn-submit-zone">
                                                    <label className="asgn-submit-label">
                                                        <span className="material-icons-round" style={{ fontSize: 18 }}>upload_file</span>
                                                        {selectedFiles[a.id] ? selectedFiles[a.id].name : "Attach File"}
                                                        <input type="file" hidden
                                                            accept=".pdf,.doc,.docx,.zip,.pptx,.txt,.png,.jpg"
                                                            onChange={(e) => setSelectedFiles(p => ({ ...p, [a.id]: e.target.files[0] }))} />
                                                    </label>
                                                    {selectedFiles[a.id] && (
                                                        <button className="asgn-remove-file"
                                                            onClick={() => setSelectedFiles(p => ({ ...p, [a.id]: null }))}>
                                                            <span className="material-icons-round">close</span>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Link submission */}
                                                <div className="asgn-link-row" style={{ marginTop: 10 }}>
                                                    <input className="asgn-input" placeholder="Link label (optional)"
                                                        value={linkInp.label}
                                                        onChange={(e) => setLinkInputs(p => ({ ...p, [a.id]: { ...linkInp, label: e.target.value } }))} />
                                                    <input className="asgn-input flex-2" placeholder="Paste Google Drive / Docs link..."
                                                        value={linkInp.url}
                                                        onChange={(e) => setLinkInputs(p => ({ ...p, [a.id]: { ...linkInp, url: e.target.value } }))} />
                                                    <button type="button" className="asgn-btn secondary sm" onClick={() => addSubLink(a.id)}>
                                                        + Add Link
                                                    </button>
                                                </div>
                                                {myLinks.map((lk, i) => (
                                                    <div key={i} className="asgn-link-chip">
                                                        <span className="material-icons-round" style={{ fontSize: 14 }}>link</span>
                                                        <span>{lk.label}</span>
                                                        <button onClick={() => removeSubLink(a.id, i)}>
                                                            <span className="material-icons-round">close</span>
                                                        </button>
                                                    </div>
                                                ))}

                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                                                    <button className="asgn-btn primary"
                                                        disabled={uploading[a.id] || (!selectedFiles[a.id] && myLinks.length === 0)}
                                                        onClick={() => handleSubmit(a)}>
                                                        {uploading[a.id] ? "Uploading..." : "Submit Assignment"}
                                                    </button>
                                                    {state === "late_open" && (
                                                        <span className="asgn-badge red">⚠ Will be marked LATE</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {state === "closed" && !sub && (
                                            <div className="asgn-badge red" style={{ display: 'inline-block', marginTop: 12 }}>
                                                ❌ Deadline passed — submissions closed
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </DashboardLayout>
    );
}
