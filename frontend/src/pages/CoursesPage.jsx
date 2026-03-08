import React from 'react';
import CreateCoursePage from './admin/CreateCoursePage';

export default function CoursesPage() {
    const user = JSON.parse(localStorage.getItem("current_user") || "{}");

    // Redirect or render based on role
    if (user.role === 'ADMIN') {
        return <CreateCoursePage />;
    }

    // Fallback for other roles (to be implemented)
    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Courses View</h2>
            <p>Courses view for {user.role} is under development.</p>
        </div>
    );
}
