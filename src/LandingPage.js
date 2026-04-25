 import React, { useEffect, useRef } from "react";
import "./LandingPage.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { icon: "👥", title: "Lead Management",  desc: "Add, edit, and track leads through your entire pipeline with ease." },
  { icon: "📊", title: "Analytics",        desc: "Pie charts, bar charts, and real-time conversion rate tracking." },
  { icon: "📝", title: "Notes",            desc: "Attach contextual notes to every lead so nothing slips through." },
  { icon: "🔍", title: "Search & Filter",  desc: "Instantly find any lead by name, email, company, or status." },
  { icon: "⬇",  title: "CSV Export",       desc: "Download your entire lead database as a CSV file anytime." },
  { icon: "₹",  title: "Deal Tracking",    desc: "Track deal values in INR and see total pipeline value at a glance." },
];

const PIPELINE = [
  { label: "Prospect",    color: "#6366F1" },
  { label: "Qualified",   color: "#F97316" },
  { label: "Proposal",    color: "#3B82F6" },
  { label: "Closed Won",  color: "#22C55E" },
  { label: "Closed Lost", color: "#F43F5E" },
];

function LandingPage({ onEnter }) {
  const lenisRef      = useRef(null);
  const cursorRef     = useRef(null);
  const heroTitleRef  = useRef(null);

  /* ── Lenis smooth scroll ── */
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  /* ── Cursor glow ── */
  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;
    const move = (e) => gsap.to(el, { x: e.clientX, y: e.clientY, duration: .6, ease: "power2.out" });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  /* ── All GSAP animations ── */
  useEffect(() => {
    const ctx = gsap.context(() => {

      /* HERO — badge + subtitle + cta fade up on load */
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.to(".hero-badge", { opacity: 1, y: 0, duration: .8, delay: .2 })
        .to(".hero-sub",    { opacity: 1, y: 0, duration: .8 }, "-=.4")
        .to(".hero-actions",{ opacity: 1, y: 0, duration: .7 }, "-=.4")
        .to(".hero-scroll-hint", { opacity: 1, duration: .6 }, "-=.2");

      /* HERO WORDS — staggered word-by-word reveal */
      gsap.to(".word", {
        opacity: 1,
        y: 0,
        duration: .9,
        ease: "power4.out",
        stagger: .08,
        delay: .3,
      });

      /* STATS — scroll triggered */
      gsap.to(".stat-item", {
        opacity: 1, y: 0,
        duration: .8,
        stagger: .15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top 80%",
        },
      });

      /* FEATURES left panel */
      gsap.to(".section-tag", {
        opacity: 1, duration: .6, stagger: .1,
        scrollTrigger: { trigger: ".features-section", start: "top 75%" },
      });
      gsap.to(".section-heading", {
        opacity: 1, y: 0, duration: .8,
        scrollTrigger: { trigger: ".features-section", start: "top 72%" },
      });
      gsap.to(".section-sub", {
        opacity: 1, y: 0, duration: .7,
        scrollTrigger: { trigger: ".features-section", start: "top 68%" },
      });

      /* FEATURE CARDS — scroll in from left one by one */
      gsap.to(".feature-card", {
        opacity: 1, x: 0,
        duration: .75,
        stagger: .12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 78%",
        },
      });

      /* PIPELINE section heading */
      gsap.to(".pipeline-section .section-tag", {
        opacity: 1, duration: .6,
        scrollTrigger: { trigger: ".pipeline-section", start: "top 78%" },
      });
      gsap.to(".pipeline-section .section-heading", {
        opacity: 1, y: 0, duration: .8,
        scrollTrigger: { trigger: ".pipeline-section", start: "top 75%" },
      });

      /* PIPELINE STEPS + ARROWS */
      gsap.to(".pipeline-step", {
        opacity: 1, x: 0,
        duration: .6,
        stagger: .15,
        ease: "back.out(1.4)",
        scrollTrigger: { trigger: ".pipeline-track", start: "top 80%" },
      });
      gsap.to(".pipeline-arrow", {
        opacity: 1,
        duration: .4,
        stagger: .15,
        delay: .3,
        scrollTrigger: { trigger: ".pipeline-track", start: "top 80%" },
      });

      /* ABOUT left text */
      gsap.to(".about-section .section-tag",    { opacity: 1, duration: .6, scrollTrigger: { trigger: ".about-section", start: "top 78%" } });
      gsap.to(".about-section .section-heading",{ opacity: 1, y: 0, duration: .8, scrollTrigger: { trigger: ".about-section", start: "top 75%" } });
      gsap.to(".about-section .section-sub",    { opacity: 1, y: 0, duration: .7, scrollTrigger: { trigger: ".about-section", start: "top 72%" } });

      /* ABOUT card slide in from right */
      gsap.to(".about-card", {
        opacity: 1, x: 0,
        duration: .9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".about-inner", start: "top 75%" },
      });

      /* ORB parallax */
      gsap.to(".orb-1", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".orb-2", {
        yPercent: -20,
        ease: "none",
        scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true },
      });

    });

    return () => ctx.revert();
  }, []);

  /* ── Split hero title into words ── */
  const renderTitle = () => {
    const line1 = ["Close", "more", "deals."];
    const line2 = ["Track", "every", "lead."];
    return (
      <>
        <span className="hero-line-break">
          {line1.map((w, i) => <span key={i} className={`word${w === "deals." ? " hero-accent" : ""}`}>{w}</span>)}
        </span>
        <span className="hero-line-break">
          {line2.map((w, i) => <span key={i} className={`word${w === "lead." ? " hero-accent" : ""}`}>{w}</span>)}
        </span>
      </>
    );
  };

  return (
    <div className="landing">
      <div className="cursor-glow" ref={cursorRef} />
      <div className="grid-overlay" />

      {/* NAV */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <span className="logo-dot" /> CRM Lite
        </div>
        <button className="landing-cta-nav" onClick={onEnter}>Dashboard →</button>
      </nav>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-bg-orb orb-1" />
        <div className="hero-bg-orb orb-2" />
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Sales Pipeline Management
          </div>
          <h1 className="hero-title" ref={heroTitleRef}>
            {renderTitle()}
          </h1>
          <p className="hero-sub">
            A lightweight CRM built for modern sales teams. Manage your pipeline,
            track deal values, add notes, and visualize performance — all in one place.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={onEnter}>
              Open Dashboard <span>→</span>
            </button>
            <button className="btn-ghost">
              View on GitHub
            </button>
          </div>
        </div>
        <div className="hero-scroll-hint">
          <div className="scroll-line" />
         </div>
      </section>

      {/* STATS */}
      <div className="stats-section">
        <div className="stats-inner">
          {[
            { num: "5",   suffix: "+", label: "Pipeline Stages" },
            { num: "∞",   suffix: "",  label: "Leads Supported" },
            { num: "100", suffix: "%", label: "Open Source" },
          ].map((s) => (
            <div key={s.label} className="stat-item">
              <div className="stat-num">{s.num}<span>{s.suffix}</span></div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="features-section">
        <div className="features-layout">
          <div className="features-left">
            <div className="section-tag">Features</div>
            <h2 className="section-heading">Everything your<br />team needs</h2>
            <p className="section-sub">
              Built with simplicity in mind. Every feature serves a real sales workflow — nothing bloated, nothing missing.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon-wrap">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PIPELINE */}
      <section className="pipeline-section">
        <div className="pipeline-inner">
          <div className="section-tag">Workflow</div>
          <h2 className="section-heading">Your pipeline, visualized</h2>
          <div className="pipeline-track">
            {PIPELINE.map((s, i) => (
              <React.Fragment key={s.label}>
                <div className="pipeline-step" style={{ transform: "translateX(-30px)" }}>
                  <div className="step-pill" style={{
                    background: s.color + "15",
                    border: `1.5px solid ${s.color}40`,
                    color: s.color,
                  }}>
                    <span className="step-dot" style={{ background: s.color }} />
                    {s.label}
                  </div>
                </div>
                {i < PIPELINE.length - 1 && <div className="pipeline-arrow" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section">
        <div className="about-inner">
          <div>
            <div className="section-tag">About</div>
            <h2 className="section-heading">Built with<br />purpose</h2>
            <p className="section-sub">
              A portfolio-grade full-stack project demonstrating real-world engineering — from database design to deployment.
            </p>
          </div>
          <div className="about-card">
            <p className="about-text">
              CRM Lite is built with <strong>React</strong> on the frontend and <strong>Spring Boot</strong> on the backend,
              backed by a <strong>PostgreSQL</strong> database on Neon, deployed via Render and Vercel.
              Designed to demonstrate full-stack software engineering skills that map directly to production systems.
            </p>
            <div className="tech-stack">
              {["React 18", "Spring Boot", "PostgreSQL", "Groq AI", "Recharts", "Vercel", "Render"].map((t) => (
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
        </div>
      </section>
{/* 
      FOOTER
      <footer className="landing-footer">
        // <span>© {new Date().getFullYear()} CRM Lite · MIT License</span>
        <button className="footer-cta" onClick={onEnter}>Open Dashboard →</button>
      </footer> */}
    </div>
  );
}

export default LandingPage;