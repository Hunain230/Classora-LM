import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import './LandingPage.css';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-page-container">
            {/* Header / Navbar */}
            <header className="landing-header">
                <div className="landing-logo">
                    <Logo className="landing-logo-svg" />
                </div>
                <nav className="landing-nav">
                    <button className="nav-btn" onClick={() => navigate('/login')}>Login</button>
                    <button className="nav-btn primary" onClick={() => navigate('/register')}>Register Institute</button>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="landing-hero">
                <div className="hero-content">
                    <div className="hero-badge">Welcome to the Future of Learning</div>
                    <h1 className="hero-title">
                        Empower Education with <br/><span className="gradient-text">Classora LMS</span>
                    </h1>
                    <p className="hero-subtitle">
                        A premium, multi-tenant learning management system designed to streamline administration, engage students, and equip teachers with modern tools.
                    </p>
                    <div className="hero-actions">
                        <button className="hero-btn primary" onClick={() => navigate('/login')}>
                            Get Started
                            <span className="material-icons-round">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Hero Feature Cards (Decorative) */}
                <div className="hero-visuals">
                    <div className="glass-card card-1">
                        <span className="material-icons-round card-icon">school</span>
                        <h3>Smart Learning</h3>
                        <p>Interactive courses & quizzes.</p>
                    </div>
                    <div className="glass-card card-2">
                        <span className="material-icons-round card-icon">groups</span>
                        <h3>Multi-Tenant</h3>
                        <p>Manage multiple institutes seamlessly.</p>
                    </div>
                    <div className="glass-card card-3">
                        <span className="material-icons-round card-icon">analytics</span>
                        <h3>Deep Analytics</h3>
                        <p>Real-time insights on progress.</p>
                    </div>
                </div>
            </main>

            {/* Background Decorations */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
        </div>
    );
}
