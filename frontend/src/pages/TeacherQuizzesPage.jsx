import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiClient } from "../api/client";
import "./TeacherLMS.css";

export default function TeacherQuizzesPage() {
    const [user] = useState(JSON.parse(localStorage.getItem("current_user") || "{}"));
    const [courses, setCourses] = useState([]);

    const [quizData, setQuizData] = useState({
        title: "",
        course: "",
        totalTime: 30,
        instructions: "",
        showAnswers: true
    });

    const [questions, setQuestions] = useState([
        { id: 1, type: "MCQ", text: "", options: ["", "", "", ""], correct: 0 }
    ]);

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        apiClient.get("/api/lms/courses/")
            .then(res => setCourses(res.data.results || []))
            .catch(err => console.error("Error fetching courses", err));
    }, []);

    const handleQuizChange = (e) => {
        const { name, value, type, checked } = e.target;
        setQuizData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            id: Date.now(),
            type: "MCQ",
            text: "",
            options: ["", "", "", ""],
            correct: 0
        }]);
    };

    const updateQuestion = (id, field, value) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const updateOption = (qId, optIdx, value) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOpts = [...q.options];
                newOpts[optIdx] = value;
                return { ...q, options: newOpts };
            }
            return q;
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const quizRes = await apiClient.post("/api/lms/quizzes/", {
                ...quizData,
                total_time_minutes: quizData.totalTime,
                show_answers_after: quizData.showAnswers
            });

            // Post all questions
            for (const q of questions) {
                await apiClient.post("/api/lms/questions/", {
                    quiz: quizRes.data.id,
                    question_type: q.type,
                    text: q.text,
                    options: q.type === "MCQ" ? q.options : [],
                    correct_answer: q.correct.toString()
                });
            }

            setMessage({ type: "success", text: "Quiz published successfully!" });
        } catch (err) {
            setMessage({ type: "error", text: "Failed to publish quiz." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout user={user}>
            <div className="lms-page-container">
                <h2 className="section-title">CREATE QUIZ</h2>
                <div className="title-divider"></div>

                <div className="lms-main-form">
                    <div className="form-row">
                        <div className="form-group flex-2">
                            <label>Quiz Title:</label>
                            <div className="pill-input-wrapper">
                                <input name="title" placeholder="e.g., Mid-term Quiz" value={quizData.title} onChange={handleQuizChange} />
                            </div>
                        </div>
                        <div className="form-group flex-1">
                            <label>Course:</label>
                            <div className="pill-input-wrapper">
                                <select name="course" value={quizData.course} onChange={handleQuizChange}>
                                    <option value="">Select course</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-group" style={{ width: '100px' }}>
                            <label>Total Time (min):</label>
                            <div className="pill-input-wrapper">
                                <input type="number" name="totalTime" value={quizData.totalTime} onChange={handleQuizChange} />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-2">
                            <label>Instructions:</label>
                            <div className="pill-input-wrapper">
                                <input name="instructions" placeholder="Read all questions carefully..." value={quizData.instructions} onChange={handleQuizChange} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginLeft: '20px' }}>
                            <label>Show Answers After:</label>
                            <div className="late-toggle" onClick={() => setQuizData(p => ({ ...p, showAnswers: !p.showAnswers }))}>
                                <div className={`toggle-pill ${quizData.showAnswers ? 'on' : 'off'}`} style={{ color: quizData.showAnswers ? '#10b981' : '#94a3b8', borderColor: quizData.showAnswers ? '#10b981' : '#e2e8f0' }}>
                                    {quizData.showAnswers ? '[ON]' : '[OFF]'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="questions-section" style={{ marginTop: '40px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '20px' }}>QUESTIONS</h3>
                        <div className="title-divider" style={{ width: '100%', borderStyle: 'dashed' }}></div>

                        {questions.map((q, idx) => (
                            <div key={q.id} className="question-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <span className="q-number">Q{idx + 1}.</span>
                                        <label style={{ marginRight: '10px' }}>Type:</label>
                                        <div className="pill-input-wrapper" style={{ height: '35px', width: '150px' }}>
                                            <select value={q.type} onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}>
                                                <option value="MCQ">MCQ</option>
                                                <option value="SHORT_ANSWER">Short Answer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>[Edit] [Delete]</div>
                                </div>

                                <div className="pill-input-wrapper" style={{ marginBottom: '20px' }}>
                                    <input placeholder="What is the capital of France?" value={q.text} onChange={(e) => updateQuestion(q.id, 'text', e.target.value)} />
                                </div>

                                {q.type === "MCQ" ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <input type="radio" checked={q.correct === oIdx} onChange={() => updateQuestion(q.id, 'correct', oIdx)} />
                                                <div className="pill-input-wrapper" style={{ height: '35px' }}>
                                                    <input placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} value={opt} onChange={(e) => updateOption(q.id, oIdx, e.target.value)} />
                                                </div>
                                                {q.correct === oIdx && <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>✓ Correct</span>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label>Expected Answer:</label>
                                        <div className="pill-input-wrapper" style={{ borderStyle: 'dashed', height: '45px' }}>
                                            <input placeholder="[Answer key for grading]" value={q.text} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button className="add-q-btn" onClick={addQuestion}>+ Add Question</button>
                    </div>

                    <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '40px' }}>
                        <button className="pill-submit-btn secondary" style={{ width: '150px' }}>Preview</button>
                        <button className="pill-submit-btn secondary" style={{ width: '150px' }}>Save Draft</button>
                        <button className="pill-submit-btn primary" style={{ width: '200px' }} onClick={handleSubmit}>Publish Quiz</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
