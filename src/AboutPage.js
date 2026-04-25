import React, { useEffect, useRef, useState } from "react";
import "./AboutPage.css";

const FEATURES = [
  {
    icon: "👥",
    title: "Lead Management",
    desc: "Add, edit, and track every lead through your sales pipeline. Full CRUD with ownership and access control.",
    color: "#6366F1",
  },
  {
    icon: "📝",
    title: "Notes & Context",
    desc: "Attach contextual notes to every lead. Keep your team aligned with inline editing and history.",
    color: "#F97316",
  },
  {
    icon: "📊",
    title: "Visual Analytics",
    desc: "Pie charts, bar charts, and live conversion rate dashboards to keep your finger on the pulse.",
    color: "#22C55E",
  },
  {
    icon: "🔍",
    title: "Smart Search & Filter",
    desc: "Instantly find any lead by name, email, company, or pipeline status.",
    color: "#0EA5E9",
  },
  {
    icon: "🤖",
    title: "AI Assistant",
    desc: "Ask questions about your pipeline in plain English. Powered by Groq · Llama 3.",
    color: "#A855F7",
  },
  {
    icon: "⬇",
    title: "CSV Export",
    desc: "Download your complete lead database as a CSV file for external analysis anytime.",
    color: "#F43F5E",
  },
];

const STEPS = [
  { num: "01", title: "Create Account", desc: "Sign up in seconds. Your data is private and scoped to your account.", icon: "🔐" },
  { num: "02", title: "Add Leads",       desc: "Fill in lead details — name, email, company, deal value, and pipeline stage.", icon: "➕" },
  { num: "03", title: "Track Pipeline",  desc: "Move leads across stages: Prospect → Qualified → Proposal → Closed.", icon: "📋" },
  { num: "04", title: "Analyze & Win",   desc: "Use the Analytics dashboard to spot trends and improve conversion.", icon: "🎯" },
];

const TECH = ["React 18", "Spring Boot", "PostgreSQL", "Groq AI", "Recharts", "GSAP", "Lenis", "Vercel", "Render"];

