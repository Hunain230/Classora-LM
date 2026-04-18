import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiClient } from "../api/client";
import "./AssignmentsPage.css";

export default function StudentAssignmentsPage() {
    const [user] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [mySubmissions, setMySubmissions] = useState({}); // { [assignmentId]: submission }
    const [uploading, setUploading] = useState({});
    const [selectedFiles, setSelectedFiles] = useState({});
    const [message, setMessage] = useState({ type: "", text: "" });
    const fileRefs = useRef({});

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [asgRes, subRes, crsRes] = await Promise.all([
                apiClient.get("/api/lms/assignments/"),
                apiClient.get("/api/lms/assignment-submissions/"),
                apiClient.get("/api/lms/courses/"),
            ]);
            const asgnData = Array.isArray(asgRes.data) ? asgRes.data : (asgRes.data.results || []);
            const subData = Array.isArray(subRes.data) ? subRes.data : (subRes.data.results || []);
            const crsData = Array.isArray(crsRes.data) ? crsRes.data : (crsRes.data.results || []);

            setAssignments(asgnData);
            setCourses(crsData);

            // Map submissions by assignment id for quick lookup
            const subMap = {};
            subData.forEach(s => { subMap[s.assignment] = s; });
            setMySubmissions(subMap);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileSelect = (assignmentId, file) => {
        setSelectedFiles(prev => ({ ...prev, [assignmentId]: file }));
    };

    const handleSubmit = async (assignment) => {
        const file = selectedFiles[assignment.id];
        if (!file) {
            setMessage({ type: "error", text: "Please select a file to submit." });
            return;
        }

        setUploading(prev => ({ ...prev, [assignment.id]: true }));
        setMessage({ type: "", text: "" });

        try {
            const payload = new FormData();
            payload.append("assignment", assignment.id);
            payload.append("attachment", file);

            await apiClient.post("/api/lms/assignment-submissions/", payload, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setMessage({ type: "success", text: `✅ "${assignment.title}" submitted successfully!` });
            setSelectedFiles(prev => ({ ...prev, [assignment.id]: null }));
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

    const isPastDue = (dueDate) => new Date() > new Date(dueDate);
    const timeLeft = (dueDate) => {
        const diff = new Date(dueDate) - new Date();
        if (diff <= 0) return null;
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d ${hours % 24}h left`;
        return `${hours}h left`;
    };

    // Group assignments by course
    const assignmentsByCourse = {};
    assignments.forEach(a => {
        if (!assignmentsByCourse[a.course]) assignmentsByCourse[a.course] = [];
        assignmentsByCourse[a.course].push(a);
    });

    const getCardClass = (a) => {
        const sub = mySubmissions[a.id];
        if (!sub) return isPastDue(a.due_date) ? "late" : "open";
        if (sub.status === "GRADED") return "graded";
        return "submitted";
    };

    const getStatusBadge = (a) => {
        const sub = mySubmissions[a.id];
        if (!sub) return isPastDue(a.due_date)
            ? <span className="asgn-badge red">Missing</span>
            : <span className="asgn-badge blue">Open</span>;
        if (sub.status === "GRADED") return <span className="asgn-badge green">Graded</span>;
        if (sub.status === "LATE") return <span className="asgn-badge red">Late Submitted</span>;
        return <span className="asgn-badge amber">Submitted</span>;
    };

    return (
        <DashboardLayout user={user}>
            <div className="asgn-page">
                <div className="asgn-header">
                    <div>
                        <h1 className="asgn-title">My Assignments</h1>
                        <p className="asgn-subtitle">View, download, and submit your assignments</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span className="asgn-badge blue">Open: {assignments.filter(a => !mySubmissions[a.id] && !isPastDue(a.due_date)).length}</span>
                        <span className="asgn-badge amber">Submitted: {Object.keys(mySubmissions).length}</span>
                        <span className="asgn-badge red">Missing: {assignments.filter(a => !mySubmissions[a.id] && isPastDue(a.due_date)).length}</span>
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
                                <span className="asgn-course-code">{course?.code}</span>
                            </div>

                            {asgns.map(a => {
                                const sub = mySubmissions[a.id];
                                const past = isPastDue(a.due_date);
                                const canSubmit = !sub && (!past || a.allow_late_submission);

                                return (
                                    <div key={a.id} className={`asgn-student-card ${getCardClass(a)}`}>
                                        <div className="asgn-card-top">
                                            <div>
                                                <div className="asgn-card-title">{a.title}</div>
                                                <div className="asgn-card-due">
                                                    <span className="material-icons-round" style={{ fontSize: 14 }}>schedule</span>
                                                    &nbsp;Due: {new Date(a.due_date).toLocaleString()}
                                                    {timeLeft(a.due_date) && (
                                                        <span style={{ color: '#f59e0b', fontWeight: 700, marginLeft: 8 }}>
                                                            ⏱ {timeLeft(a.due_date)}
                                                        </span>
                                                    )}
                                                    &nbsp;· Total: {a.total_marks} marks
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {getStatusBadge(a)}
                                            </div>
                                        </div>

                                        <p className="asgn-card-desc">{a.description}</p>

                                        {/* Teacher's attachment */}
                                        {a.attachment && (
                                            <a href={`http://localhost:8000${a.attachment}`}
                                                target="_blank" rel="noreferrer" className="asgn-teacher-attach">
                                                <span className="material-icons-round" style={{ fontSize: 16 }}>attach_file</span>
                                                Download Assignment File
                                            </a>
                                        )}

                                        {/* Already submitted -> show what they submitted */}
                                        {sub && (
                                            <div style={{ marginBottom: 12 }}>
                                                {sub.attachment && (
                                                    <a href={`http://localhost:8000${sub.attachment}`}
                                                        target="_blank" rel="noreferrer" className="asgn-download-btn">
                                                        <span className="material-icons-round">download</span>
                                                        View My Submission
                                                    </a>
                                                )}
                                                {sub.status === "GRADED" && (
                                                    <div className="asgn-grade-display">
                                                        <span className="asgn-grade-pill">
                                                            {sub.score}/{a.total_marks}
                                                        </span>
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
                                            <div className="asgn-submit-zone">
                                                <label className="asgn-submit-label">
                                                    <span className="material-icons-round" style={{ fontSize: 18 }}>upload_file</span>
                                                    {selectedFiles[a.id] ? selectedFiles[a.id].name : "Choose File"}
                                                    <input type="file" hidden
                                                        accept=".pdf,.doc,.docx,.zip,.pptx,.txt"
                                                        onChange={(e) => handleFileSelect(a.id, e.target.files[0])} />
                                                </label>
                                                <button className="asgn-btn primary sm"
                                                    disabled={uploading[a.id] || !selectedFiles[a.id]}
                                                    onClick={() => handleSubmit(a)}>
                                                    {uploading[a.id] ? "Uploading..." : "Submit"}
                                                </button>
                                                {past && a.allow_late_submission && (
                                                    <span className="asgn-badge red">⚠ Late Submission</span>
                                                )}
                                            </div>
                                        )}

                                        {!canSubmit && !sub && (
                                            <div className="asgn-badge red" style={{ display: 'inline-block', marginTop: 8 }}>
                                                ❌ Submission closed
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
