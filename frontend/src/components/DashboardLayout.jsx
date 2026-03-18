import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { logout } from "../api/auth";
import { Logo } from "../components/Logo";
import "./DashboardLayout.css";

export default function DashboardLayout({ children, user }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);

    const menuItems = [
        { label: "Dashboard", path: "/dashboard", icon: "grid_view", roles: ["ADMIN", "TEACHER", "STUDENT"] },
        { label: "Courses", path: "/courses", icon: "import_contacts", roles: ["ADMIN", "TEACHER", "STUDENT"] },
        { label: "Departments", path: "/departments", icon: "domain", roles: ["ADMIN"] },
        { label: "Enrollment", path: "/enrollment", icon: "person_add", roles: ["ADMIN"] },
        { label: "Assignments", path: "/assignments", icon: "assignment", roles: ["TEACHER", "STUDENT"] },
        { label: "Quizzes", path: "/quizzes", icon: "quiz", roles: ["TEACHER", "STUDENT"] },
        { label: "Attendance", path: "/attendance", icon: "how_to_reg", roles: ["TEACHER", "STUDENT"] },
        { label: "Analytics", path: "/analytics", icon: "analytics", roles: ["ADMIN", "TEACHER"] },
        { label: "Announcements", path: "/announcements", icon: "campaign", roles: ["ADMIN", "TEACHER", "STUDENT"] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

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
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <Logo className="sidebar-logo" />
                    </Link>
                    <div className="sidebar-menu-label">MENU</div>
                </div>

                <nav className="sidebar-nav">
                    {filteredItems.map((item) => {
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
                        <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
                            <div className="user-info">
                                <div className="user-name">{user?.full_name}</div>
                                <div className="user-role">{user?.role} ▼</div>
                            </div>
                            <div className="user-avatar">
                                {user?.full_name?.charAt(0) || "U"}
                            </div>

                            {showDropdown && (
                                <div className="user-dropdown">
                                    <button className="user-dropdown-item logout" onClick={handleLogout}>
                                        <span className="material-icons-round">logout</span>
                                        Log Out
                                    </button>
                                </div>
                            )}
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
