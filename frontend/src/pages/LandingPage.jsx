import { useEffect, useRef, useState } from "react";
import "./LandingPage.css";

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [planType, setPlanType] = useState("monthly");
  const [basicPrice, setBasicPrice] = useState(29);
  const [proPrice, setProPrice] = useState(79);
  const [basicPer, setBasicPer] = useState("/mo");
  const [proPer, setProPer] = useState("/mo");
  const [priceVisible, setPriceVisible] = useState(true);
  const navCenterRef = useRef(null);
  const navIndicatorRef = useRef(null);
  const particlesRef = useRef(null);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      updateActiveLink();
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Particles
  useEffect(() => {
    const c = particlesRef.current;
    if (!c) return;
    for (let i = 0; i < 28; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.cssText = `left:${Math.random() * 100}%;bottom:${-10 + Math.random() * 10}%;width:${1 + Math.random() * 2}px;height:${1 + Math.random() * 2}px;opacity:${0.3 + Math.random() * 0.7};animation-duration:${8 + Math.random() * 16}s;animation-delay:${Math.random() * 12}s`;
      c.appendChild(p);
    }
    return () => { if (c) c.innerHTML = ""; };
  }, []);

  // Reveal observer
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Counter animation
  useEffect(() => {
    const sObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".hero-stat-num").forEach((n) => {
            const t = n.textContent;
            if (t.includes("50+")) { n.dataset.suffix = "+"; animateCounter(n, 50); }
            if (t.includes("12K")) { n.dataset.suffix = "K+"; animateCounter(n, 12); }
            if (t.includes("99.9")) { n.dataset.suffix = "%"; animateCounter(n, 99.9); }
            if (t.includes("4.9")) { n.dataset.suffix = "★"; animateCounter(n, 4.9); }
          });
          sObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    const hs = document.querySelector(".hero-stats");
    if (hs) sObs.observe(hs);
    return () => sObs.disconnect();
  }, []);

  // Inject Google Fonts into <head>
  useEffect(() => {
    if (!document.getElementById("classora-fonts")) {
      const preconnect1 = document.createElement("link");
      preconnect1.rel = "preconnect";
      preconnect1.href = "https://fonts.googleapis.com";
      document.head.appendChild(preconnect1);

      const preconnect2 = document.createElement("link");
      preconnect2.rel = "preconnect";
      preconnect2.href = "https://fonts.gstatic.com";
      preconnect2.crossOrigin = "anonymous";
      document.head.appendChild(preconnect2);

      const link = document.createElement("link");
      link.id = "classora-fonts";
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Nav indicator
  useEffect(() => {
    setTimeout(() => {
      const a = navCenterRef.current && navCenterRef.current.querySelector("a.active");
      if (a) moveIndicator(a);
    }, 200);
  }, []);

  function animateCounter(el, target, dur = 1800) {
    const s = performance.now();
    const isD = String(target).includes(".");
    const suf = el.dataset.suffix || "";
    function u(now) {
      const p = Math.min((now - s) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const v = parseFloat(target) * e;
      el.textContent = (isD ? v.toFixed(1) : Math.floor(v).toLocaleString()) + suf;
      if (p < 1) requestAnimationFrame(u);
    }
    requestAnimationFrame(u);
  }

  function moveIndicator(el) {
    if (!el || !navIndicatorRef.current || !navCenterRef.current) return;
    const cr = navCenterRef.current.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    navIndicatorRef.current.style.left = er.left - cr.left + "px";
    navIndicatorRef.current.style.width = er.width + "px";
  }

  function updateActiveLink() {
    const sections = document.querySelectorAll("section[id]");
    let cur = "home";
    sections.forEach((s) => { if (window.scrollY >= s.offsetTop - 140) cur = s.id; });
    if (navCenterRef.current) {
      navCenterRef.current.querySelectorAll("a").forEach((a) => {
        const ia = a.getAttribute("href") === "#" + cur;
        a.classList.toggle("active", ia);
        if (ia) moveIndicator(a);
      });
    }
  }

  function handleNavLinkEnter(e) { moveIndicator(e.currentTarget); }
  function handleNavLinkLeave() {
    const ac = navCenterRef.current && navCenterRef.current.querySelector("a.active");
    if (ac) moveIndicator(ac);
  }

  function handleSetPlan(type) {
    const isAnnual = type === "annual";
    setPlanType(type);
    setPriceVisible(false);
    setTimeout(() => {
      setBasicPrice(isAnnual ? 23 : 29);
      setProPrice(isAnnual ? 63 : 79);
      setBasicPer(isAnnual ? "/mo billed annually" : "/mo");
      setProPer(isAnnual ? "/mo billed annually" : "/mo");
      setPriceVisible(true);
    }, 200);
  }

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const starSvg = (
    <svg viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );

  const checkSvg = (
    <svg viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0, width:"16px", height:"16px", marginTop:"2px"}}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const arrowSvg = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );

  return (
    <>
      {/* NAVBAR */}
      <div className={`nav-outer${scrolled ? " scrolled" : ""}`} id="navOuter">
        <nav className={scrolled ? "scrolled" : ""} id="navbar">
          <a className="nav-logo" href="#home" onClick={(e) => { e.preventDefault(); scrollTo("home"); }}>
            <div className="logo-badge">
              <div className="logo-badge-bg"></div>
              <div className="logo-badge-text">Cl</div>
            </div>
            <div className="nav-logo-text">
              <span className="brand-name">Classora</span>
              <span className="brand-sub">School OS</span>
            </div>
          </a>

          <div className="nav-center" id="navCenter" ref={navCenterRef}>
            <div className="nav-indicator" id="navIndicator" ref={navIndicatorRef}></div>
            {[["home", "Home"], ["features", "Features"], ["pricing", "Pricing"], ["about", "About"], ["contact", "Contact"]].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className={id === "home" ? "active" : ""}
                onMouseEnter={handleNavLinkEnter}
                onMouseLeave={handleNavLinkLeave}
                onClick={(e) => { e.preventDefault(); scrollTo(id); }}
              >
                <span className="nav-dot"></span>{label}
              </a>
            ))}
          </div>

          <div className="nav-right">
            <a href="/register" className="nav-cta">
              Sign Up
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <button
              className={`nav-hamburger${mobileOpen ? " open" : ""}`}
              id="hamburger"
              aria-label="Menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </nav>
      </div>

      {/* MOBILE NAV */}
      <div className={`mobile-nav${mobileOpen ? " open" : ""}`} id="mobileNav">
        {[["home", "🏠 Home"], ["features", "⚡ Features"], ["pricing", "💳 Pricing"], ["about", "💬 About"], ["contact", "📬 Contact"]].map(([id, label]) => (
          <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id); setMobileOpen(false); }}>{label}</a>
        ))}
        <div className="mobile-nav-divider"></div>
        <a href="/register" className="mobile-cta">Sign Up →</a>
      </div>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-orb hero-orb-3"></div>
        <div className="hero-particles" id="particles" ref={particlesRef}></div>

        <div className="hero-badge">
          <div className="hero-badge-dot">
            <svg viewBox="0 0 10 10"><path d="M5 1L6.8 3.6H9.5L7.3 5.4L8.1 8.1L5 6.3L1.9 8.1L2.7 5.4L.5 3.6H3.2Z" /></svg>
          </div>
          Trusted by 50+ schools worldwide
        </div>

        <h1>
          <span className="line-static">The Smartest Way to</span>
          <span className="line-gradient">Manage Your School</span>
        </h1>

        <p className="hero-sub">
          Classora brings together student management, AI-powered learning, attendance, analytics, and more — in one beautifully designed platform.
        </p>

        <div className="hero-actions">
          <a href="/register" className="btn-primary">
            Get Started Free
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a href="#features" className="btn-ghost" onClick={(e) => { e.preventDefault(); scrollTo("features"); }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
            </svg>
            Watch Demo
          </a>
        </div>

        <p className="hero-login">Already have an account? <a href="/login">Log in →</a></p>

        <div className="hero-stats">
          <div className="hero-stat" data-tooltip="Active schools globally">
            <div className="hero-stat-num">50+</div>
            <div className="hero-stat-label">Institutions</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat" data-tooltip="Students on platform">
            <div className="hero-stat-num">12K+</div>
            <div className="hero-stat-label">Students Managed</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat" data-tooltip="Guaranteed uptime">
            <div className="hero-stat-num">99.9%</div>
            <div className="hero-stat-label">Uptime SLA</div>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat" data-tooltip="Average customer rating">
            <div className="hero-stat-num">4.9★</div>
            <div className="hero-stat-label">Avg. Rating</div>
          </div>
        </div>

        <div className="hero-mockup reveal">
          <div className="hero-mockup-inner">
            <div className="mockup-bar">
              <div className="mockup-dot"></div>
              <div className="mockup-dot"></div>
              <div className="mockup-dot"></div>
            </div>
            <div className="mockup-grid">
              <div className="mockup-card">
                <div className="mockup-card-label">Total Students</div>
                <div className="mockup-card-value">1,284</div>
                <div className="mockup-card-sub">↑ 12% this month</div>
              </div>
              <div className="mockup-card">
                <div className="mockup-card-label">Attendance Today</div>
                <div className="mockup-card-value">96.2%</div>
                <div className="mockup-card-sub">↑ Above average</div>
              </div>
              <div className="mockup-card">
                <div className="mockup-card-label">Pending Fees</div>
                <div className="mockup-card-value">$4.2K</div>
                <div className="mockup-card-sub">↓ 8% vs last week</div>
              </div>
              <div className="mockup-chart">
                <div className="mockup-chart-label">Monthly Performance Overview</div>
                <div className="mockup-bars">
                  {[45, 60, 55, 80, 70, 90, 75, 85, 100, 88, 92, 95].map((h, i) => (
                    <div key={i} className="mockup-bar-item" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-hint" onClick={() => scrollTo("features")}>
          <span>Scroll to explore</span>
          <div className="scroll-arrow">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="features-header reveal">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything Your School Needs</h2>
          <p className="section-subtitle">From enrollment to graduation — Classora handles every aspect of school administration, beautifully.</p>
        </div>
        <div className="features-grid">
          {[
            {
              delay: 1, title: "Student Management", desc: "Manage profiles, enrollment, grades, and progress reports for every student from one unified dashboard.",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="#1a5cc8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            },
            {
              delay: 2, title: "AI Learning", desc: "Personalized AI-driven recommendations help students improve performance and close learning gaps faster.",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="#1a5cc8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10" /><path d="M2 12a10 10 0 0 1 10-10" /><circle cx="12" cy="12" r="3" /><path d="M12 9V6M12 18v-3M9 12H6M18 12h-3" /></svg>
            },
            {
              delay: 3, title: "Exams & Grading", desc: "Schedule exams, auto-grade submissions, and generate detailed performance reports with a single click.",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="#1a5cc8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            },
            {
              delay: 4, title: "Attendance Tracking", desc: "Real-time digital attendance with automated alerts to parents when students are absent.",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="#1a5cc8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
            },
            {
              delay: 1, title: "Analytics Dashboard", desc: "Visual insights into school performance, trends, and KPIs — so you can make data-driven decisions.",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="#1a5cc8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><polyline points="18 4 12 10 6 14" /></svg>
            },
            {
              delay: 2, title: "Parent Portal", desc: "Give parents transparent, real-time access to their child's grades, attendance, and school announcements.",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="#1a5cc8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            },
            {
              delay: 3, title: "School Website", desc: "Launch a professional school website with news, events, and admissions info — no coding required.",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="#1a5cc8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            },
            {
              delay: 4, title: "Fee Management", desc: "Automate invoicing, track payments, and send reminders — reduce late fees and improve cash flow.",
              icon: <svg viewBox="0 0 24 24" fill="none" stroke="#1a5cc8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
            },
          ].map(({ delay, title, desc, icon }) => (
            <div key={title} className={`feature-card reveal reveal-delay-${delay}`}>
              <div className="feature-icon">{icon}</div>
              <div className="feature-title">{title}</div>
              <div className="feature-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section id="steps">
        <div className="steps-header reveal" style={{ textAlign: "center" }}>
          <div className="section-label" style={{ justifyContent: "center" }}>How It Works</div>
          <h2 className="section-title">Get Started in Minutes</h2>
          <p className="section-subtitle" style={{ margin: "12px auto 0" }}>No technical expertise required. Set up your school management system in 3 easy steps.</p>
        </div>
        <div className="steps-grid">
          <div className="steps-connector">
            <div className="steps-connector-line"></div>
            <div className="steps-connector-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="#5599f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
            <div className="steps-connector-line"></div>
          </div>
          {[
            { n: 1, delay: 1, title: "Sign Up Free", desc: "Create your school account in seconds. No credit card required for the 30-day trial period.", tag: "⚡ Takes 60 seconds" },
            { n: 2, delay: 2, title: "Add Your Data", desc: "Import students, teachers, and classes using CSV or add them manually at your own pace.", tag: "📂 CSV or manual" },
            { n: 3, delay: 3, title: "Start Managing", desc: "Schedule exams, track attendance, and generate comprehensive reports with ease.", tag: "🚀 Ready to go" },
          ].map(({ n, delay, title, desc, tag }) => (
            <div key={n} className={`step-card reveal reveal-delay-${delay}`}>
              <div className="step-number">{n}</div>
              <div className="step-title">{title}</div>
              <div className="step-desc">{desc}</div>
              <div className="step-tag">{tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing">
        <div className="reveal" style={{ textAlign: "center" }}>
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Plans for Every School</h2>
          <p className="section-subtitle" style={{ margin: "12px auto 0" }}>Flexible plans that grow with your institution. No hidden fees, cancel anytime.</p>
          <div className="plans-toggle">
            <button className={planType === "monthly" ? "active" : ""} onClick={() => handleSetPlan("monthly")}>Monthly</button>
            <div className="annual-wrap">
              <button className={planType === "annual" ? "active" : ""} onClick={() => handleSetPlan("annual")}>Annual</button>
              <span className="save-badge">Save 20%</span>
            </div>
          </div>
        </div>
        <div className="plans-grid">
          {/* Basic */}
          <div className="plan-card reveal reveal-delay-1">
            <div className="plan-name">Basic</div>
            <div className="plan-price" style={{ opacity: priceVisible ? 1 : 0, transform: priceVisible ? "translateY(0)" : "translateY(-8px)", transition: "opacity 0.2s, transform 0.2s" }}>
              <sup>$</sup>{basicPrice}<span>{basicPer}</span>
            </div>
            <div className="plan-tagline">Perfect for small schools</div>
            <div className="plan-divider"></div>
            <ul className="plan-features">
              {["Up to 200 students", "Attendance & grading", "Basic analytics", "Parent portal", "Email support"].map((f) => (
                <li key={f}>{checkSvg} {f}</li>
              ))}
            </ul>
            <a href="#" className="btn-plan btn-plan-outline">Choose Basic</a>
          </div>
          {/* Pro */}
          <div className="plan-card featured reveal reveal-delay-2">
            <div className="plan-badge">Most Popular</div>
            <div className="plan-name">Pro</div>
            <div className="plan-price" style={{ opacity: priceVisible ? 1 : 0, transform: priceVisible ? "translateY(0)" : "translateY(-8px)", transition: "opacity 0.2s, transform 0.2s" }}>
              <sup>$</sup>{proPrice}<span>{proPer}</span>
            </div>
            <div className="plan-tagline">For growing institutions</div>
            <div className="plan-divider"></div>
            <ul className="plan-features">
              {["Up to 1,000 students", "AI Learning module", "Advanced analytics", "Fee management", "School website builder", "Priority support"].map((f) => (
                <li key={f}>{checkSvg} {f}</li>
              ))}
            </ul>
            <a href="#" className="btn-plan btn-plan-solid">Choose Pro</a>
          </div>
          {/* Enterprise */}
          <div className="plan-card reveal reveal-delay-3">
            <div className="plan-name">Enterprise</div>
            <div className="plan-price" style={{ fontSize: "2rem", letterSpacing: "-1px" }}>Custom</div>
            <div className="plan-tagline">For large school networks</div>
            <div className="plan-divider"></div>
            <ul className="plan-features">
              {["Unlimited students", "All Pro features", "Custom integrations", "Dedicated account manager", "SLA & 24/7 support", "On-premise option"].map((f) => (
                <li key={f}>{checkSvg} {f}</li>
              ))}
            </ul>
            <a href="#" className="btn-plan btn-plan-outline">Contact Sales</a>
          </div>
        </div>
      </section>

      {/* ABOUT / TESTIMONIALS */}
      <section id="about">
        <div className="reviews-header reveal">
          <div className="section-label">Testimonials</div>
          <h2 className="section-title">Loved by <span>50+ Institutions</span></h2>
          <p className="section-subtitle">Hear from educators and administrators who run their schools on Classora every day.</p>
        </div>
        <div className="reviews-grid">
          {[
            { delay: 1, initials: "SA", name: "Sarah Adeyemi", role: "Principal · Lakeview Academy", quote: "Classora transformed how we manage 800+ students. The attendance alerts alone saved us so many hours. I'd never go back to spreadsheets.", avatarStyle: {} },
            { delay: 2, initials: "MR", name: "Mohammed Rashid", role: "Head of IT · Crescent International School", quote: "The AI learning module is genuinely impressive. Students are more engaged and our exam scores improved 18% in just one semester of using Classora.", avatarStyle: { background: "linear-gradient(135deg,#7c3aed,#a78bfa)" } },
            { delay: 3, initials: "LP", name: "Lisa Park", role: "Administrator · Sunrise Learning Institute", quote: "Fee management used to be a nightmare. Now collections happen on auto-pilot. Parents love the portal and our finance team has so much less stress.", avatarStyle: { background: "linear-gradient(135deg,#059669,#34d399)" } },
            { delay: 1, initials: "JK", name: "James Kowalski", role: "Director · St. Brendan's Primary School", quote: "Setting up Classora took one afternoon. The onboarding is the smoothest I've seen. Support is incredibly responsive — always there when you need them.", avatarStyle: { background: "linear-gradient(135deg,#dc2626,#fb7185)" } },
            { delay: 2, initials: "TN", name: "Tanvir Nair", role: "Chairman · Global Scholars Group", quote: "Our teachers spend zero time on admin now. The analytics dashboard gives the board everything they need. Classora is the best investment we made this year.", avatarStyle: { background: "linear-gradient(135deg,#d97706,#fbbf24)" } },
          ].map(({ delay, initials, name, role, quote, avatarStyle }) => (
            <div key={name} className={`review-card reveal reveal-delay-${delay}`}>
              <div className="review-stars">{[1,2,3,4,5].map((i) => <span key={i}>{starSvg}</span>)}</div>
              <p className="review-quote">{quote}</p>
              <div className="review-author">
                <div className="review-avatar" style={avatarStyle}>{initials}</div>
                <div>
                  <div className="review-name">{name}</div>
                  <div className="review-role">{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section id="contact">
        <div className="cta-content reveal">
          <h2 className="cta-title">Ready to Transform<br />Your School?</h2>
          <p className="cta-sub">Join 50+ institutions already using Classora to save time, reduce admin work, and improve student outcomes.</p>
          <div className="cta-actions">
            <a href="/register" className="btn-cta-white">
              Start Free Trial {arrowSvg}
            </a>
            <a href="#" className="btn-cta-outline">Schedule a Demo</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#home" className="footer-logo" onClick={(e) => { e.preventDefault(); scrollTo("home"); }}>
              <div className="logo-placeholder">Cl</div>
              <span>Classora</span>
            </a>
            <p className="footer-tagline">Modern school management software that helps educators focus on what matters — teaching.</p>
            <div className="footer-social">
              <a href="#" className="social-btn">
                <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)" stroke="none"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
              <a href="#" className="social-btn">
                <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)" stroke="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
              <a href="#" className="social-btn">
                <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)" stroke="none"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </a>
              <a href="#" className="social-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Product</div>
            <ul className="footer-links">
              {["Features", "Pricing", "Integrations", "Changelog", "API Docs"].map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Company</div>
            <ul className="footer-links">
              {["About", "Blog", "Careers", "Press Kit", "Contact"].map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Support</div>
            <ul className="footer-links">
              {["Help Center", "Status", "Community", "Webinars", "Security"].map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2025 Classora Technologies. All rights reserved.</div>
          <nav className="footer-nav">
            {[["home", "Home"], ["features", "Features"], ["pricing", "Pricing"], ["contact", "Contact"]].map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id); }}>{label}</a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}