import React from 'react';
import CreateCoursePage from './admin/CreateCoursePage';
import { apiClient } from '../api/client';
import DashboardLayout from '../components/DashboardLayout';

export default function CoursesPage() {
    const user = JSON.parse(localStorage.getItem("current_user") || "{}");
    const [courses, setCourses] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (user.role && user.role !== 'ADMIN') {
            apiClient.get("/api/lms/courses/")
                .then(res => {
                    const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                    setCourses(data);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user.role]);

    // Redirect or render based on role
    if (user.role === 'ADMIN') {
        return <CreateCoursePage />;
    }

    if (loading) return <DashboardLayout user={user}><div style={{ padding: '80px', textAlign: 'center' }}>Loading Courses...</div></DashboardLayout>;

    return (
        <DashboardLayout user={user}>
            <div className="lms-page-container">
                <h2 className="section-title">MY COURSES</h2>
                <div className="title-divider"></div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                    {courses.length === 0 ? (
                        <div className="dashboard-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
                            <span className="material-icons-round" style={{ fontSize: '4rem', marginBottom: '20px' }}>import_contacts</span>
                            <h3>No courses found.</h3>
                            <p>You haven't been assigned or enrolled in any courses yet.</p>
                        </div>
                    ) : (
                        courses.map(c => (
                            <div key={c.id} className="dashboard-card hover-card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <div style={{ background: 'rgba(33, 150, 243, 0.1)', color: '#2196F3', padding: '12px', borderRadius: '16px' }}>
                                        <span className="material-icons-round" style={{ fontSize: '32px' }}>school</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px' }}>{c.code}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#2196F3', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px' }}>{c.semester}</div>
                                    </div>
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>{c.name}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', flex: 1 }}>
                                    {c.description || "Learn the depths of this subject with expert guidance."}
                                </p>
                                <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <span className="material-icons-round" style={{ fontSize: '18px' }}>history</span>
                                        {c.duration_weeks} Weeks
                                    </div>
                                    <button className="pill-submit-btn primary" style={{ padding: '8px 20px', fontSize: '0.75rem', height: 'auto', width: 'auto' }}>
                                        VIEW DETAILS
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
