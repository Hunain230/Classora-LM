import React, { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import './LandingPage.css';

export default function LandingPage() {
    const navigate = useNavigate();
    const observerRefs = useRef([]);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        observerRefs.current.forEach(ref => {
            if (ref) observer.observe(ref);
        });

        return () => {
            if (observer) observer.disconnect();
        };
    }, []);

    const addToRefs = (el) => {
        if (el && !observerRefs.current.includes(el)) {
            observerRefs.current.push(el);
        }
    };

    return (
        <div className="landing-page-container">
            {/* Header / Navbar */}
            <header className="landing-header">
                <Link to="/" className="landing-logo-link">
                    <div className="landing-logo hover-scale">
                        <Logo className="landing-logo-svg" />
                    </div>
                </Link>
                <nav className="landing-nav">
                    <button className="nav-btn" onClick={() => navigate('/login')}>Login</button>
                    <button className="nav-btn primary" onClick={() => navigate('/register')}>Register Institute</button>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="landing-hero section-spacing reveal" ref={addToRefs}>
                <div className="hero-content">
                    <div className="hero-badge fade-in-up" style={{ animationDelay: '0.1s' }}>Welcome to the Future of Learning</div>
                    <h1 className="hero-title fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Empower Education with <br /><span className="gradient-text">Classora LMS</span>
                    </h1>
                    <p className="hero-subtitle fade-in-up" style={{ animationDelay: '0.3s' }}>
                        A premium, multi-tenant learning management system designed to streamline administration, engage students, and equip teachers with modern tools.
                    </p>
                    <div className="hero-actions fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <button className="hero-btn primary" onClick={() => navigate('/login')}>
                            Get Started
                            <span className="material-icons-round">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Hero Feature Cards (Decorative) */}
                <div className="hero-visuals fade-in-right" style={{ animationDelay: '0.5s' }}>
                    <div className="glass-card card-1 floating">
                        <span className="material-icons-round card-icon">school</span>
                        <h3>Smart Learning</h3>
                        <p>Interactive courses & quizzes.</p>
                    </div>
                    <div className="glass-card card-2 floating-slow">
                        <span className="material-icons-round card-icon">groups</span>
                        <h3>Multi-Tenant</h3>
                        <p>Manage multiple institutes seamlessly.</p>
                    </div>
                    <div className="glass-card card-3 floating">
                        <span className="material-icons-round card-icon">analytics</span>
                        <h3>Deep Analytics</h3>
                        <p>Real-time insights on progress.</p>
                    </div>
                </div>
            </main>

            {/* Features / Why Choose Us Section */}
            <section className="landing-feature-section section-spacing">
                <div className="feature-container">
                    <div className="feature-image-wrapper reveal slide-in-left" ref={addToRefs}>
                        <img
                            src="/thumbs-up.png"
                            alt="Students learning together"
                            className="feature-img shadow-premium"
                        />
                        <div className="floating-badge badge-bottom-right">
                            <span className="material-icons-round text-blue">verified</span>
                            <span>Engaging Environment</span>
                        </div>
                    </div>

                    <div className="feature-text reveal slide-in-right" ref={addToRefs}>
                        <h2 className="section-heading">Built for <span className="gradient-text">Connection</span></h2>
                        <p className="section-paragraph">
                            Classora isn't just a platform; it's an ecosystem. We bring students, teachers, and administration together in one cohesive, beautiful interface. From dynamic attendance tracking to interactive assignments, we ensure no student is left behind.
                        </p>
                        <ul className="feature-list">
                            <li><span className="material-icons-round text-blue">check_circle</span> Seamless multi-tenant architecture</li>
                            <li><span className="material-icons-round text-blue">check_circle</span> Intuitive roles for Admins, Teachers & Students</li>
                            <li><span className="material-icons-round text-blue">check_circle</span> Live announcements and notifications</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* AI Future Plan Section */}
            <section className="landing-ai-section section-spacing">
                <div className="feature-container reverse-layout">
                    <div className="feature-text reveal slide-in-left" ref={addToRefs}>
                        <div className="hero-badge ai-badge">Our Future Vision</div>
                        <h2 className="section-heading">Futuristic Learning with <br /><span className="gradient-text">AI Assistance</span></h2>
                        <p className="section-paragraph">
                            We are building the classroom of the future. Soon, Classora will feature a deeply integrated AI Assistant designed to personalize learning paths, predict student struggles before they happen, and auto-grade assignments with human-like precision.
                        </p>
                        <ul className="feature-list ai-list">
                            <li><span className="material-icons-round text-purple">psychology</span> Personalized AI Tutoring</li>
                            <li><span className="material-icons-round text-purple">auto_graph</span> Predictive Performance Analytics</li>
                            <li><span className="material-icons-round text-purple">smart_toy</span> Automated grading and feedback generation</li>
                        </ul>
                        <button className="nav-btn primary outline mt-4" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            Join the Waitlist
                        </button>
                    </div>

                    <div className="feature-image-wrapper reveal slide-in-right" ref={addToRefs}>
                        <div className="glow-effect behind-image"></div>
                        <img
                            src="/ai-learning-robot.png"
                            alt="Futuristic AI Learning Hologram"
                            className="feature-img shadow-premium glass-border"
                        />
                        <div className="floating-badge badge-top-left glass-badge">
                            <span className="material-icons-round text-purple">memory</span>
                            <span>AI Powered</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <footer className="landing-footer reveal fade-in-up" ref={addToRefs}>
                <div className="footer-content glass-card-solid">
                    <h2 className="footer-title">Ready to Transform Your Institute?</h2>
                    <p className="footer-subtitle">Join thousands of educators relying on Classora today.</p>
                    <div className="footer-actions">
                        <button className="hero-btn primary" onClick={() => navigate('/register')}>
                            Register Your Institute Now
                        </button>
                        <button className="nav-btn" onClick={() => navigate('/login')}>
                            Login
                        </button>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Classora LMS. All rights reserved.</p>
                </div>
            </footer>

            {/* Background Decorations */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>
        </div>
    );
}
