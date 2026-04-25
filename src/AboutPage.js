import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Users,
  TrendingUp,
  DollarSign,
  Trophy,
  Zap,
  Shield,
  Globe,
  BarChart2,
  CheckCircle,
  Star,
  Target,
  Lock,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import "./AboutPage.css";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

/* ─── Lenis smooth scroll (graceful if not installed) ─── */
let LenisClass = null;
try {
  // eslint-disable-next-line
  LenisClass = require("lenis").default || require("lenis");
} catch (_) {}

/* ─── Static demo data ────────────────────────────────── */
const MONTHLY_DATA = [
  { month: "Jan", leads: 12, revenue: 45 },
  { month: "Feb", leads: 18, revenue: 62 },
  { month: "Mar", leads: 25, revenue: 89 },
  { month: "Apr", leads: 31, revenue: 115 },
  { month: "May", leads: 28, revenue: 98 },
  { month: "Jun", leads: 42, revenue: 156 },
  { month: "Jul", leads: 38, revenue: 142 },
  { month: "Aug", leads: 55, revenue: 198 },
  { month: "Sep", leads: 61, revenue: 234 },
  { month: "Oct", leads: 73, revenue: 289 },
  { month: "Nov", leads: 68, revenue: 265 },
  { month: "Dec", leads: 89, revenue: 342 },
];

const RADAR_DATA = [
  { feature: "Lead Tracking", score: 95 },
  { feature: "Analytics", score: 88 },
  { feature: "Collaboration", score: 82 },
  { feature: "Automation", score: 76 },
  { feature: "Integrations", score: 71 },
  { feature: "Mobile UX", score: 90 },
];

const STATS = [
  { value: 10000, suffix: "+", label: "Leads Tracked", icon: Users, color: "#6366F1" },
  { value: 98, suffix: "%", label: "Uptime SLA", icon: Shield, color: "#22C55E" },
  { value: 342, suffix: "K", label: "Pipeline ₹ Managed", icon: DollarSign, color: "#F59E0B" },
  { value: 2500, suffix: "+", label: "Teams Onboard", icon: Globe, color: "#A855F7" },
];

const FEATURES = [
  {
    icon: Target,
    title: "Smart Lead Scoring",
    desc: "AI-driven scoring to prioritise your best opportunities and focus team effort where it matters most.",
    color: "#6366F1",
  },
  {
    icon: BarChart2,
    title: "Live Analytics",
    desc: "Real-time dashboards with drill-down charts so you always know where your pipeline stands.",
    color: "#22C55E",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Share notes, assign tasks, and keep everyone aligned with built-in shared context.",
    color: "#F59E0B",
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    desc: "Automate follow-ups, reminders, and status updates to reclaim hours every week.",
    color: "#F97316",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    desc: "Bank-grade encryption, role-based access control, and full audit logs keep your data safe.",
    color: "#A855F7",
  },
  {
    icon: RefreshCw,
    title: "Seamless Integrations",
    desc: "Connect with Gmail, Slack, WhatsApp and 50+ tools your team already uses daily.",
    color: "#3B82F6",
  },
];

const CRM_THEORY = [
  {
    icon: Target,
    title: "What is CRM?",
    desc: "Customer Relationship Management is a system designed to manage customer interactions, automate sales processes, and improve business relationships and profitability.",
    color: "#6366F1",
  },
  {
    icon: TrendingUp,
    title: "CRM Benefits",
    desc: "Boost productivity, improve customer satisfaction, increase sales, reduce costs, and make data-driven decisions with a unified platform for your entire team.",
    color: "#22C55E",
  },
  {
    icon: Target,
    title: "Best Practices",
    desc: "Track all customer interactions, maintain consistent communication, set clear goals, train your team regularly, and continuously optimize your workflow.",
    color: "#F59E0B",
  },
  {
    icon: Zap,
    title: "Key Features",
    desc: "Lead tracking, pipeline management, automated workflows, detailed analytics, team collaboration tools, and seamless integration with your existing systems.",
    color: "#A855F7",
  },
];

