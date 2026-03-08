import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../api/auth";
import { Logo } from "../components/Logo";
import "./DashboardLayout.css";

export default function DashboardLayout({ children, user }) {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { label: "Dashboard", path: "/dashboard", icon: "grid_view" },
        { label: "Courses", path: "/courses", icon: "import_contacts" },
        { label: "Assignments", path: "/assignments", "icon": "assignment" },
        { label: "Quizzes", path: "/quizzes", icon: "quiz" },
        { label: "Attendance", path: "/attendance", icon: "how_to_reg" },
        { label: "Analytics", path: "/analytics", icon: "analytics" },
        { label: "Announcements", path: "/announcements", icon: "campaign" },
    ];

    // Map user role-based paths to /dashboard
    const getDashboardPath = () => {
        if (user?.role === "ADMIN") return "/admin";
        if (user?.role === "TEACHER") return "/teacher";
        if (user?.role === "STUDENT") return "/student";
        return "/login";
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="layout-root">
            {/* Sidebar */}
            <aside className="layout-sidebar">
                <div className="sidebar-header">
                    <Logo className="sidebar-logo" />
                    <div className="sidebar-menu-label">MENU</div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path === "/dashboard" && location.pathname.match(/^\/(admin|teacher|student)$/));
                        return (
                            <button
                                key={item.label}
                                className={`nav-item ${isActive ? "active" : ""}`}
                                onClick={() => navigate(item.path === "/dashboard" ? getDashboardPath() : item.path)}
                            >
                                <span className="material-icons-round">{item.icon}</span>
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="layout-main">
                <header className="layout-topbar">
                    <div className="topbar-left">
                        <div className="breadcrumb">
                            {location.pathname.split("/").filter(x => x).map(p => p.toUpperCase()).join(" / ") || "DASHBOARD"}
                        </div>
                    </div>
                    <div className="topbar-right">
                        <div className="user-profile">
                            <div className="user-info">
                                <div className="user-name">{user?.full_name}</div>
                                <div className="user-role">{user?.role} ▼</div>
                            </div>
                            <div className="user-avatar">
                                {user?.full_name?.charAt(0) || "U"}
                            </div>
                        </div>
                        <button className="topbar-icon-btn">
                            <span className="material-icons-round">notifications</span>
                            <span className="notification-dot"></span>
                        </button>
                    </div>
                </header>

                <main className="layout-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
