import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AuthModal from "./components/AuthModal";
import { useAuth } from "./context/AuthContext";
import {
  PieChart, Pie, BarChart, Bar,
  XAxis, YAxis, ResponsiveContainer,
  Cell, Tooltip,
} from "recharts";
import {
  Users,
  PlusCircle,
  BarChart2,
  Home,
  Download,
  Moon,
  Sun,
  Scale,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trophy,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import LeadForm from "./components/LeadForm";
import LeadList from "./components/LeadList";
import LandingPage from "./LandingPage";
import ChatBox from "./ChatBox";
import TermsModal from "./TermsModal";
import "./App.css";

gsap.registerPlugin(ScrollTrigger);

const API = process.env.REACT_APP_API_URL;

const STATUSES = ["PROSPECT", "QUALIFIED", "PROPOSAL", "CLOSED WON", "CLOSED LOST"];

const STATUS_COLORS_MAP = {
  PROSPECT:      "#6366F1",
  QUALIFIED:     "#F97316",
  PROPOSAL:      "#3B82F6",
  "CLOSED WON":  "#22C55E",
  "CLOSED LOST": "#F43F5E",
};

const NAV_ITEMS = [
  { id: "leads", Icon: Users,      label: "Leads" },
  { id: "add",   Icon: PlusCircle, label: "Add Lead" },
  { id: "stats", Icon: BarChart2,  label: "Analytics" },
];

// ── helper: auth headers ──────────────────────────────────────────
function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ─────────────────────────────────────────── */
/* ANALYTICS SECTION                           */
/* ─────────────────────────────────────────── */
const AnalyticsSection = React.memo(({ leads }) => {
  const sectionRef = useRef(null);

  const stats = useMemo(() => {
    const counts = STATUSES.reduce((acc, s) => {
      acc[s] = leads.filter((l) => l.status === s).length;
      return acc;
    }, {});

    const total    = leads.length;
    const pipeline = leads.reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);
    const won      = counts["CLOSED WON"]  || 0;
    const lost     = counts["CLOSED LOST"] || 0;
    const convRate = total ? Math.round((won / total) * 100) : 0;
    const avg      = total ? Math.round(pipeline / total) : 0;

    const pieData = STATUSES
      .filter((s) => counts[s] > 0)
      .map((s) => ({ name: s, value: counts[s], color: STATUS_COLORS_MAP[s] }));

    const barData = STATUSES.map((s) => ({
      name:     s.replace("CLOSED ", "").substring(0, 8),
      fullName: s,
      value:    leads
        .filter((l) => l.status === s)
        .reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0),
      color: STATUS_COLORS_MAP[s],
    }));

    return { counts, total, pipeline, won, lost, convRate, avg, pieData, barData };
  }, [leads]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".stat-card",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power2.out" }
      );
      gsap.fromTo(".chart-card",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.15 }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const fmt = (n) =>
    n >= 1_000_000 ? `₹${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000   ? `₹${(n / 1_000).toFixed(0)}K`
    : `₹${n}`;

  const TooltipStyle = {
    background:   "var(--bg-surface)",
    border:       "1px solid var(--border)",
    borderRadius: "10px",
    color:        "var(--text-primary)",
    fontSize:     "13px",
    boxShadow:    "var(--shadow-md)",
  };

  const kpiCards = [
    {
      Icon: Users, iconColor: "#6366F1", iconBg: "rgba(99,102,241,0.1)",
      label: "Total Leads", value: stats.total,
      change: stats.total > 0 ? "Active pipeline" : "No leads yet",
      positive: stats.total > 0,
      TrendIcon: stats.total > 0 ? TrendingUp : TrendingDown,
    },
    {
      Icon: DollarSign, iconColor: "#22C55E", iconBg: "rgba(34,197,94,0.1)",
      label: "Pipeline Value", value: fmt(stats.pipeline),
      change: `Avg ${fmt(stats.avg)} / lead`, positive: true,
      TrendIcon: TrendingUp,
    },
    {
      Icon: TrendingUp,
      iconColor: stats.convRate >= 20 ? "#22C55E" : "#F97316",
      iconBg:    stats.convRate >= 20 ? "rgba(34,197,94,0.1)" : "rgba(249,115,22,0.1)",
      label: "Conversion Rate", value: `${stats.convRate}%`,
      change: stats.convRate >= 20 ? "Strong performance" : "Room to improve",
      positive: stats.convRate >= 20,
      TrendIcon: stats.convRate >= 20 ? TrendingUp : TrendingDown,
    },
    {
      Icon: Trophy, iconColor: "#F59E0B", iconBg: "rgba(245,158,11,0.1)",
      label: "Closed Won", value: stats.won,
      change: `${stats.lost} lost · ${stats.total - stats.won - stats.lost} active`,
      positive: stats.won > 0,
      TrendIcon: stats.won > 0 ? TrendingUp : TrendingDown,
    },
  ];

  return (
    <div className="analytics-container" ref={sectionRef}>
      {/* KPI Cards */}
      <div className="stat-grid">
        {kpiCards.map((card) => (
          <div className="stat-card" key={card.label}>
            <div className="stat-card-header">
              <div className="stat-icon-wrap" style={{ background: card.iconBg }}>
                <card.Icon size={18} color={card.iconColor} strokeWidth={2} />
              </div>
              <div className={`stat-trend ${card.positive ? "positive" : "negative"}`}>
                <card.TrendIcon size={13} strokeWidth={2.5} />
                <span>{card.change}</span>
              </div>
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="analytics-section">
        {/* Pie */}
        <div className="chart-card">
          <div className="chart-title">
            <span>Pipeline Distribution</span>
            <span className="chart-subtitle">by stage</span>
          </div>
          <div className="chart-container">
            {stats.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData} cx="50%" cy="50%" outerRadius={80}
                    dataKey="value" animationDuration={500} animationEasing="ease-out"
                    label={({ name, value }) => `${name.substring(0, 4)}: ${value}`}
                    labelLine={false}
                  >
                    {stats.pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </div>
        </div>

        {/* Bar */}
        <div className="chart-card">
          <div className="chart-title">
            <span>Deal Value by Stage</span>
            <span className="chart-subtitle">₹ INR</span>
          </div>
          <div className="chart-container">
            {stats.barData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.barData} barCategoryGap="30%">
                  <XAxis dataKey="name"
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                  <Tooltip contentStyle={TooltipStyle}
                    formatter={(v, _, props) => [fmt(v), props.payload.fullName]} />
                  <Bar dataKey="value" radius={[4,4,0,0]} animationDuration={500}>
                    {stats.barData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </div>
        </div>

        {/* Stage breakdown */}
        <div className="chart-card">
          <div className="chart-title">
            <span>Stage Breakdown</span>
            <span className="chart-subtitle">health</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingTop: "8px" }}>
            {STATUSES.map((status) => {
              const count = stats.counts[status] || 0;
              const pct   = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={status}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>
                      {status}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      {count} ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill"
                      style={{ width: `${pct}%`, background: STATUS_COLORS_MAP[status] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

function EmptyChart() {
  return (
    <div className="empty-chart">
      <BarChart2 size={32} color="var(--text-muted)" strokeWidth={1.5} />
      <span>No data yet</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton skeleton-card" />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* MAIN APP                                    */
/* ─────────────────────────────────────────── */
export default function App() {
  const [leads, setLeads]             = useState([]);
  const [activeTab, setActiveTab]     = useState("leads");
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isLoading, setIsLoading]     = useState(true);
  const [toast, setToast]             = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme]             = useState(() => localStorage.getItem("crm-theme") || "light");
  const [showLanding, setShowLanding] = useState(true);
  const [showTerms, setShowTerms]     = useState(false);
  const [showAuth, setShowAuth]       = useState(false);
  const { token, logout }             = useAuth();
  const hamburgerRef                  = useRef(null);
  const navItemRefs                   = useRef({});

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── fetch leads — public, no auth needed ─────────────────────
  const fetchLeads = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/leads`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load leads", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!showLanding) fetchLeads();
  }, [showLanding, fetchLeads]);

  // Animate nav items on mount
  useEffect(() => {
    if (showLanding) return;
    setTimeout(() => {
      Object.values(navItemRefs.current).forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, duration: 0.4, delay: i * 0.07, ease: "power2.out" }
        );
      });
    }, 100);
  }, [showLanding]);

  // ── add lead — requires JWT ───────────────────────────────────
  const addLead = useCallback(async (form) => {
    try {
      const res = await fetch(`${API}/leads`, {
        method:  "POST",
        headers: authHeaders(),
        body:    JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      await fetchLeads();
      showToast("Lead added!");
      return true;
    } catch {
      showToast("Failed to add lead", "error");
      return false;
    }
  }, [fetchLeads, showToast]);

  // ── delete lead — requires JWT ────────────────────────────────
  const deleteLead = useCallback(async (id) => {
    try {
      const res = await fetch(`${API}/leads/${id}`, {
        method:  "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setLeads((prev) => prev.filter((l) => l.id !== id));
      showToast("Lead deleted");
    } catch {
      showToast("Failed to delete", "error");
    }
  }, [showToast]);

  // ── update lead — requires JWT ────────────────────────────────
  const updateLead = useCallback(async (id, form) => {
    try {
      const res = await fetch(`${API}/leads/${id}`, {
        method:  "PUT",
        headers: authHeaders(),
        body:    JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      await fetchLeads();
      showToast("Lead updated!");
      return true;
    } catch {
      showToast("Failed to update", "error");
      return false;
    }
  }, [fetchLeads, showToast]);

  const filtered = useMemo(() => leads.filter((l) => {
    const q           = search.toLowerCase();
    const matchSearch =
      l.name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.company?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "ALL" || l.status === filterStatus;
    return matchSearch && matchStatus;
  }), [leads, search, filterStatus]);

  const exportCSV = useCallback(() => {
    const headers = ["ID","Name","Email","Company","Status","Deal Value"];
    const rows    = leads.map((l) => [l.id, l.name, l.email, l.company || "", l.status, l.dealValue || 0]);
    const csv     = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const url     = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a       = Object.assign(document.createElement("a"), { href: url, download: "leads.csv" });
    a.click();
    URL.revokeObjectURL(url);
  }, [leads]);

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("crm-theme", next);
  }, [theme]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      const next = !prev;
      hamburgerRef.current?.classList.toggle("ham-open", next);
      return next;
    });
  }, []);

  const handleNavClick = useCallback((tabId, el) => {
    if (tabId === "add" && !token) {
      setShowAuth(true);
      return;
    }
    if (el) {
      gsap.fromTo(el, { scale: 0.94 }, { scale: 1, duration: 0.25, ease: "back.out(2)" });
    }
    setActiveTab(tabId);
    setSidebarOpen(false);
    hamburgerRef.current?.classList.remove("ham-open");
  }, [token]);

  const TAB_TITLES = { leads: "All Leads", add: "Add New Lead", stats: "Analytics" };
  const TAB_ICONS  = { leads: Users, add: PlusCircle, stats: BarChart2 };

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  const TabIcon = TAB_ICONS[activeTab];

  return (
    <div className="app-layout">
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={() => {
          setSidebarOpen(false);
          hamburgerRef.current?.classList.remove("ham-open");
        }}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`} aria-label="Main navigation">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <span className="brand-dot" />
            <span className="brand-name">CRM Lite</span>
          </div>
          <div className="brand-sub">Sales Pipeline</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              ref={(el) => { navItemRefs.current[item.id] = el; }}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => handleNavClick(item.id, navItemRefs.current[item.id])}
              aria-current={activeTab === item.id ? "page" : undefined}
            >
              <span className="nav-icon-wrap">
                <item.Icon
                  size={16}
                  strokeWidth={activeTab === item.id ? 2.5 : 1.8}
                  className="nav-svg-icon"
                />
              </span>
              <span className="nav-label">{item.label}</span>
              {activeTab === item.id && <span className="nav-active-bar" />}
            </button>
          ))}

          <div className="nav-item-spacer" />

          <button
            ref={(el) => { navItemRefs.current["home"] = el; }}
            className="nav-item"
            onClick={() => {
              const el = navItemRefs.current["home"];
              if (el) gsap.fromTo(el, { scale: 0.94 }, { scale: 1, duration: 0.25, ease: "back.out(2)" });
              setSidebarOpen(false);
              setShowLanding(true);
            }}
          >
            <span className="nav-icon-wrap">
              <Home size={16} strokeWidth={1.8} className="nav-svg-icon" />
            </span>
            <span className="nav-label">Home</span>
          </button>
        </nav>

        {/* Pipeline mini-stats */}
        <div className="sidebar-pipeline">
          <div className="pipeline-label">Pipeline</div>
          {STATUSES.map((s) => (
            <div key={s} className="pipeline-row">
              <span className="pipeline-dot" style={{ background: STATUS_COLORS_MAP[s] }} />
              <span className="pipeline-status">{s.replace("CLOSED ", "")}</span>
              <span
                className="pipeline-count"
                style={{ color: STATUS_COLORS_MAP[s], background: STATUS_COLORS_MAP[s] + "18" }}
              >
                {leads.filter((l) => l.status === s).length}
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Toast */}
        {toast && (
          <div className={`toast toast-${toast.type}`} role="alert">
            {toast.type === "success"
              ? <CheckCircle size={15} strokeWidth={2.5} />
              : <AlertCircle size={15} strokeWidth={2.5} />}
            <span>{toast.msg}</span>
          </div>
        )}

        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <button
              ref={hamburgerRef}
              className="hamburger-btn"
              onClick={toggleSidebar}
              aria-label="Toggle navigation"
              aria-expanded={sidebarOpen}
            >
              <span className="ham-line" />
              <span className="ham-line" />
              <span className="ham-line" />
            </button>
            <div className="topbar-title-wrap">
              <TabIcon size={18} color="var(--accent)" strokeWidth={2} />
              <h1 className="topbar-title">{TAB_TITLES[activeTab]}</h1>
            </div>
          </div>

          <div className="topbar-right">
            {activeTab === "leads" && (
              <button className="btn-icon-text" onClick={exportCSV} title="Export to CSV">
                <Download size={15} strokeWidth={2} />
                <span className="btn-label">Export CSV</span>
              </button>
            )}

            {!token ? (
              <button className="btn-icon-text" onClick={() => setShowAuth(true)} title="Login / Register">
                <Users size={15} />
                <span className="btn-label">Login</span>
              </button>
            ) : (
              <button className="btn-icon-text" onClick={logout} title="Logout">
                <Users size={15} />
                <span className="btn-label">Logout</span>
              </button>
            )}

            <button
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light"
                ? <Moon size={16} strokeWidth={1.8} />
                : <Sun  size={16} strokeWidth={1.8} />}
            </button>
            <button className="icon-btn" onClick={() => setShowTerms(true)} aria-label="Terms">
              <Scale size={16} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Page subtitle */}
        <div className="page-header">
          <p className="page-sub">
            {leads.length === 0
              ? "No leads yet — add your first to get started."
              : `${leads.length} ${leads.length === 1 ? "lead" : "leads"} in your pipeline`}
          </p>
        </div>

        {/* Content */}
        <div className="content-wrapper">
          {isLoading ? (
            <LoadingSkeleton />
          ) : activeTab === "stats" ? (
            <AnalyticsSection leads={leads} />
          ) : activeTab === "add" ? (
            token ? (
              <LeadForm onAdd={addLead} />
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>You must login to add leads</p>
                <button className="btn-icon-text" onClick={() => setShowAuth(true)}>
                  Login to Continue
                </button>
              </div>
            )
          ) : (
            <LeadList
              leads={filtered}
              search={search}
              setSearch={setSearch}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onDelete={deleteLead}
              onUpdate={updateLead}
              onRequestAuth={() => setShowAuth(true)}
            />
          )}
        </div>
      </main>

      <ChatBox leads={leads} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}