import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { apiClient } from "../../api/client";
import "./AdminCourse.css";

export default function EnrollStudentPage() {
    const [user] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        // Fetch courses
        apiClient.get("/api/lms/courses/")
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setCourses(data);
            })
            .catch(err => console.error(err));

        // Fetch students
        apiClient.get(`/api/users/?role=STUDENT&institute=${user.institute_id}`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setStudents(data);
            })
            .catch(err => console.error(err));
    }, [user.institute_id]);

    const toggleEnrollment = async (studentId, isEnrolled) => {
        if (!selectedCourse) {
            setMessage({ type: "error", text: "Please select a course first." });
            return;
        }

        setSubmitting(true);
        try {
            const course = courses.find(c => c.id === parseInt(selectedCourse));
            let updatedStudents = [...course.students];

            if (isEnrolled) {
                updatedStudents = updatedStudents.filter(id => id !== studentId);
            } else {
                updatedStudents.push(studentId);
            }

            await apiClient.patch(`/api/lms/courses/${selectedCourse}/`, {
                students: updatedStudents
            });

            // Update local state
            setCourses(courses.map(c => c.id === parseInt(selectedCourse) ? { ...c, students: updatedStudents } : c));
            setMessage({ type: "success", text: isEnrolled ? "Student removed." : "Student enrolled!" });
        } catch (err) {
            setMessage({ type: "error", text: "Action failed." });
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    const selectedCourseObj = courses.find(c => c.id === parseInt(selectedCourse));

    return (
        <DashboardLayout user={user}>
            <div className="lms-page-container">
                <h2 className="section-title">ENROLL STUDENTS</h2>
                <div className="title-divider"></div>

                <div className="attendance-controls" style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
                    <div className="form-group flex-1">
                        <label>Select Course:</label>
                        <div className="pill-input-wrapper">
                            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                                <option value="">Choose a course...</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group flex-1">
                        <label>Search Students:</label>
                        <div className="pill-input-wrapper">
                            <input placeholder="Name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>

                {message.text && (
                    <div className={`pill-error-msg ${message.type === 'success' ? 'success-msg' : ''}`} style={{ marginBottom: '20px' }}>
                        {message.text}
                    </div>
                )}

                {selectedCourse ? (
                    <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(s => {
                                    const isEnrolled = selectedCourseObj?.students.includes(s.id);
                                    return (
                                        <tr key={s.id}>
                                            <td style={{ fontWeight: 700 }}>{s.full_name}</td>
                                            <td>{s.email}</td>
                                            <td>
                                                <span style={{
                                                    color: isEnrolled ? '#4caf50' : '#94a3b8',
                                                    fontWeight: 800,
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {isEnrolled ? 'Enrolled' : 'Not Enrolled'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    className={`pill-submit-btn ${isEnrolled ? 'secondary' : 'primary'}`}
                                                    style={{ padding: '5px 15px', fontSize: '0.75rem', height: '35px', width: '100px' }}
                                                    onClick={() => toggleEnrollment(s.id, isEnrolled)}
                                                    disabled={submitting}
                                                >
                                                    {isEnrolled ? 'REMOVE' : 'ENROLL'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="dashboard-card" style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
                        <span className="material-icons-round" style={{ fontSize: '3rem', marginBottom: '10px' }}>person_add</span>
                        <h3>Select a course to manage enrollment</h3>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
