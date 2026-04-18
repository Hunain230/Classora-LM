import React from 'react';
import CreateCoursePage from './admin/CreateCoursePage';
import { apiClient } from '../api/client';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const BACKEND = "http://localhost:8000";
function openFile(url) {
    if (!url) return;
    const href = url.startsWith("http") ? url : `${BACKEND}${url.startsWith("/") ? "" : "/media/"}${url}`;
    window.open(href, "_blank", "noopener,noreferrer");
}

export default function CoursesPage() {
    const user = JSON.parse(localStorage.getItem("current_user") || "{}");
    const navigate = useNavigate();
    const [courses, setCourses] = React.useState([]);
    const [assignments, setAssignments] = React.useState([]);
    const [mySubmissions, setMySubmissions] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    const [selectedCourse, setSelectedCourse] = React.useState(null);

    React.useEffect(() => {
        if (user.role && user.role !== 'ADMIN') {
            Promise.all([
                apiClient.get("/api/lms/courses/"),
                apiClient.get("/api/lms/assignments/"),
                user.role === 'STUDENT' ? apiClient.get("/api/lms/assignment-submissions/") : Promise.resolve({ data: [] }),
            ]).then(([crsRes, asgRes, subRes]) => {
                setCourses(Array.isArray(crsRes.data) ? crsRes.data : (crsRes.data.results || []));
                setAssignments(Array.isArray(asgRes.data) ? asgRes.data : (asgRes.data.results || []));
                const subData = Array.isArray(subRes.data) ? subRes.data : (subRes.data.results || []);
                const subMap = {};
                subData.forEach(s => { subMap[s.assignment] = s; });
                setMySubmissions(subMap);
            }).catch(console.error).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user.role]);

    if (user.role === 'ADMIN') return <CreateCoursePage />;
    if (loading) return (
        <DashboardLayout user={user}>
            <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
        </DashboardLayout>
    );

    const courseAssignments = (courseId) =>
        assignments
            .filter(a => a.course === courseId)
            .sort((a, b) => {
                // open first
                const isOpenA = !mySubmissions[a.id] && new Date() < new Date(a.due_date);
                const isOpenB = !mySubmissions[b.id] && new Date() < new Date(b.due_date);
                return isOpenB - isOpenA;
            });

    const coursePendingCount = (courseId) =>
        courseAssignments(courseId).filter(a =>
            !mySubmissions[a.id] && new Date() < new Date(a.due_date)
        ).length;

    return (
        <DashboardLayout user={user}>
            <div style={{ padding: '32px 40px', fontFamily: "'Inter', sans-serif" }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', margin: '0 0 6px' }}>
                    {user.role === 'TEACHER' ? 'My Courses' : 'Enrolled Courses'}
                </h1>
                <p style={{ color: '#64748b', margin: '0 0 32px' }}>
                    {courses.length} course{courses.length !== 1 ? 's' : ''} · click a course to view its stream
                </p>

                {courses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
                        <span className="material-icons-round" style={{ fontSize: '4rem' }}>import_contacts</span>
                        <h3>No courses found.</h3>
                        <p>You haven't been assigned or enrolled in any courses yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: selectedCourse ? '300px 1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', alignItems: 'start', transition: 'all 0.3s' }}>

                        {/* Course Cards */}
                        <div style={{ display: 'contents' }}>
                            {!selectedCourse && courses.map(c => {
                                const pending = coursePendingCount(c.id);
                                return (
                                    <div key={c.id}
                                        onClick={() => setSelectedCourse(c)}
                                        style={{
                                            background: 'white', borderRadius: '20px', padding: '28px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)', cursor: 'pointer',
                                            border: '2px solid transparent', transition: 'all 0.2s',
                                            ':hover': { borderColor: '#2196F3' }
                                        }}
                                        className="hover-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                            <div style={{ background: 'rgba(33,150,243,0.1)', color: '#2196F3', padding: '10px', borderRadius: '14px' }}>
                                                <span className="material-icons-round" style={{ fontSize: '28px' }}>school</span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px' }}>{c.code}</div>
                                                {pending > 0 && (
                                                    <div style={{ marginTop: 6, background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 800 }}>
                                                        {pending} Pending
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>{c.name}</h3>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6', flex: 1 }}>
                                            {c.description || "No description provided."}
                                        </p>
                                        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                                            <span><span className="material-icons-round" style={{ fontSize: 15, verticalAlign: 'middle' }}>assignment</span> {courseAssignments(c.id).length} assignments</span>
                                            <span>{c.duration_weeks} weeks</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Course List (when one selected) */}
                        {selectedCourse && (
                            <>
                                <div>
                                    {courses.map(c => {
                                        const pending = coursePendingCount(c.id);
                                        return (
                                            <div key={c.id}
                                                onClick={() => setSelectedCourse(c)}
                                                style={{
                                                    background: 'white', borderRadius: '14px', padding: '14px 18px',
                                                    marginBottom: '10px', cursor: 'pointer',
                                                    border: `2px solid ${selectedCourse?.id === c.id ? '#2196F3' : 'transparent'}`,
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{c.name}</div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{c.code}</div>
                                                </div>
                                                {pending > 0 && (
                                                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 800 }}>
                                                        {pending}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Stream Panel */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <div>
                                            <h2 style={{ margin: 0, fontWeight: 900, color: '#1e293b' }}>{selectedCourse.name}</h2>
                                            <span style={{ background: '#eff6ff', color: '#2196F3', padding: '2px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>{selectedCourse.code}</span>
                                        </div>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}
                                            onClick={() => setSelectedCourse(null)}>
                                            <span className="material-icons-round">close</span>
                                        </button>
                                    </div>

                                    {/* Quick stats */}
                                    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                                        <div style={{ background: 'white', borderRadius: 14, padding: '14px 20px', flex: 1, minWidth: 100, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2196F3' }}>{courseAssignments(selectedCourse.id).length}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Assignments</div>
                                        </div>
                                        <div style={{ background: 'white', borderRadius: 14, padding: '14px 20px', flex: 1, minWidth: 100, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b' }}>{coursePendingCount(selectedCourse.id)}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Pending</div>
                                        </div>
                                        <div style={{ background: 'white', borderRadius: 14, padding: '14px 20px', flex: 1, minWidth: 100, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#22c55e' }}>{selectedCourse.duration_weeks}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Weeks</div>
                                        </div>
                                    </div>

                                    {/* Assignment Stream */}
                                    <h3 style={{ fontWeight: 800, color: '#1e293b', margin: '0 0 16px', fontSize: '1rem' }}>
                                        📋 Assignment Stream
                                    </h3>
                                    {courseAssignments(selectedCourse.id).length === 0 && (
                                        <div style={{ background: 'white', borderRadius: 14, padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                            No assignments for this course yet.
                                        </div>
                                    )}
                                    {courseAssignments(selectedCourse.id).map(a => {
                                        const sub = mySubmissions[a.id];
                                        const past = new Date() > new Date(a.due_date);
                                        const isOpen = !sub && !past;
                                        const badgeColor = sub?.status === "GRADED" ? "#22c55e" : sub ? "#f59e0b" : past ? "#ef4444" : "#2196F3";
                                        const badgeText = sub?.status === "GRADED" ? "Graded" : sub ? "Submitted" : past ? "Missing" : "Open";

                                        return (
                                            <div key={a.id} style={{
                                                background: 'white', borderRadius: 16, padding: '20px 24px',
                                                marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                                                borderLeft: `4px solid ${badgeColor}`
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                    <div style={{ fontWeight: 800, color: '#1e293b' }}>{a.title}</div>
                                                    <span style={{ background: `${badgeColor}20`, color: badgeColor, padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800 }}>
                                                        {badgeText}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 10 }}>
                                                    Due: {new Date(a.due_date).toLocaleString()} · {a.total_marks} marks
                                                </div>
                                                {a.description && (
                                                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 12px', lineHeight: 1.5 }}>{a.description}</p>
                                                )}

                                                {/* Links and attachments */}
                                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                                    {(a.attachment_url || a.attachment) && (
                                                        <button onClick={() => openFile(a.attachment_url || a.attachment)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#f0f9ff', color: '#0284c7', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
                                                            <span className="material-icons-round" style={{ fontSize: 16 }}>open_in_new</span>
                                                            Open File
                                                        </button>
                                                    )}
                                                    {a.links?.map((lk, i) => (
                                                        <a key={i} href={lk.url} target="_blank" rel="noreferrer"
                                                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#f5f3ff', color: '#7c3aed', borderRadius: 10, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700 }}>
                                                            <span className="material-icons-round" style={{ fontSize: 14 }}>link</span>
                                                            {lk.label}
                                                        </a>
                                                    ))}
                                                    {isOpen && (
                                                        <button onClick={() => navigate('/assignments')}
                                                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'linear-gradient(135deg, #2196F3, #1565C0)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
                                                            <span className="material-icons-round" style={{ fontSize: 16 }}>upload_file</span>
                                                            Submit
                                                        </button>
                                                    )}
                                                    {sub?.status === "GRADED" && (
                                                        <span style={{ background: '#d1fae5', color: '#065f46', padding: '7px 14px', borderRadius: 10, fontWeight: 800, fontSize: '0.82rem' }}>
                                                            Score: {sub.score}/{a.total_marks}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <button className="asgn-btn primary"
                                        style={{ marginTop: 16 }}
                                        onClick={() => navigate('/assignments')}>
                                        Go to Full Assignments Page →
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
