import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiClient } from "../api/client";
import "./TeacherLMS.css";

export default function TeacherAttendancePage() {
    const [user] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState({}); // { studentId: { status: 'PRESENT', remarks: '' } }
    const [search, setSearch] = useState("");

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

    useEffect(() => {
        if (selectedCourse) {
            // Fetch students for the selected course
            apiClient.get(`/api/users/?role=STUDENT&institute=${user.institute_id}`)
                .then(res => {
                    const list = Array.isArray(res.data) ? res.data : (res.data.results || []);
                    setStudents(list);
                    // Initialize attendance
                    const init = {};
                    list.forEach(s => init[s.id] = { status: 'PRESENT', remarks: '' });
                    setAttendance(init);
                })
                .catch(err => console.error("Error fetching students", err));
        }
    }, [selectedCourse, user.institute_id]);

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const handleRemarksChange = (studentId, remarks) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], remarks }
        }));
    };

    const markAll = (status) => {
        const next = { ...attendance };
        students.forEach(s => next[s.id] = { ...next[s.id], status });
        setAttendance(next);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // 1. Create/Find Record
            const recordRes = await apiClient.post("/api/lms/attendance/", {
                course: selectedCourse,
                date: date
            });
            // 2. Mark entries
            const entries = Object.keys(attendance).map(sid => ({
                student_id: sid,
                status: attendance[sid].status,
                remarks: attendance[sid].remarks
            }));
            await apiClient.post(`/api/lms/attendance/${recordRes.data.id}/mark_attendance/`, { entries });
            setMessage({ type: "success", text: "Attendance recorded successfully!" });
        } catch (err) {
            setMessage({ type: "error", text: "Failed to record attendance." });
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStudents = students.filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()));

    return (
        <DashboardLayout user={user}>
            <div className="lms-page-container" style={{ maxWidth: '1200px' }}>
                <h2 className="section-title">MARK ATTENDANCE</h2>
                <div className="title-divider"></div>

                <div className="attendance-controls">
                    <div className="form-group">
                        <label>Course:</label>
                        <div className="pill-input-wrapper">
                            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                                <option value="">Select Course</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Date:</label>
                        <div className="pill-input-wrapper">
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Search:</label>
                        <div className="pill-input-wrapper">
                            <input placeholder="Student name..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                        <label>Bulk:</label>
                        <div className="bulk-actions">
                            <button className="bulk-btn all-p" onClick={() => markAll('PRESENT')}>All P</button>
                            <button className="bulk-btn all-a" onClick={() => markAll('ABSENT')}>All A</button>
                        </div>
                    </div>
                </div>

                {selectedCourse ? (
                    <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <table className="dashboard-table" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>ID</th>
                                    <th style={{ textAlign: 'center' }}>Present</th>
                                    <th style={{ textAlign: 'center' }}>Absent</th>
                                    <th style={{ textAlign: 'center' }}>Late</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.full_name}</td>
                                        <td>{s.email.split('@')[0].toUpperCase()}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input type="radio" className="status-radio present" checked={attendance[s.id]?.status === 'PRESENT'} onChange={() => handleStatusChange(s.id, 'PRESENT')} />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input type="radio" className="status-radio absent" checked={attendance[s.id]?.status === 'ABSENT'} onChange={() => handleStatusChange(s.id, 'ABSENT')} />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <input type="radio" className="status-radio late" checked={attendance[s.id]?.status === 'LATE'} onChange={() => handleStatusChange(s.id, 'LATE')} />
                                        </td>
                                        <td>
                                            <div className="pill-input-wrapper" style={{ padding: '0 10px', height: '35px' }}>
                                                <input placeholder="Remarks..." value={attendance[s.id]?.remarks || ""} onChange={(e) => handleRemarksChange(s.id, e.target.value)} style={{ fontSize: '0.8rem' }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="dashboard-card" style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
                        <span className="material-icons-round" style={{ fontSize: '3rem', marginBottom: '15px' }}>event_note</span>
                        <h3>Please select a course to mark attendance</h3>
                    </div>
                )}

                <div className="form-actions" style={{ marginTop: '30px', gap: '15px' }}>
                    <button className="pill-submit-btn secondary" style={{ width: '150px' }}>Export ▼</button>
                    <button className="pill-submit-btn secondary" style={{ width: '150px', backgroundColor: '#e0f2fe', color: '#0369a1', borderColor: 'transparent' }}>Save</button>
                    <button className="pill-submit-btn primary" style={{ width: '200px' }} onClick={handleSubmit} disabled={submitting || !selectedCourse}>
                        {submitting ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
