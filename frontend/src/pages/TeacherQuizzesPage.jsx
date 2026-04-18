import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiClient } from "../api/client";
import "./QuizzesPage.css";

const TABS = { CREATE: "create", RESULTS: "results" };
const LETTERS = ["A","B","C","D","E"];

export default function TeacherQuizzesPage() {
    const [user] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
    const [activeTab, setActiveTab] = useState(TABS.CREATE);
    const [courses, setCourses] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [grading, setGrading] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [quizData, setQuizData] = useState({
        title: "", course: "", instructions: "",
        totalTime: 30, showAnswers: true, isPublished: false,
        startDate: "", startTime: "", endDate: "", endTime: ""
    });

    const [questions, setQuestions] = useState([
        { id: Date.now(), type: "MCQ", text: "", options: ["", "", "", ""], correct: "0", points: 1 }
    ]);

    useEffect(() => {
        apiClient.get("/api/lms/courses/")
            .then(r => setCourses(Array.isArray(r.data) ? r.data : (r.data.results || [])))
            .catch(console.error);
        fetchQuizzes();
    }, []);

    useEffect(() => {
        if (selectedQuiz) {
            apiClient.get(`/api/lms/quiz-attempts/?quiz=${selectedQuiz}`)
                .then(r => setAttempts(Array.isArray(r.data) ? r.data : (r.data.results || [])))
                .catch(console.error);
        }
    }, [selectedQuiz]);

    const fetchQuizzes = () =>
        apiClient.get("/api/lms/quizzes/")
            .then(r => setQuizzes(Array.isArray(r.data) ? r.data : (r.data.results || [])))
            .catch(console.error);

    /* ── Question helpers ── */
    const addQuestion = () => setQuestions(prev => [...prev, {
        id: Date.now(), type: "MCQ", text: "", options: ["", "", "", ""], correct: "0", points: 1
    }]);

    const removeQuestion = (id) => setQuestions(prev => prev.filter(q => q.id !== id));

    const updateQ = (id, field, val) =>
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: val } : q));

    const updateOption = (qId, idx, val) =>
        setQuestions(prev => prev.map(q => q.id === qId
            ? { ...q, options: q.options.map((o, i) => i === idx ? val : o) }
            : q));

    const addOption = (qId) =>
        setQuestions(prev => prev.map(q => q.id === qId && q.options.length < 6
            ? { ...q, options: [...q.options, ""] } : q));

    const removeOption = (qId, idx) =>
        setQuestions(prev => prev.map(q => q.id === qId && q.options.length > 2
            ? { ...q, options: q.options.filter((_, i) => i !== idx) }
            : q));

    /* ── Submit quiz ── */
    const buildDateTimeZ = (date, time) =>
        date && time ? `${date}T${time}:00Z` : null;

    const handlePublish = async (publish) => {
        if (!quizData.course || !quizData.title) {
            setMessage({ type: "error", text: "Please fill in title and course." });
            return;
        }
        setSubmitting(true); setMessage({ type: "", text: "" });
        try {
            const quizPayload = {
                title: quizData.title,
                course: quizData.course,
                instructions: quizData.instructions,
                total_time_minutes: quizData.totalTime,
                show_answers_after: quizData.showAnswers,
                is_published: publish,
                start_time: buildDateTimeZ(quizData.startDate, quizData.startTime),
                end_time: buildDateTimeZ(quizData.endDate, quizData.endTime),
            };
            const quizRes = await apiClient.post("/api/lms/quizzes/", quizPayload);
            const quizId = quizRes.data.id;

            for (const q of questions) {
                await apiClient.post("/api/lms/questions/", {
                    quiz: quizId,
                    question_type: q.type,
                    text: q.text,
                    options: q.type === "MCQ" ? q.options.filter(Boolean) : [],
                    correct_answer: q.correct.toString(),
                    points: q.points,
                });
            }

            setMessage({ type: "success", text: publish ? "✅ Quiz published! Students have been notified." : "💾 Quiz saved as draft." });
            setQuizData({ title: "", course: "", instructions: "", totalTime: 30, showAnswers: true, isPublished: false, startDate: "", startTime: "", endDate: "", endTime: "" });
            setQuestions([{ id: Date.now(), type: "MCQ", text: "", options: ["", "", "", ""], correct: "0", points: 1 }]);
            fetchQuizzes();
        } catch (err) {
            setMessage({ type: "error", text: "❌ Failed. " + (err?.response?.data ? JSON.stringify(err.response.data) : "") });
        } finally { setSubmitting(false); }
    };

    const submitGrade = async (attemptId) => {
        const score = grading[attemptId];
        if (score === undefined) return;
        try {
            await apiClient.patch(`/api/lms/quiz-attempts/${attemptId}/grade/`, { score });
            setMessage({ type: "success", text: "Grade saved and student notified!" });
            if (selectedQuiz) {
                apiClient.get(`/api/lms/quiz-attempts/?quiz=${selectedQuiz}`)
                    .then(r => setAttempts(Array.isArray(r.data) ? r.data : (r.data.results || [])));
            }
        } catch { setMessage({ type: "error", text: "Failed to save grade." }); }
    };

    const isActive = (q) => {
        const now = new Date();
        if (!q.start_time || !q.end_time) return q.is_published;
        return q.is_published && new Date(q.start_time) <= now && now <= new Date(q.end_time);
    };

    return (
        <DashboardLayout user={user}>
            <div className="qz-page">
                <div className="qz-header">
                    <div>
                        <h1 className="qz-title">Quizzes</h1>
                        <p className="qz-subtitle">Create MCQ / Short-Answer quizzes · View student attempts</p>
                    </div>
                    <div className="qz-tabs">
                        <button className={`qz-tab ${activeTab === TABS.CREATE ? "active" : ""}`} onClick={() => setActiveTab(TABS.CREATE)}>
                            <span className="material-icons-round">add_circle</span> Create
                        </button>
                        <button className={`qz-tab ${activeTab === TABS.RESULTS ? "active" : ""}`} onClick={() => setActiveTab(TABS.RESULTS)}>
                            <span className="material-icons-round">bar_chart</span> Results ({quizzes.length})
                        </button>
                    </div>
                </div>

                {message.text && <div className={`qz-message ${message.type}`}>{message.text}</div>}

                {/* ── CREATE ── */}
                {activeTab === TABS.CREATE && (
                    <div className="qz-card">
                        <div className="qz-form">
                            {/* Row 1: title + course */}
                            <div className="qz-row">
                                <div className="qz-group flex-2">
                                    <label>Quiz Title</label>
                                    <input className="qz-input" placeholder="e.g. Midterm Quiz — Week 4"
                                        value={quizData.title} onChange={e => setQuizData(p => ({ ...p, title: e.target.value }))} />
                                </div>
                                <div className="qz-group">
                                    <label>Course</label>
                                    <select className="qz-input" value={quizData.course}
                                        onChange={e => setQuizData(p => ({ ...p, course: e.target.value }))}>
                                        <option value="">Select course</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="qz-group" style={{ minWidth: 100, flex: 0 }}>
                                    <label>Time (min)</label>
                                    <input className="qz-input" type="number" min="1" value={quizData.totalTime}
                                        onChange={e => setQuizData(p => ({ ...p, totalTime: e.target.value }))} />
                                </div>
                            </div>

                            {/* Row 2: instructions */}
                            <div className="qz-group">
                                <label>Instructions</label>
                                <textarea className="qz-input qz-textarea" placeholder="Read all questions carefully before answering..."
                                    value={quizData.instructions} onChange={e => setQuizData(p => ({ ...p, instructions: e.target.value }))} />
                            </div>

                            {/* Row 3: start/end window */}
                            <div className="qz-row">
                                <div className="qz-group">
                                    <label>Start Date</label>
                                    <input className="qz-input" type="date" value={quizData.startDate}
                                        onChange={e => setQuizData(p => ({ ...p, startDate: e.target.value }))} />
                                </div>
                                <div className="qz-group">
                                    <label>Start Time</label>
                                    <input className="qz-input" type="time" value={quizData.startTime}
                                        onChange={e => setQuizData(p => ({ ...p, startTime: e.target.value }))} />
                                </div>
                                <div className="qz-group">
                                    <label>End Date</label>
                                    <input className="qz-input" type="date" value={quizData.endDate}
                                        onChange={e => setQuizData(p => ({ ...p, endDate: e.target.value }))} />
                                </div>
                                <div className="qz-group">
                                    <label>End Time</label>
                                    <input className="qz-input" type="time" value={quizData.endTime}
                                        onChange={e => setQuizData(p => ({ ...p, endTime: e.target.value }))} />
                                </div>
                                <div className="qz-group">
                                    <label>Show Answers After</label>
                                    <div className="qz-toggle-row" style={{ marginTop: 6 }}>
                                        <div className={`qz-toggle ${quizData.showAnswers ? "on" : "off"}`}
                                            onClick={() => setQuizData(p => ({ ...p, showAnswers: !p.showAnswers }))}>
                                            <div className="qz-toggle-thumb" />
                                        </div>
                                        <span>{quizData.showAnswers ? "Yes" : "No"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Questions ── */}
                            <div>
                                <div className="qz-questions-header">
                                    <span className="qz-questions-title">Questions ({questions.length})</span>
                                    <button className="qz-btn secondary sm" onClick={addQuestion}>
                                        <span className="material-icons-round" style={{ fontSize: 16 }}>add</span> Add Question
                                    </button>
                                </div>

                                {questions.map((q, idx) => (
                                    <div key={q.id} className="qz-question-card">
                                        <div className="qz-q-header">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="qz-q-num">{idx + 1}</div>
                                                <select className="qz-input" style={{ width: 150, padding: '6px 10px' }}
                                                    value={q.type} onChange={e => updateQ(q.id, 'type', e.target.value)}>
                                                    <option value="MCQ">Multiple Choice</option>
                                                    <option value="SHORT_ANSWER">Short Answer</option>
                                                </select>
                                                <span className={`qz-badge ${q.type === "MCQ" ? "purple" : "blue"}`}>{q.type === "MCQ" ? "MCQ" : "Short"}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Pts:</label>
                                                <input className="qz-points-input" type="number" min="1" value={q.points}
                                                    onChange={e => updateQ(q.id, 'points', parseInt(e.target.value) || 1)} />
                                                {questions.length > 1 && (
                                                    <button className="qz-q-delete" onClick={() => removeQuestion(q.id)}>
                                                        <span className="material-icons-round" style={{ fontSize: 20 }}>delete_outline</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <input className="qz-input" placeholder={`Question ${idx + 1}...`}
                                            value={q.text} onChange={e => updateQ(q.id, 'text', e.target.value)}
                                            style={{ marginBottom: 14 }} />

                                        {q.type === "MCQ" ? (
                                            <div>
                                                <div style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 700, marginBottom: 8 }}>
                                                    ✦ Click the circle to mark the correct answer
                                                </div>
                                                <div className="qz-options-grid">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={oIdx}
                                                            className={`qz-option-row ${q.correct === String(oIdx) ? "correct" : ""}`}
                                                            onClick={() => updateQ(q.id, 'correct', String(oIdx))}>
                                                            <div className={`qz-option-radio ${q.correct === String(oIdx) ? "selected" : ""}`} />
                                                            <div className="qz-option-label">{LETTERS[oIdx]}</div>
                                                            <input className="qz-option-input"
                                                                placeholder={`Option ${LETTERS[oIdx]}`}
                                                                value={opt}
                                                                onClick={e => e.stopPropagation()}
                                                                onChange={e => updateOption(q.id, oIdx, e.target.value)} />
                                                            {q.correct === String(oIdx) && (
                                                                <span className="material-icons-round qz-correct-tick">check_circle</span>
                                                            )}
                                                            {q.options.length > 2 && (
                                                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                                                                    onClick={e => { e.stopPropagation(); removeOption(q.id, oIdx); }}>
                                                                    <span className="material-icons-round" style={{ fontSize: 16 }}>close</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                {q.options.length < 6 && (
                                                    <button className="qz-add-option" onClick={() => addOption(q.id)}>
                                                        <span className="material-icons-round" style={{ fontSize: 16 }}>add</span>
                                                        Add option
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <label style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                                                    Expected Answer (for teacher reference):
                                                </label>
                                                <input className="qz-input" placeholder="Model answer..."
                                                    value={q.correct} onChange={e => updateQ(q.id, 'correct', e.target.value)} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="qz-actions">
                                <button className="qz-btn secondary" disabled={submitting} onClick={() => handlePublish(false)}>
                                    <span className="material-icons-round" style={{ fontSize: 16 }}>save</span>
                                    Save Draft
                                </button>
                                <button className="qz-btn primary" disabled={submitting} onClick={() => handlePublish(true)}>
                                    <span className="material-icons-round" style={{ fontSize: 16 }}>send</span>
                                    {submitting ? "Publishing..." : "Publish Quiz"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── RESULTS ── */}
                {activeTab === TABS.RESULTS && (
                    <div className="qz-two-col">
                        <div className="qz-list-panel">
                            <p className="qz-panel-title">My Quizzes</p>
                            {quizzes.length === 0 && <div className="qz-empty-state"><span className="material-icons-round">quiz</span><p>No quizzes yet</p></div>}
                            {quizzes.map(qz => (
                                <div key={qz.id}
                                    className={`qz-list-item ${selectedQuiz === qz.id ? "selected" : ""}`}
                                    onClick={() => setSelectedQuiz(qz.id)}>
                                    <div className="qz-list-item-title">{qz.title}</div>
                                    <div className="qz-list-item-meta">
                                        <span className={`qz-badge ${isActive(qz) ? "green" : qz.is_published ? "amber" : "gray"}`}>
                                            {isActive(qz) ? "Live" : qz.is_published ? "Published" : "Draft"}
                                        </span>
                                        <span>{qz.question_count} Qs</span>
                                        <span>{qz.total_time_minutes}min</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="qz-detail-panel">
                            {!selectedQuiz ? (
                                <div className="qz-empty-state">
                                    <span className="material-icons-round">bar_chart</span>
                                    <p>Select a quiz to see attempts</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <p className="qz-panel-title">Student Attempts ({attempts.length})</p>
                                        {attempts.length > 0 && (
                                            <span className="qz-badge purple">
                                                Avg: {(attempts.reduce((s, a) => s + (a.percentage || 0), 0) / attempts.length).toFixed(1)}%
                                            </span>
                                        )}
                                    </div>

                                    {attempts.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: 30 }}>No attempts yet.</p>}

                                    {attempts.map(at => {
                                        const pct = at.percentage ?? (at.total_marks ? Math.round((at.score / at.total_marks) * 100) : 0);
                                        const hasShortAnswer = at.answers && Object.keys(at.answers).length > 0;
                                        return (
                                            <div key={at.id} className="qz-attempt-card">
                                                <div className="qz-attempt-header">
                                                    <div>
                                                        <div className="qz-attempt-name">{at.student_name}</div>
                                                        <div className="qz-attempt-time">{new Date(at.submitted_at).toLocaleString()} · {at.time_taken_seconds ? `${Math.round(at.time_taken_seconds / 60)}min` : ""}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontWeight: 900, fontSize: '1.1rem', color: pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444' }}>
                                                            {at.score}/{at.total_marks}
                                                        </div>
                                                        <span className={`qz-badge ${pct >= 70 ? "green" : pct >= 40 ? "amber" : "red"}`}>{pct}%</span>
                                                    </div>
                                                </div>
                                                <div className="qz-score-bar">
                                                    <div className="qz-score-fill" style={{ width: `${pct}%` }} />
                                                </div>
                                                {/* Manual grading for short answer */}
                                                {at.total_marks > 0 && (
                                                    <div className="qz-grade-row">
                                                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Override score:</span>
                                                        <input className="qz-input sm" type="number" placeholder={String(at.score ?? "")}
                                                            onChange={e => setGrading(g => ({ ...g, [at.id]: e.target.value }))} />
                                                        <button className="qz-btn primary sm" onClick={() => submitGrade(at.id)}>Save</button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