/* ─── Animated counter ──────────────────────────────────── */
function Counter({ target, suffix }) {
  const [display, setDisplay] = useState(0);
  const elRef = useRef(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true;
          const duration = 1800;
          const start = performance.now();
          const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 4);
            setDisplay(Math.round(ease * target));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={elRef}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Tooltip style ─────────────────────────────────────── */
const TT = {
  background: "var(--bg-surface, #1e2535)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  color: "var(--text-primary)",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function AboutPage() {
  const rootRef = useRef(null);
  const lenisRef = useRef(null);

  /* ── Lenis init ── */
  useEffect(() => {
    if (!LenisClass) return;
    const lenis = new LenisClass({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;
    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  /* ── GSAP animations ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Hero entrance — staggered reveal */
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .fromTo(".abt-hero-badge", { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.55 })
        .fromTo(
          ".abt-title",
          { opacity: 0, y: 50, skewY: 2 },
          { opacity: 1, y: 0, skewY: 0, duration: 0.85 },
          "-=0.25"
        )
        .fromTo(".abt-sub", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.65 }, "-=0.45")
        .fromTo(
          ".abt-pill",
          { opacity: 0, y: 20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.08 },
          "-=0.35"
        );

      /* Floating orbs continuous drift */
      gsap.to(".abt-orb-1", { y: -28, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".abt-orb-2", { y: 22, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.2 });
      gsap.to(".abt-orb-3", { y: -16, duration: 3.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.6 });
      gsap.to(".abt-orb-4", { y: 18, x: -10, duration: 4.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.9 });

      /* KPI stat cards */
      gsap.fromTo(
        ".abt-stat-card",
        { opacity: 0, y: 48, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.62,
          stagger: 0.11,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: ".abt-stats-grid", start: "top 82%" },
        }
      );

      /* Chart panels */
      gsap.fromTo(
        ".abt-chart-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: { trigger: ".abt-charts-row", start: "top 82%" },
        }
      );

      /* Feature cards */
      gsap.fromTo(
        ".abt-feat-card",
        { opacity: 0, y: 55, scale: 0.88 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.09,
          ease: "back.out(1.5)",
          scrollTrigger: { trigger: ".abt-features-grid", start: "top 82%" },
        }
      );

      /* Theory cards */
      gsap.fromTo(
        ".abt-theory-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: ".abt-theory-scroll", start: "top 82%" },
        }
      );

      /* Section headers */
      gsap.utils.toArray(".abt-section-header").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );
      });

      /* CTA card reveal */
      gsap.fromTo(
        ".abt-cta-card",
        { opacity: 0, scale: 0.94, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: ".abt-cta-card", start: "top 85%" },
        }
      );

      /* Divider lines draw-in */
      gsap.utils.toArray(".abt-divider").forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0, transformOrigin: "left" },
          {
            scaleX: 1,
            duration: 0.9,
            ease: "power2.inOut",
            scrollTrigger: { trigger: el, start: "top 90%" },
          }
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="abt-root" ref={rootRef}>
      {/* ── DECORATIVE ORBS ────────────────────────── */}
      <div className="abt-orb abt-orb-1" />
      <div className="abt-orb abt-orb-2" />
      <div className="abt-orb abt-orb-3" />
      <div className="abt-orb abt-orb-4" />

      {/* ── HERO ──────────────────────────────────── */}
      <section className="abt-hero">
        <div className="abt-hero-badge">
          <Star size={12} />
          <span>Trusted by 2,500+ Sales Teams Across India</span>
        </div>

        <h1 className="abt-title">
          The CRM built for<br />modern sales teams
        </h1>

        <p className="abt-sub">
          CRM Lite gives you everything you need to track leads, close deals,
          and grow revenue — without the enterprise bloat. Fast, simple, powerful.
        </p>

        <div className="abt-hero-cta">
          <div className="abt-pill">🇮🇳 Made in India</div>
          <div className="abt-pill">⚡ Real-time Sync</div>
          <div className="abt-pill">🔒 SOC-2 Compliant</div>
          <div className="abt-pill">🚀 5-min Setup</div>
        </div>
      </section>

      {/* ── KPI STATS ─────────────────────────────── */}
      <section className="abt-stats-grid">
        {STATS.map(({ value, suffix, label, icon: Icon, color }) => (
          <div className="abt-stat-card" key={label}>
            <div className="abt-stat-icon" style={{ background: color + "1a", color }}>
              <Icon size={20} strokeWidth={2} />
            </div>
            <div className="abt-stat-value" style={{ color }}>
              <Counter target={value} suffix={suffix} />
            </div>
            <div className="abt-stat-label">{label}</div>
          </div>
        ))}
      </section>

      <div className="abt-divider" />

      {/* ── CHARTS ────────────────────────────────── */}
      <section className="abt-chart-section">
        <div className="abt-section-header">
          <div className="abt-section-eyebrow">Platform Performance</div>
          <h2 className="abt-section-title">Growth in numbers</h2>
          <p className="abt-section-sub">
            Aggregate performance across all CRM Lite teams over the past year
          </p>
        </div>

        <div className="abt-charts-row">
          {/* Area chart – pipeline revenue + leads */}
          <div className="abt-chart-card">
            <div className="abt-chart-header">
              <div className="abt-chart-label">Monthly Pipeline & Leads</div>
              <div className="abt-chart-legend">
                <span className="abt-legend-dot" style={{ background: "#6366F1" }} /> Revenue ₹K
                <span className="abt-legend-dot" style={{ background: "#A855F7" }} /> Leads
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY_DATA} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gLead" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip contentStyle={TT} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fill="url(#gRev)"
                  name="Revenue ₹K"
                  dot={false}
                  activeDot={{ r: 5, fill: "#6366F1", strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#A855F7"
                  strokeWidth={2}
                  fill="url(#gLead)"
                  name="Leads"
                  dot={false}
                  activeDot={{ r: 4, fill: "#A855F7", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Radar chart – platform capability */}
          <div className="abt-chart-card">
            <div className="abt-chart-header">
              <div className="abt-chart-label">Platform Capability Scores</div>
              <div className="abt-chart-legend">
                <span className="abt-legend-dot" style={{ background: "#6366F1" }} /> Score / 100
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius={78}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="feature"
                  tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.22}
                  strokeWidth={2}
                />
                <Tooltip contentStyle={TT} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <div className="abt-divider" />

      {/* ── FEATURES ──────────────────────────────── */}
      <section className="abt-features-section">
        <div className="abt-section-header">
          <div className="abt-section-eyebrow">What's Inside</div>
          <h2 className="abt-section-title">Everything you need to close</h2>
          <p className="abt-section-sub">
            A complete toolkit for high-performing sales teams, with zero setup complexity
          </p>
        </div>

        <div className="abt-features-grid">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div className="abt-feat-card" key={title}>
              <div className="abt-feat-icon" style={{ background: color + "1a", color }}>
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <h3 className="abt-feat-title">{title}</h3>
              <p className="abt-feat-desc">{desc}</p>
              <div className="abt-feat-arrow" style={{ color }}>
                <ArrowUpRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="abt-divider" />

      {/* ── CRM THEORY ────────────────────────────────── */}
      <section className="abt-theory-section">
        <div className="abt-section-header">
          <div className="abt-section-eyebrow">CRM Fundamentals</div>
          <h2 className="abt-section-title">Understanding CRM</h2>
          <p className="abt-section-sub">
            Learn the core concepts and principles that make CRM the backbone of modern sales operations
          </p>
        </div>

        <div className="abt-theory-container">
          <div className="abt-theory-scroll">
            {[...CRM_THEORY, ...CRM_THEORY].map(({ icon: Icon, title, desc, color }, idx) => (
              <div className="abt-theory-card" key={`${title}-${idx}`}>
                <div className="abt-theory-icon" style={{ background: color + "1a", color }}>
                  <Icon size={24} strokeWidth={1.8} />
                </div>
                <h3 className="abt-theory-title">{title}</h3>
                <p className="abt-theory-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="abt-divider" />

      {/* ── CTA ───────────────────────────────────── */}
      <section className="abt-cta-section">
        <div className="abt-cta-card">
          <div className="abt-cta-orb" />
          <div className="abt-cta-badge">
            <Trophy size={13} color="#F59E0B" />
            <span>#1 CRM for growing Indian sales teams</span>
          </div>
          <h2 className="abt-cta-title">Start closing more deals today</h2>
          <p className="abt-cta-sub">
            Join thousands of sales teams already using CRM Lite to manage pipelines
            and grow revenue — faster than ever.
          </p>
          <div className="abt-cta-features">
            {["Free to start", "No credit card", "5-minute setup", "Cancel anytime"].map(
              (f) => (
                <div key={f} className="abt-cta-item">
                  <CheckCircle size={14} color="#22C55E" strokeWidth={2.5} />
                  <span>{f}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}