import React from "react";
import "./LandingPage.css";

function LandingPage({ onEnter }) {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-logo">
          <span className="logo-dot" />
          CRM Lite
        </div>
        <button className="landing-cta-nav" onClick={onEnter}>Dashboard →</button>
      </nav>

      <header className="landing-hero">
        <div className="hero-badge">Sales Pipeline Management</div>
        <h1 className="hero-title">
          Close more deals.<br />
          <span className="hero-accent">Track every lead.</span>
        </h1>
        <p className="hero-sub">
          A lightweight CRM built for modern sales teams. Manage your pipeline,
          track deal values, add notes, and visualize performance — all in one place.
        </p>
        <button className="hero-btn" onClick={onEnter}>
          Open Dashboard
          <span className="btn-arrow">→</span>
        </button>
      </header>

      <section className="features-section">
        <div className="features-grid">
          {[
            { icon: "👥", title: "Lead Management", desc: "Add, edit, and track leads through your entire sales pipeline with ease." },
            { icon: "📊", title: "Analytics", desc: "Visualize your pipeline with pie charts, bar charts, and conversion rates." },
            { icon: "📝", title: "Notes", desc: "Attach contextual notes to every lead so nothing falls through the cracks." },
            { icon: "🔍", title: "Search & Filter", desc: "Instantly find any lead by name, email, company, or pipeline status." },
            { icon: "⬇", title: "CSV Export", desc: "Download your entire lead database as a CSV file anytime." },
            { icon: "₹", title: "Deal Tracking", desc: "Track deal values in INR and see your total pipeline value at a glance." },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pipeline-section">
        <h2 className="section-label">PIPELINE STAGES</h2>
        <div className="pipeline-stages">
          {[
            { label: "Prospect",     color: "#6366F1" },
            { label: "Qualified",    color: "#F97316" },
            { label: "Proposal",     color: "#3B82F6" },
            { label: "Closed Won",   color: "#22C55E" },
            { label: "Closed Lost",  color: "#F43F5E" },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              <div className="stage-pill" style={{ background: s.color + "18", border: `1.5px solid ${s.color}44`, color: s.color }}>
                <span className="stage-dot" style={{ background: s.color }} />
                {s.label}
              </div>
              {i < 4 && <span className="stage-arrow">›</span>}
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="about-inner">
          <h2 className="about-title">Built with purpose</h2>
          <p className="about-text">
            CRM Lite is a full-stack application built with <strong>React</strong> on the frontend
            and <strong>Spring Boot</strong> on the backend, backed by a <strong>PostgreSQL</strong> database
            hosted on Render. Designed as a practical, portfolio-grade project that demonstrates
            real-world software engineering skills.
          </p>
          <div className="tech-stack">
            {["React 18", "Spring Boot", "PostgreSQL", "Recharts", "Vercel", "Render"].map((t) => (
              <span key={t} className="tech-pill">{t}</span>
            ))}
          </div>
          <div className="author-row">
            <div className="author-avatar">PR</div>
            <div>
              <div className="author-name">Prachi Rajput</div>
              <div className="author-links">
                <a href="https://github.com/Prachi088" target="_blank" rel="noreferrer">GitHub</a>
                <span>·</span>
                <a href="https://linkedin.com/in/prachi-rajput-023985280" target="_blank" rel="noreferrer">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>© 2024 CRM Lite · MIT License</span>
        <button className="footer-cta" onClick={onEnter}>Open Dashboard →</button>
      </footer>
    </div>
  );
}

export default LandingPage;