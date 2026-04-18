import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiClient } from "../api/client";
import "./QuizzesPage.css";

const LETTERS = ["A","B","C","D","E","F"];

export default function StudentQuizzesPage() {
    const [user] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
    const [quizzes, setQuizzes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [questions, setQuestions] = useState({});   // {quizId: []}
    const [myAttempts, setMyAttempts] = useState({}); // {quizId: attempt}
    const [message, setMessage] = useState({ type: "", text: "" });

    // Taking quiz modal state
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [activeQuestions, setActiveQuestions] = useState([]);
    const [answers, setAnswers] = useState({});          // {questionId: selectedIndex}
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(null);
    const [startedAt, setStartedAt] = useState(null);
    const [submittingQuiz, setSubmittingQuiz] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchAll();
    }, []);

    // Countdown timer
    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) { handleSubmitQuiz(); return; }
        timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timerRef.current);
    }, [timeLeft]);

    const fetchAll = async () => {
        try {
            const [qzRes, atRes, crsRes] = await Promise.all([
                apiClient.get("/api/lms/quizzes/"),
                apiClient.get("/api/lms/quiz-attempts/"),
                apiClient.get("/api/lms/courses/"),
            ]);
            const qzData  = Array.isArray(qzRes.data) ? qzRes.data : (qzRes.data.results || []);
            const atData  = Array.isArray(atRes.data) ? atRes.data : (atRes.data.results || []);
            const crsData = Array.isArray(crsRes.data) ? crsRes.data : (crsRes.data.results || []);
            setQuizzes(qzData);
            setCourses(crsData);
            const atMap = {};
            atData.forEach(a => { atMap[a.quiz] = a; });
            setMyAttempts(atMap);
        } catch (err) { console.error(err); }
    };

    const getQuizState = (qz) => {
        const now = new Date();
        if (myAttempts[qz.id]) return "done";
        if (!qz.is_published) return "draft";
        if (qz.start_time && new Date(qz.start_time) > now) return "upcoming";
        if (qz.end_time && new Date(qz.end_time) < now) return "expired";
        return "active";
    };

    const formatCountdown = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    };

    const openQuiz = async (qz) => {
        try {
            const res = await apiClient.get(`/api/lms/questions/?quiz=${qz.id}`);
            const qs = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setActiveQuestions(qs);
            setActiveQuiz(qz);
            setAnswers({});
            setCurrentQ(0);
            setStartedAt(Date.now());
            setTimeLeft(qz.total_time_minutes * 60);
        } catch (err) {
            setMessage({ type: "error", text: "Failed to load quiz questions." });
        }
    };

    const closeQuiz = () => {
        clearTimeout(timerRef.current);
        setActiveQuiz(null);
        setActiveQuestions([]);
        setAnswers({});
        setTimeLeft(null);
    };

    const handleSubmitQuiz = async () => {
        if (submittingQuiz) return;
        setSubmittingQuiz(true);
        clearTimeout(timerRef.current);
        const timeTaken = Math.round((Date.now() - startedAt) / 1000);
        try {
            await apiClient.post("/api/lms/quiz-attempts/", {
                quiz: activeQuiz.id,
                answers: answers,
                time_taken_seconds: timeTaken,
            });
            setMessage({ type: "success", text: `✅ Quiz submitted! Check your score in the results.` });
            closeQuiz();
            fetchAll();
        } catch (err) {
            const detail = err?.response?.data;
            if (detail && JSON.stringify(detail).includes("unique")) {
                setMessage({ type: "error", text: "You have already submitted this quiz." });
                closeQuiz();
            } else {
                setMessage({ type: "error", text: "Submission failed. Please try again." });
            }
        } finally { setSubmittingQuiz(false); }
    };

    const setAnswer = (qId, val) => setAnswers(prev => ({ ...prev, [String(qId)]: val }));
    const answeredCount = activeQuestions.filter(q => answers[String(q.id)] !== undefined).length;

    // Sort: active first, upcoming, done, expired
    const ORDER = { active: 0, upcoming: 1, done: 2, expired: 3, draft: 4 };
    const sortedQuizzes = [...quizzes].sort((a, b) => ORDER[getQuizState(a)] - ORDER[getQuizState(b)]);

    const quizzesByCourse = {};
    sortedQuizzes.forEach(qz => {
        if (!quizzesByCourse[qz.course]) quizzesByCourse[qz.course] = [];
        quizzesByCourse[qz.course].push(qz);
    });

    const activeCount  = quizzes.filter(q => getQuizState(q) === "active").length;
    const doneCount    = quizzes.filter(q => getQuizState(q) === "done").length;
    const upcomingCount = quizzes.filter(q => getQuizState(q) === "upcoming").length;

    return (
        <DashboardLayout user={user}>
            <div className="qz-page">
                <div className="qz-header">
                    <div>
                        <h1 className="qz-title">My Quizzes</h1>
                        <p className="qz-subtitle">Take quizzes · View your scores and feedback</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="qz-badge purple" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Active: {activeCount}</span>
                        <span className="qz-badge amber" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Upcoming: {upcomingCount}</span>
                        <span className="qz-badge green" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>Completed: {doneCount}</span>
                    </div>
                </div>

                {message.text && <div className={`qz-message ${message.type}`}>{message.text}</div>}

                {quizzes.length === 0 && (
                    <div className="qz-empty-state" style={{ marginTop: 60 }}>
                        <span className="material-icons-round">quiz</span>
                        <p>No quizzes available yet.</p>
                    </div>
                )}

                {Object.entries(quizzesByCourse).map(([courseId, qzList]) => {
                    const course = courses.find(c => c.id === parseInt(courseId));
                    return (
                        <div key={courseId} style={{ marginBottom: 36 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>{course?.name}</span>
                                {course?.code && <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '2px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>{course.code}</span>}
                            </div>

                            {qzList.map(qz => {
                                const state  = getQuizState(qz);
                                const attempt = myAttempts[qz.id];
                                const pct = attempt?.percentage;

                                const stateMap = {
                                    active:   { label: "Available Now",  cls: "active",   badge: "purple" },
                                    upcoming: { label: "Upcoming",       cls: "upcoming",  badge: "amber"  },
                                    done:     { label: "Completed",       cls: "done",     badge: "green"  },
                                    expired:  { label: "Expired",         cls: "expired",  badge: "gray"   },
                                    draft:    { label: "Not Published",   cls: "expired",  badge: "gray"   },
                                };
                                const { label, cls, badge } = stateMap[state] || stateMap.expired;

                                return (
                                    <div key={qz.id} className={`qz-student-card ${cls}`}>
                                        <div className="qz-card-top">
                                            <div>
                                                <div className="qz-card-title">{qz.title}</div>
                                                <div className="qz-card-meta">
                                                    <span><span className="material-icons-round" style={{ fontSize: 14, verticalAlign: 'middle' }}>timer</span> {qz.total_time_minutes} mins</span>
                                                    <span><span className="material-icons-round" style={{ fontSize: 14, verticalAlign: 'middle' }}>quiz</span> {qz.question_count} questions</span>
                                                    {qz.start_time && <span>Opens: {new Date(qz.start_time).toLocaleString()}</span>}
                                                    {qz.end_time   && <span>Closes: {new Date(qz.end_time).toLocaleString()}</span>}
                                                </div>
                                            </div>
                                            <span className={`qz-badge ${badge}`}>{label}</span>
                                        </div>

                                        {qz.instructions && <p className="qz-card-desc">{qz.instructions}</p>}

                                        {/* Result */}
                                        {attempt && (
                                            <div className="qz-result-box">
                                                <div>
                                                    <div className="qz-result-score">{attempt.score}/{attempt.total_marks}</div>
                                                    <div className="qz-result-pct">{pct ? `${pct}%` : ""}</div>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div className="qz-score-bar" style={{ marginBottom: 6 }}>
                                                        <div className="qz-score-fill" style={{ width: `${pct || 0}%` }} />
                                                    </div>
                                                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                                        Submitted {new Date(attempt.submitted_at).toLocaleString()}
                                                        {attempt.time_taken_seconds && ` · ${Math.round(attempt.time_taken_seconds / 60)}min`}
                                                    </div>
                                                </div>
                                                <span className={`qz-badge ${pct >= 70 ? "green" : pct >= 40 ? "amber" : "red"}`}>
                                                    {pct >= 70 ? "Pass" : pct >= 40 ? "Average" : "Needs Work"}
                                                </span>
                                            </div>
                                        )}

                                        {state === "active" && (
                                            <button className="qz-btn primary" onClick={() => openQuiz(qz)} style={{ marginTop: 4 }}>
                                                <span className="material-icons-round" style={{ fontSize: 18 }}>play_circle</span>
                                                Start Quiz
                                            </button>
                                        )}
                                        {state === "upcoming" && (
                                            <div style={{ marginTop: 8, color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span className="material-icons-round" style={{ fontSize: 16 }}>schedule</span>
                                                Opens {new Date(qz.start_time).toLocaleString()}
                                            </div>
                                        )}
                                        {state === "expired" && !attempt && (
                                            <div style={{ marginTop: 8, color: '#94a3b8', fontWeight: 700, fontSize: '0.85rem' }}>
                                                ❌ Window closed — not attempted
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* ── QUIZ MODAL ── */}
            {activeQuiz && (
                <div className="qz-modal-overlay">
                    <div className="qz-modal">
                        <div className="qz-modal-header">
                            <div>
                                <div className="qz-modal-title">{activeQuiz.title}</div>
                                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
                                    Question {currentQ + 1} of {activeQuestions.length} · {answeredCount} answered
                                </div>
                            </div>
                            <div className={`qz-timer ${timeLeft < 60 ? "urgent" : ""}`}>
                                <span className="material-icons-round" style={{ fontSize: 18 }}>timer</span>
                                {formatCountdown(timeLeft)}
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="qz-progress">
                            <div className="qz-progress-bar">
                                <div className="qz-progress-fill"
                                    style={{ width: `${(answeredCount / activeQuestions.length) * 100}%` }} />
                            </div>
                        </div>

                        {/* Question dots navigator */}
                        <div className="qz-q-dots" style={{ marginBottom: 20 }}>
                            {activeQuestions.map((q, i) => (
                                <div key={q.id}
                                    className={`qz-q-dot ${i === currentQ ? "current" : answers[String(q.id)] !== undefined ? "answered" : ""}`}
                                    onClick={() => setCurrentQ(i)}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>

                        {/* Current question */}
                        {activeQuestions[currentQ] && (() => {
                            const q = activeQuestions[currentQ];
                            const userAns = answers[String(q.id)];
                            return (
                                <div className="qz-question-block">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div className="qz-q-text">
                                            <span style={{ color: '#7c3aed', fontWeight: 900 }}>Q{currentQ + 1}. </span>
                                            {q.text}
                                        </div>
                                        <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800, flexShrink: 0, marginLeft: 12 }}>
                                            {q.points} pt{q.points > 1 ? "s" : ""}
                                        </span>
                                    </div>

                                    {q.question_type === "MCQ" ? (
                                        <div>
                                            {(q.options || []).filter(Boolean).map((opt, oIdx) => (
                                                <div key={oIdx}
                                                    className={`qz-poll-option ${String(userAns) === String(oIdx) ? "selected" : ""}`}
                                                    onClick={() => setAnswer(q.id, String(oIdx))}>
                                                    <div className="qz-poll-option-label">{LETTERS[oIdx]}</div>
                                                    <span className="qz-poll-option-text">{opt}</span>
                                                    {String(userAns) === String(oIdx) && (
                                                        <span className="material-icons-round" style={{ marginLeft: 'auto', color: '#7c3aed', fontSize: 20 }}>check_circle</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="qz-q-instruction">Write your answer below:</div>
                                            <textarea className="qz-sa-input"
                                                placeholder="Type your answer here..."
                                                value={answers[String(q.id)] || ""}
                                                onChange={e => setAnswer(q.id, e.target.value)} />
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Navigation */}
                        <div className="qz-nav-row">
                            <button className="qz-btn secondary" disabled={currentQ === 0} onClick={() => setCurrentQ(p => p - 1)}>
                                <span className="material-icons-round">arrow_back</span> Prev
                            </button>
                            <button className="qz-btn danger" onClick={closeQuiz}>Quit</button>
                            {currentQ < activeQuestions.length - 1 ? (
                                <button className="qz-btn primary" onClick={() => setCurrentQ(p => p + 1)}>
                                    Next <span className="material-icons-round">arrow_forward</span>
                                </button>
                            ) : (
                                <button className="qz-btn primary" disabled={submittingQuiz} onClick={handleSubmitQuiz}>
                                    <span className="material-icons-round">send</span>
                                    {submittingQuiz ? "Submitting..." : `Submit (${answeredCount}/${activeQuestions.length})`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