function useInViewAbout(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.unobserve(el); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function AnimSection({ children, className = "", delay = 0 }) {
  const [ref, visible] = useInViewAbout();
  return (
    <div
      ref={ref}
      className={`abt-anim ${visible ? "abt-anim--in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function AboutPage() {
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Hero word-by-word animation on mount
  useEffect(() => {
    const words = heroRef.current?.querySelectorAll(".abt-hero-word");
    if (!words) return;
    words.forEach((w, i) => {
      setTimeout(() => {
        w.style.opacity = "1";
        w.style.transform = "translateY(0)";
      }, 100 + i * 80);
    });
  }, []);

  const orbX = mousePos.x * 0.02;
  const orbY = mousePos.y * 0.02;

  return (
    <div className="abt-root">
      {/* Ambient orbs */}
      <div
        className="abt-orb abt-orb-1"
        style={{ transform: `translate(${orbX}px, ${orbY}px)` }}
      />
      <div
        className="abt-orb abt-orb-2"
        style={{ transform: `translate(${-orbX * 0.7}px, ${-orbY * 0.7}px)` }}
      />
      <div className="abt-grid-bg" />

      {/* ── HERO ── */}
      <section className="abt-hero" ref={heroRef}>
        <div className="abt-hero-badge">
          <span className="abt-badge-pulse" />
          Sales Intelligence Platform
        </div>

        <h1 className="abt-hero-title">
          {"CRM Lite".split("").map((ch, i) => (
            <span
              key={i}
              className="abt-hero-word"
              style={{
                display: "inline-block",
                opacity: 0,
                transform: "translateY(40px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
                marginRight: ch === " " ? "0.3em" : "0",
              }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </h1>

        <p className="abt-hero-sub">
          A lightweight, full-stack CRM for modern sales teams. Track every lead,
          close more deals, and make data-driven decisions — without the bloat.
        </p>

        <div className="abt-hero-stats">
          {[
            { val: "5+", label: "Pipeline Stages" },
            { val: "∞",  label: "Leads Supported" },
            { val: "AI", label: "Powered Insights" },
          ].map((s) => (
            <div key={s.label} className="abt-hero-stat">
              <span className="abt-hero-stat-val">{s.val}</span>
              <span className="abt-hero-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT THE APP ── */}
      <section className="abt-section">
        <AnimSection className="abt-section-header">
          <div className="abt-tag">About the App</div>
          <h2 className="abt-section-title">Why CRM Lite?</h2>
        </AnimSection>

        <div className="abt-two-col">
          <AnimSection delay={100}>
            <div className="abt-card abt-card--glass">
              <div className="abt-card-icon">💡</div>
              <h3 className="abt-card-title">The Problem</h3>
              <p className="abt-card-body">
                Most CRMs are expensive, overcomplicated, or both. Small teams
                and solo founders need something that <strong>just works</strong> —
                zero setup friction, no per-seat pricing, no bloated feature set.
              </p>
            </div>
          </AnimSection>

          <AnimSection delay={200}>
            <div className="abt-card abt-card--glass">
              <div className="abt-card-icon">✅</div>
              <h3 className="abt-card-title">The Solution</h3>
              <p className="abt-card-body">
                CRM Lite is purpose-built for clarity. A clean pipeline, real-time
                analytics, AI-powered chat, and full data ownership. Everything you
                need. Nothing you don't.
              </p>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="abt-section abt-section--alt">
        <AnimSection className="abt-section-header">
          <div className="abt-tag">Features</div>
          <h2 className="abt-section-title">Everything your team needs</h2>
          <p className="abt-section-sub">
            Built with simplicity in mind. Every feature maps to a real workflow.
          </p>
        </AnimSection>

        <div className="abt-features-grid">
          {FEATURES.map((f, i) => (
            <AnimSection key={f.title} delay={i * 80}>
              <div className="abt-feature-card" style={{ "--feat-color": f.color }}>
                <div className="abt-feature-icon">{f.icon}</div>
                <h3 className="abt-feature-title">{f.title}</h3>
                <p className="abt-feature-desc">{f.desc}</p>
                <div className="abt-feature-glow" />
              </div>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="abt-section">
        <AnimSection className="abt-section-header">
          <div className="abt-tag">How It Works</div>
          <h2 className="abt-section-title">Up and running in minutes</h2>
        </AnimSection>

        <div className="abt-steps">
          {STEPS.map((step, i) => (
            <AnimSection key={step.num} delay={i * 120}>
              <div className="abt-step">
                <div className="abt-step-num">{step.num}</div>
                <div className="abt-step-icon">{step.icon}</div>
                <h3 className="abt-step-title">{step.title}</h3>
                <p className="abt-step-desc">{step.desc}</p>
                {i < STEPS.length - 1 && <div className="abt-step-arrow">→</div>}
              </div>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* ── DEVELOPER ── */}
      <section className="abt-section abt-section--alt">
        <AnimSection className="abt-section-header">
          <div className="abt-tag">Developer</div>
          <h2 className="abt-section-title">Built with purpose</h2>
        </AnimSection>

        <AnimSection delay={100}>
          <div className="abt-dev-card">
            <div className="abt-dev-avatar">PR</div>
            <div className="abt-dev-info">
              <h3 className="abt-dev-name">Prachi Rajput</h3>
              <p className="abt-dev-bio">
                Full-stack engineer passionate about clean UI and real-world engineering.
                CRM Lite demonstrates production-grade architecture from database design
                to cloud deployment.
              </p>
              <div className="abt-dev-links">
                <a href="https://github.com/Prachi088" target="_blank" rel="noreferrer" className="abt-dev-link">
                  <span>⌥</span> GitHub
                </a>
                <a href="https://linkedin.com/in/prachi-rajput-023985280" target="_blank" rel="noreferrer" className="abt-dev-link">
                  <span>in</span> LinkedIn
                </a>
              </div>
              <div className="abt-tech-stack">
                {TECH.map((t) => (
                  <span key={t} className="abt-tech-pill">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </AnimSection>
      </section>

      {/* ── FUTURE SCOPE ── */}
      <section className="abt-section">
        <AnimSection className="abt-section-header">
          <div className="abt-tag">Roadmap</div>
          <h2 className="abt-section-title">What's coming next</h2>
        </AnimSection>

        <div className="abt-roadmap">
          {[
            { icon: "📧", title: "Email Integration",     desc: "Send and track emails directly from each lead card." },
            { icon: "📅", title: "Calendar & Reminders",  desc: "Set follow-up reminders that sync with your calendar." },
            { icon: "👥", title: "Team Collaboration",    desc: "Assign leads, leave team notes, and manage roles." },
            { icon: "📱", title: "Mobile App",            desc: "Native iOS & Android apps for on-the-go pipeline management." },
          ].map((item, i) => (
            <AnimSection key={item.title} delay={i * 100}>
              <div className="abt-roadmap-item">
                <span className="abt-roadmap-icon">{item.icon}</span>
                <div>
                  <div className="abt-roadmap-title">{item.title}</div>
                  <div className="abt-roadmap-desc">{item.desc}</div>
                </div>
                <span className="abt-roadmap-badge">Soon</span>
              </div>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* ── VERSION FOOTER ── */}
      <div className="abt-version-bar">
        <span>CRM Lite v1.0</span>
        <span>·</span>
        <span>MIT License</span>
        <span>·</span>
        <span>© 2025 Prachi Rajput</span>
      </div>
    </div>
  );
}