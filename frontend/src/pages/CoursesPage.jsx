import React from 'react';
import CreateCoursePage from './admin/CreateCoursePage';
import { apiClient } from '../api/client';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import './CourseStream.css';

const BACKEND = "http://localhost:8000";
function openFile(url) {
    if (!url) return;
    const href = url.startsWith("http") ? url : `${BACKEND}${url.startsWith("/") ? "" : "/media/"}${url}`;
    window.open(href, "_blank", "noopener,noreferrer");
}

const BANNER_COLORS = [
    "linear-gradient(135deg, #1565C0, #42A5F5)",
    "linear-gradient(135deg, #6d28d9, #a78bfa)",
    "linear-gradient(135deg, #065f46, #34d399)",
    "linear-gradient(135deg, #92400e, #fbbf24)",
    "linear-gradient(135deg, #9d174d, #f472b6)",
    "linear-gradient(135deg, #1e3a5f, #3b82f6)",
];

export default function CoursesPage() {
    const user = JSON.parse(localStorage.getItem("current_user") || "{}");
    const navigate = useNavigate();
    const isStudent = user.role === "STUDENT";

    const [courses, setCourses]       = React.useState([]);
    const [assignments, setAssignments] = React.useState([]);
    const [quizzes, setQuizzes]       = React.useState([]);
    const [mySubmissions, setMySubmissions] = React.useState({});
    const [myAttempts, setMyAttempts] = React.useState({});
    const [announcements, setAnnouncements] = React.useState([]);
    const [loading, setLoading]       = React.useState(true);
    const [selectedCourse, setSelectedCourse] = React.useState(null);

    React.useEffect(() => {
        if (user.role && user.role !== 'ADMIN') {
            const promises = [
                apiClient.get("/api/lms/courses/"),
                apiClient.get("/api/lms/assignments/"),
                apiClient.get("/api/lms/quizzes/"),
                apiClient.get("/api/lms/announcements/"),
                isStudent ? apiClient.get("/api/lms/assignment-submissions/") : Promise.resolve({ data: [] }),
                isStudent ? apiClient.get("/api/lms/quiz-attempts/") : Promise.resolve({ data: [] }),
            ];
            Promise.all(promises).then(([crsR, asgR, qzR, annR, subR, atR]) => {
                setCourses(Array.isArray(crsR.data) ? crsR.data : (crsR.data.results || []));
                setAssignments(Array.isArray(asgR.data) ? asgR.data : (asgR.data.results || []));
                setQuizzes(Array.isArray(qzR.data) ? qzR.data : (qzR.data.results || []));
                setAnnouncements(Array.isArray(annR.data) ? annR.data : (annR.data.results || []));
                const subData = Array.isArray(subR.data) ? subR.data : (subR.data.results || []);
                const atData  = Array.isArray(atR.data)  ? atR.data  : (atR.data.results  || []);
                const subMap = {}; subData.forEach(s => { subMap[s.assignment] = s; });
                const atMap  = {}; atData.forEach(a  => { atMap[a.quiz] = a; });
                setMySubmissions(subMap);
                setMyAttempts(atMap);
            }).catch(console.error).finally(() => setLoading(false));
        } else { setLoading(false); }
    }, [user.role]);

    if (user.role === 'ADMIN') return <CreateCoursePage />;
    if (loading) return <DashboardLayout user={user}><div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div></DashboardLayout>;

    // ── Stream items for a course (sorted newest first) ──
    const getCourseStream = (courseId) => {
        const items = [];
        assignments.filter(a => a.course === courseId).forEach(a => items.push({ ...a, _type: "assignment", _date: new Date(a.created_at) }));
        quizzes.filter(q => q.course === courseId && q.is_published).forEach(q => items.push({ ...q, _type: "quiz", _date: new Date(q.created_at) }));
        announcements.filter(a => a.course === courseId).forEach(a => items.push({ ...a, _type: "announcement", _date: new Date(a.created_at) }));
        return items.sort((a, b) => b._date - a._date);
    };

    const pendingAssignments = (courseId) =>
        assignments.filter(a => a.course === courseId && !mySubmissions[a.id] && new Date() < new Date(a.due_date));

    const upcomingQuizzes = (courseId) =>
        quizzes.filter(q => q.course === courseId && q.is_active && !myAttempts[q.id]);

    return (
        <DashboardLayout user={user}>
            <div className="cs-page">
                {!selectedCourse ? (
                    /* ─── Course Grid ─── */
                    <>
                        <div className="cs-page-header">
                            <h1 className="cs-page-title">{isStudent ? "Enrolled Courses" : "My Courses"}</h1>
                            <p className="cs-page-sub">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
                        </div>

                        {courses.length === 0 ? (
                            <div className="cs-empty">
                                <span className="material-icons-round">import_contacts</span>
                                <p>No courses yet.</p>
                            </div>
                        ) : (
                            <div className="cs-grid">
                                {courses.map((c, i) => {
                                    const pending  = pendingAssignments(c.id).length;
                                    const liveQuiz = upcomingQuizzes(c.id).length;
                                    return (
                                        <div key={c.id} className="cs-course-card" onClick={() => setSelectedCourse(c)}>
                                            {/* Banner */}
                                            <div className="cs-banner" style={{ background: BANNER_COLORS[i % BANNER_COLORS.length] }}>
                                                <div className="cs-banner-title">{c.name}</div>
                                                <div className="cs-banner-sub">{c.code}{c.semester ? ` · ${c.semester}` : ""}</div>
                                                <span className="material-icons-round cs-banner-icon">school</span>
                                            </div>
                                            {/* Body */}
                                            <div className="cs-card-body">
                                                <p className="cs-card-desc">{c.description || "No description provided."}</p>
                                                <div className="cs-card-footer">
                                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                        {pending > 0 && <span className="cs-chip amber">{pending} pending</span>}
                                                        {liveQuiz > 0 && <span className="cs-chip purple">{liveQuiz} quiz live</span>}
                                                        <span className="cs-chip gray">{c.duration_weeks}w</span>
                                                    </div>
                                                    <span className="material-icons-round" style={{ color: '#94a3b8' }}>chevron_right</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    /* ─── Course Stream (Google Classroom style) ─── */
                    <div className="cs-stream-layout">
                        {/* Sidebar: course list */}
                        <div className="cs-sidebar">
                            {courses.map((c, i) => (
                                <div key={c.id}
                                    className={`cs-sidebar-item ${selectedCourse?.id === c.id ? "active" : ""}`}
                                    onClick={() => setSelectedCourse(c)}>
                                    <div className="cs-sidebar-dot" style={{ background: BANNER_COLORS[i % BANNER_COLORS.length] }} />
                                    <div>
                                        <div className="cs-sidebar-name">{c.name}</div>
                                        <div className="cs-sidebar-code">{c.code}</div>
                                    </div>
                                    {(() => { const p = pendingAssignments(c.id).length + upcomingQuizzes(c.id).length; return p > 0 ? <span className="cs-chip amber" style={{ marginLeft: 'auto' }}>{p}</span> : null; })()}
                                </div>
                            ))}
                        </div>

                        {/* Main stream */}
                        <div className="cs-main">
                            {/* Course Hero Banner */}
                            {(() => {
                                const idx = courses.findIndex(c => c.id === selectedCourse.id);
                                return (
                                    <div className="cs-hero" style={{ background: BANNER_COLORS[idx % BANNER_COLORS.length] }}>
                                        <div className="cs-hero-content">
                                            <h2 className="cs-hero-title">{selectedCourse.name}</h2>
                                            <p className="cs-hero-sub">{selectedCourse.code}{selectedCourse.semester ? ` · ${selectedCourse.semester}` : ""}</p>
                                        </div>
                                        <span className="material-icons-round cs-hero-icon">school</span>
                                        <button className="cs-back-btn" onClick={() => setSelectedCourse(null)}>
                                            <span className="material-icons-round">arrow_back</span>
                                            All Courses
                                        </button>
                                    </div>
                                );
                            })()}

                            <div className="cs-stream-body">
                                {/* Upcoming widget */}
                                {isStudent && (
                                    <div className="cs-upcoming-widget">
                                        <div className="cs-widget-title">
                                            <span className="material-icons-round">upcoming</span>
                                            Upcoming
                                        </div>
                                        {pendingAssignments(selectedCourse.id).length === 0 && upcomingQuizzes(selectedCourse.id).length === 0 ? (
                                            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>All caught up! 🎉</p>
                                        ) : (
                                            <>
                                                {pendingAssignments(selectedCourse.id).map(a => (
                                                    <div key={a.id} className="cs-upcoming-item" onClick={() => navigate('/assignments')}>
                                                        <span className="material-icons-round" style={{ color: '#2196F3', fontSize: 16 }}>assignment</span>
                                                        <div>
                                                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{a.title}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Due {new Date(a.due_date).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {upcomingQuizzes(selectedCourse.id).map(q => (
                                                    <div key={q.id} className="cs-upcoming-item" onClick={() => navigate('/quizzes')}>
                                                        <span className="material-icons-round" style={{ color: '#7c3aed', fontSize: 16 }}>quiz</span>
                                                        <div>
                                                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{q.title}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                                {q.end_time ? `Closes ${new Date(q.end_time).toLocaleDateString()}` : "Open"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Stream feed */}
                                <div className="cs-feed">
                                    {getCourseStream(selectedCourse.id).length === 0 && (
                                        <div className="cs-empty" style={{ padding: '60px 0' }}>
                                            <span className="material-icons-round">dynamic_feed</span>
                                            <p>No activity yet for this course.</p>
                                        </div>
                                    )}

                                    {getCourseStream(selectedCourse.id).map(item => {
                                        if (item._type === "assignment") {
                                            const sub = mySubmissions[item.id];
                                            const past = new Date() > new Date(item.due_date);
                                            const status = sub?.status === "GRADED" ? "graded" : sub ? "submitted" : past ? "missing" : "open";
                                            const statusMap = {
                                                open:      { color: "#2196F3", label: "Open",      icon: "assignment" },
                                                submitted: { color: "#f59e0b", label: "Submitted", icon: "check_circle" },
                                                graded:    { color: "#22c55e", label: "Graded",    icon: "grade" },
                                                missing:   { color: "#ef4444", label: "Missing",   icon: "error" },
                                            };
                                            const s = statusMap[status];
                                            return (
                                                <div key={`a-${item.id}`} className="cs-stream-card" style={{ borderLeft: `4px solid ${s.color}` }}>
                                                    <div className="cs-stream-card-header">
                                                        <div className="cs-stream-type-icon" style={{ background: `${s.color}20`, color: s.color }}>
                                                            <span className="material-icons-round">{s.icon}</span>
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div className="cs-stream-eyebrow">Assignment</div>
                                                            <div className="cs-stream-card-title">{item.title}</div>
                                                        </div>
                                                        <span style={{ background: `${s.color}20`, color: s.color, padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800 }}>{s.label}</span>
                                                    </div>
                                                    <p className="cs-stream-desc">{item.description}</p>
                                                    <div className="cs-stream-meta">
                                                        <span><span className="material-icons-round" style={{ fontSize: 14 }}>schedule</span> Due {new Date(item.due_date).toLocaleString()}</span>
                                                        <span>{item.total_marks} marks</span>
                                                    </div>
                                                    <div className="cs-stream-actions">
                                                        {(item.attachment_url || item.attachment) && (
                                                            <button className="cs-action-btn file" onClick={() => openFile(item.attachment_url || item.attachment)}>
                                                                <span className="material-icons-round">open_in_new</span> Open File
                                                            </button>
                                                        )}
                                                        {item.links?.map((lk, i) => (
                                                            <a key={i} href={lk.url} target="_blank" rel="noreferrer" className="cs-action-btn link">
                                                                <span className="material-icons-round">link</span> {lk.label}
                                                            </a>
                                                        ))}
                                                        {status === "open" && isStudent && (
                                                            <button className="cs-action-btn submit" onClick={() => navigate('/assignments')}>
                                                                <span className="material-icons-round">upload_file</span> Submit
                                                            </button>
                                                        )}
                                                        {status === "graded" && sub && (
                                                            <span className="cs-action-btn grade">
                                                                Score: {sub.score}/{item.total_marks}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        if (item._type === "quiz") {
                                            const attempt = myAttempts[item.id];
                                            const quizState = attempt ? "done" : item.is_active ? "live" : "closed";
                                            const qMap = {
                                                live:   { color: "#7c3aed", label: "Live Now",  icon: "bolt" },
                                                done:   { color: "#22c55e", label: "Completed", icon: "check_circle" },
                                                closed: { color: "#94a3b8", label: "Closed",    icon: "lock" },
                                            };
                                            const s = qMap[quizState];
                                            return (
                                                <div key={`q-${item.id}`} className="cs-stream-card" style={{ borderLeft: `4px solid ${s.color}` }}>
                                                    <div className="cs-stream-card-header">
                                                        <div className="cs-stream-type-icon" style={{ background: `${s.color}20`, color: s.color }}>
                                                            <span className="material-icons-round">{s.icon}</span>
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div className="cs-stream-eyebrow">Quiz</div>
                                                            <div className="cs-stream-card-title">{item.title}</div>
                                                        </div>
                                                        <span style={{ background: `${s.color}20`, color: s.color, padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800 }}>{s.label}</span>
                                                    </div>
                                                    {item.instructions && <p className="cs-stream-desc">{item.instructions}</p>}
                                                    <div className="cs-stream-meta">
                                                        <span><span className="material-icons-round" style={{ fontSize: 14 }}>timer</span> {item.total_time_minutes} min</span>
                                                        <span>{item.question_count} questions</span>
                                                        {item.end_time && <span>Closes: {new Date(item.end_time).toLocaleString()}</span>}
                                                    </div>
                                                    {attempt && (
                                                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <div style={{ fontWeight: 900, color: '#7c3aed' }}>{attempt.score}/{attempt.total_marks}</div>
                                                            <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3 }}>
                                                                <div style={{ height: '100%', background: 'linear-gradient(90deg,#7c3aed,#2196F3)', borderRadius: 3, width: `${attempt.percentage || 0}%` }} />
                                                            </div>
                                                            <span style={{ fontWeight: 700, color: '#7c3aed', fontSize: '0.85rem' }}>{attempt.percentage}%</span>
                                                        </div>
                                                    )}
                                                    <div className="cs-stream-actions" style={{ marginTop: 10 }}>
                                                        {quizState === "live" && isStudent && (
                                                            <button className="cs-action-btn submit" onClick={() => navigate('/quizzes')}>
                                                                <span className="material-icons-round">play_circle</span> Take Quiz
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        if (item._type === "announcement") {
                                            return (
                                                <div key={`ann-${item.id}`} className="cs-stream-card" style={{ borderLeft: '4px solid #64748b' }}>
                                                    <div className="cs-stream-card-header">
                                                        <div className="cs-stream-type-icon" style={{ background: '#f1f5f9', color: '#64748b' }}>
                                                            <span className="material-icons-round">campaign</span>
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div className="cs-stream-eyebrow">Announcement · {item.author_name}</div>
                                                            <div className="cs-stream-card-title">{item.title}</div>
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="cs-stream-desc">{item.content}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
