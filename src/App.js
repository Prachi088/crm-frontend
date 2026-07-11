import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createLead as createLeadRequest, fetchLeads as fetchLeadsRequest, fetchUpcomingTasks } from "./api/client";
import AuthModal from "./components/AuthModal";
import { useAuth } from "./context/AuthContext";
import {
  PieChart, Pie, BarChart, Bar,
  XAxis, YAxis, ResponsiveContainer,
  Cell, Tooltip,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  Target,
  ContactRound,
  CheckSquare,
  BarChart3,
  BarChart2,
  PlusCircle,
  Download,
  Moon,
  Sun,
  Scale,
  X,
  Menu,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trophy,
  CheckCircle,
  AlertCircle,
  UserCircle2,
  CalendarRange,
  UserPen,
  KeyRound,
  Info,
  Search,
  SlidersHorizontal,
  UserPlus,
  Bell,
} from "lucide-react";
import UserMenu from "./UserMenu";
import LeadForm from "./components/LeadForm";
import LeadList from "./components/LeadList";
import ProfilePage from "./components/ProfilePage";
import {
  ContactManagementPage,
  CustomerManagementPage,
  DashboardPage,
  TaskManagementPage,
} from "./components/CRMModules";
import LandingPage from "./LandingPage";
import ChatBox from "./ChatBox";
import TermsModal from "./TermsModal";
import AboutPage from "./AboutPage";
import GlobalFooter from "./Footer";
import { LEAD_STATUS_COLORS, LEAD_STATUSES, USER_ROLES, hasRole, normalizeLeadStatus } from "./constants/crm";
import "./App.css";

gsap.registerPlugin(ScrollTrigger);

const STATUSES = LEAD_STATUSES;
const STATUS_COLORS_MAP = LEAD_STATUSES.reduce((acc, status) => {
  acc[status] = LEAD_STATUS_COLORS[status].color;
  return acc;
}, {});

const NAV_ITEMS = [
  { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard", roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.SALES_REP] },
  { id: "customers", Icon: Users, label: "Customers", roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.SALES_REP] },
  { id: "leads", Icon: Target, label: "Leads" },
  { id: "contacts", Icon: ContactRound, label: "Contacts", roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER] },
  { id: "tasks", Icon: CheckSquare, label: "Tasks", roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.SALES_REP] },
  { id: "stats", Icon: BarChart3, label: "Analytics" },
];

// ── helper: auth headers ──────────────────────────────────────────
/* ─────────────────────────────────────────── */
/* ANALYTICS SECTION                           */
/* ─────────────────────────────────────────── */
const AnalyticsSection = React.memo(({ leads }) => {
  const sectionRef = useRef(null);

  const stats = useMemo(() => {
    const counts = STATUSES.reduce((acc, s) => {
      acc[s] = leads.filter((l) => normalizeLeadStatus(l.status) === s).length;
      return acc;
    }, {});

    const total    = leads.length;
    const pipeline = leads.reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);
    const won      = counts.Won  || 0;
    const lost     = counts.Lost || 0;
    const convRate = total ? Math.round((won / total) * 100) : 0;
    const avg      = total ? Math.round(pipeline / total) : 0;

    const pieData = STATUSES
      .filter((s) => counts[s] > 0)
      .map((s) => ({ name: s, value: counts[s], color: STATUS_COLORS_MAP[s] }));

    const barData = STATUSES.map((s) => ({
      name:     s.substring(0, 8),
      fullName: s,
      value:    leads
        .filter((l) => normalizeLeadStatus(l.status) === s)
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
  const [leads, setLeads]               = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [activeTab, setActiveTab]       = useState("leads");
  // const [search, setSearch]             = useState("");
  // const [filterStatus, setFilterStatus] = useState("ALL");
  const [isLoading, setIsLoading]       = useState(true);
  const [toast, setToast]               = useState(null);
  const [theme, setTheme]               = useState(() => localStorage.getItem("crm-theme") || "light");
  const [showLanding, setShowLanding]   = useState(true);
  const [showTerms, setShowTerms]       = useState(false);
  const [termsMode, setTermsMode]       = useState("view");
  const [showAuth, setShowAuth]         = useState(false);
  const [authMode, setAuthMode]         = useState("login");
  const [viewUserId, setViewUserId]     = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leadListRefreshKey, setLeadListRefreshKey] = useState(0);
  const [pendingLeadAction, setPendingLeadAction] = useState(null);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState({ from: "", to: "" });
  const [notificationLog, setNotificationLog] = useState(() => {
    try {
      const saved = localStorage.getItem("crm-notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [unreadCount, setUnreadCount] = useState(() =>
    notificationLog.filter((n) => !n.read).length
  );
  const { token, user, acceptTerms }    = useAuth();
  const customerPageRef                 = useRef(null);
  const contactPageRef                  = useRef(null);
  const taskPageRef                     = useRef(null);
  const leadListRef                     = useRef(null);
  const visibleNavItems = useMemo(
    () => NAV_ITEMS.filter((item) => !item.roles || hasRole(user, item.roles)),
    [user]
  );
  const canEditCustomers = hasRole(user, [USER_ROLES.ADMIN, USER_ROLES.MANAGER]);
  const canEditContacts = hasRole(user, [USER_ROLES.ADMIN, USER_ROLES.MANAGER]);
  const canEditTasks = hasRole(user, [USER_ROLES.ADMIN, USER_ROLES.MANAGER]);
  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeTab);
  const activeTabAllowed = !activeNavItem?.roles || hasRole(user, activeNavItem.roles);

  useEffect(() => {
    try {
      localStorage.setItem("crm-notifications", JSON.stringify(notificationLog.slice(0, 30)));
    } catch {
      // ignore storage errors
    }
  }, [notificationLog]);

  // Real notification log: every successful action (lead/customer/contact/task
  // create, update, delete, status change) pushes an entry via showToast().
  // This persists across reloads and accumulates instead of being recomputed
  // from a fixed snapshot of leads/tasks.
  const notifications = notificationLog;

  const handleNotificationClick = useCallback((tab) => {
    setActiveTab(tab);
    setShowLanding(false);
    setNotificationsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (token && user && !user.termsAccepted) {
      setShowLanding(false);
      setActiveTab("dashboard");
      setShowSettingsModal(false);
      setNotificationsOpen(false);
      setTermsMode("required");
      setShowTerms(true);
    }
  }, [token, user]);

  const showToast = useCallback((msg, type = "success", tab = "leads") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);

    if (type === "success") {
      setNotificationLog((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: msg,
          message: new Date().toLocaleString(),
          tab,
          read: false,
        },
        ...prev,
      ].slice(0, 30));
      setUnreadCount((c) => c + 1);
    }
  }, []);

  const openAuth = useCallback((mode = "login") => {
    setAuthMode(mode);
    setShowAuth(true);
  }, []);

  // ── fetch leads ───────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    try {
      const data = await fetchLeadsRequest();
      const items = Array.isArray(data) ? data : data?.leads || data?.content || [];
      setLeads(items);
    } catch (err) {
      showToast(err.message || "Failed to load leads", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!showLanding) fetchLeads();
  }, [showLanding, token, fetchLeads]);

  // ── fetch upcoming tasks (used to build the Reminder notification) ─────
  useEffect(() => {
    if (showLanding || !token) return;
    fetchUpcomingTasks()
      .then((data) => setUpcomingTasks(Array.isArray(data) ? data : []))
      .catch(() => setUpcomingTasks([]));
  }, [showLanding, token]);

  // NOTE: previously this effect force-redirected to "leads" whenever
  // activeTabAllowed was false, e.g.:
  //
  //   useEffect(() => {
  //     if (!activeTabAllowed) {
  //       setActiveTab("leads");
  //     }
  //   }, [activeTabAllowed]);
  //
  // That silently overrode ANY setActiveTab() call (including footer nav,
  // header nav, notification clicks, etc.) the instant activeTabAllowed
  // evaluated to false for the *current* user/role state. If `user` is
  // null/not-yet-loaded or the role string from the API doesn't match
  // USER_ROLES exactly, this fires on every tab change and silently
  // bounces the user back to "leads" with no visible error — which is
  // exactly the symptom you saw in production (works locally where your
  // cached session has the right role, breaks once a different/missing
  // user/role state is in play after a fresh deploy).
  //
  // We no longer auto-redirect here. Restricted tabs are instead handled
  // by the `!activeTabAllowed` branch in the render below, which shows a
  // clear "no permission" message without clobbering activeTab. This
  // makes the real auth/role problem visible instead of masking it as a
  // navigation bug.

  // ── add lead ──────────────────────────────────────────────────
  const addLead = useCallback(async (form) => {
    try {
      await createLeadRequest(form);
      await fetchLeads();
      showToast("Lead added!");
      setShowLanding(false);
      setActiveTab("leads");
      setLeadListRefreshKey((value) => value + 1);
      return true;
    } catch (err) {
      showToast(err.message || "Failed to add lead", "error");
      return false;
    }
  }, [fetchLeads, showToast]);

  // const filtered = useMemo(() => leads.filter((l) => {
  //   const q           = search.toLowerCase();
  //   const matchSearch =
  //     l.name?.toLowerCase().includes(q) ||
  //     l.email?.toLowerCase().includes(q) ||
  //     l.company?.toLowerCase().includes(q);
  //   const matchStatus = filterStatus === "ALL" || l.status === filterStatus;
  //   return matchSearch && matchStatus;
  // }), [leads, search, filterStatus]);

  const exportCSV = useCallback(() => {
    const headers = ["ID","Name","Email","Company","Status","Deal Value"];
    const rows    = leads.map((l) => [l.id, l.name, l.email, l.company || "", l.status, l.dealValue || 0]);
    const csv     = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const url     = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a       = Object.assign(document.createElement("a"), { href: url, download: "leads.csv" });
    a.click();
    URL.revokeObjectURL(url);
  }, [leads]);

  // ── Analytics: filter leads by date range ──────────────────────
  const analyticsLeads = useMemo(() => {
    if (!analyticsRange.from && !analyticsRange.to) return leads;
    return leads.filter((l) => {
      const created = new Date(l.createdAt || 0);
      if (analyticsRange.from && created < new Date(analyticsRange.from)) return false;
      if (analyticsRange.to && created > new Date(analyticsRange.to + "T23:59:59")) return false;
      return true;
    });
  }, [leads, analyticsRange]);

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("crm-theme", next);
  }, [theme]);

  const closeOverlays = useCallback(() => {
    setNotificationsOpen(false);
    setMobileMenuOpen(false);
  }, []);

  const toggleNotifications = useCallback(() => {
    setNotificationsOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnreadCount(0);
        setNotificationLog((log) => log.map((n) => (n.read ? n : { ...n, read: true })));
      }
      return next;
    });
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const openTerms = useCallback(() => {
    setTermsMode("view");
    setShowTerms(true);
    setNotificationsOpen(false);
  }, []);

  const handleAcceptTerms = useCallback(() => {
    acceptTerms?.();
    setTermsMode("view");
    setShowTerms(false);
  }, [acceptTerms]);

  const handleNavClick = useCallback((tabId) => {
    setActiveTab(tabId);
    setShowLanding(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const requestLeadAction = useCallback((action) => {
    setShowLanding(false);
    setActiveTab("leads");
    setPendingLeadAction(action);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!pendingLeadAction || showLanding || activeTab !== "leads") return;

    const timer = window.setTimeout(() => {
      if (pendingLeadAction === "search") {
        leadListRef.current?.focusSearch();
      }
      if (pendingLeadAction === "filters") {
        leadListRef.current?.focusFilters();
      }
      if (pendingLeadAction === "export") {
        if (leadListRef.current) {
          leadListRef.current.exportDisplayed();
        } else {
          exportCSV();
        }
      }
      setPendingLeadAction(null);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activeTab, exportCSV, pendingLeadAction, showLanding]);

  const handleUserMenuAction = useCallback((action) => {
    if (action === "profile") {
      setActiveTab("profile");
      setShowLanding(false);
      setShowSettingsModal(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (action === "settings") {
      setShowSettingsModal(true);
      setShowLanding(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (action === "terms") {
      setShowSettingsModal(false);
      setShowLanding(false);
      openTerms();
      setNotificationsOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [openTerms]);

  // Footer nav handler — maps footer nav ids to tab ids
  const handleFooterNav = useCallback((target) => {
    if (target === "landing") {
      setShowLanding(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const tabMap = { leads: "leads", analytics: "stats", about: "about" };
    const tabId = tabMap[target];
    if (tabId) {
      setShowLanding(false);
      setActiveTab(tabId);
      // Scroll to top when navigating to a new page
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const TAB_ICONS = {
    dashboard: LayoutDashboard,
    leads:   Target,
    add:     PlusCircle,
    customers: Users,
    contacts: ContactRound,
    tasks: CheckSquare,
    stats:   BarChart3,
    profile: UserCircle2,
    about:   Info,
  };

  const pageHeaderConfig = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Overview of your CRM",
      icon: LayoutDashboard,
      actions: [],
    },
    customers: {
      title: "Customers",
      subtitle: "Manage customer records",
      icon: Users,
      actions: [
        { label: "Add Customer", icon: UserPlus, onClick: () => customerPageRef.current?.openAdd() },
        { label: "Search", icon: Search, onClick: () => customerPageRef.current?.focusSearch() },
        { label: "Filters", icon: SlidersHorizontal, onClick: () => customerPageRef.current?.focusSearch() },
        { label: "Export", icon: Download, onClick: () => customerPageRef.current?.exportCsv() },
      ],
    },
    leads: {
      title: "Leads",
      subtitle: "Manage and track sales leads",
      icon: Target,
      actions: [
        { label: "Add Lead", icon: PlusCircle, onClick: () => handleNavClick("add") },
        { label: "Search", icon: Search, onClick: () => requestLeadAction("search") },
        { label: "Filters", icon: SlidersHorizontal, onClick: () => requestLeadAction("filters") },
        { label: "Export", icon: Download, onClick: () => requestLeadAction("export") },
      ],
    },
    contacts: {
      title: "Contacts",
      subtitle: "Manage customer contacts",
      icon: ContactRound,
      actions: [
        { label: "Add Contact", icon: PlusCircle, onClick: () => contactPageRef.current?.openAdd() },
        { label: "Search", icon: Search, onClick: () => contactPageRef.current?.focusSearch() },
        { label: "Filters", icon: SlidersHorizontal, onClick: () => contactPageRef.current?.focusSearch() },
      ],
    },
    tasks: {
      title: "Tasks",
      subtitle: "Manage tasks",
      icon: CheckSquare,
      actions: [
        { label: "Add Task", icon: PlusCircle, onClick: () => taskPageRef.current?.openAdd() },
        { label: "Search", icon: Search, onClick: () => taskPageRef.current?.focusSearch() },
        { label: "Filters", icon: SlidersHorizontal, onClick: () => taskPageRef.current?.focusSearch() },
      ],
    },
    stats: {
      title: "Analytics",
      subtitle: "CRM reports",
      icon: BarChart3,
      actions: [
        { label: "Date Range", icon: CalendarRange, onClick: () => setShowDateRangeModal(true) },
        { label: "Export Report", icon: Download, onClick: exportCSV },
      ],
    },
    profile: {
      title: "My Profile",
      subtitle: "Manage your account",
      icon: UserCircle2,
      actions: [
        { label: "Edit Profile", icon: UserPen, onClick: () => handleNavClick("profile") },
        { label: "Change Password", icon: KeyRound, onClick: () => handleNavClick("profile") },
      ],
    },
    about: {
      title: "About",
      subtitle: "Application information",
      icon: Info,
      actions: [],
    },
  };

  // Footer page mapping
  const footerPageMap = {
    leads:   "leads",
    add:     "leads",
    dashboard: "analytics",
    customers: "default",
    contacts: "default",
    tasks: "default",
    stats:   "analytics",
    profile: "profile",
    about:   "about",
  };

  const TabIcon = TAB_ICONS[activeTab] || LayoutDashboard;
  const activePageHeader = pageHeaderConfig[activeTab] || pageHeaderConfig.leads;

  return (
    <div className="app-layout">
      <main className="main-content" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {showSettingsModal && (
          <div className="settings-modal-backdrop" onClick={() => setShowSettingsModal(false)}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
              <div className="settings-modal__header">
                <div>
                  <p className="settings-modal__eyebrow">Preferences</p>
                  <h3 className="settings-modal__title">Account Settings</h3>
                </div>
                <button className="icon-btn" onClick={() => setShowSettingsModal(false)} aria-label="Close settings">
                  <Scale size={16} strokeWidth={1.8} />
                </button>
              </div>

              <div className="settings-modal__body">
                <div className="settings-section">
                  <div className="settings-section__title">Appearance</div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-row__label">Theme</div>
                      <div className="settings-row__desc">Switch between light and dark mode.</div>
                    </div>
                    <button className="btn-icon-text" onClick={toggleTheme}>
                      {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
                      <span className="btn-label">{theme === "light" ? "Dark" : "Light"}</span>
                    </button>
                  </div>
                </div>

                <div className="settings-section">
                  <div className="settings-section__title">Security</div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-row__label">Password</div>
                      <div className="settings-row__desc">Keep your account secure with regular updates.</div>
                    </div>
                    <button className="btn-icon-text" onClick={() => openAuth("login")}>
                      <KeyRound size={15} />
                      <span className="btn-label">Update</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="settings-modal__footer">
                <button className="btn-icon-text btn-secondary" onClick={() => setShowSettingsModal(false)}>
                  <span className="btn-label">Close</span>
                </button>
                <button className="btn-icon-text" onClick={() => setShowSettingsModal(false)}>
                  <CheckCircle size={15} />
                  <span className="btn-label">Done</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {showDateRangeModal && (
          <div className="settings-modal-backdrop" onClick={() => setShowDateRangeModal(false)}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 360 }}>
              <div className="settings-modal__header">
                <h3 className="settings-modal__title">Filter by Date Range</h3>
                <button className="icon-btn" onClick={() => setShowDateRangeModal(false)} aria-label="Close modal">
                  <X size={16} strokeWidth={1.8} />
                </button>
              </div>
              <div className="settings-modal__body">
                <div className="form-group">
                  <label className="form-label">From</label>
                  <input
                    className="form-input"
                    type="date"
                    value={analyticsRange.from}
                    onChange={(e) => setAnalyticsRange((r) => ({ ...r, from: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">To</label>
                  <input
                    className="form-input"
                    type="date"
                    value={analyticsRange.to}
                    onChange={(e) => setAnalyticsRange((r) => ({ ...r, to: e.target.value }))}
                  />
                </div>
              </div>
              <div className="settings-modal__footer">
                <button
                  className="btn-icon-text btn-secondary"
                  onClick={() => setAnalyticsRange({ from: "", to: "" })}
                >
                  <span className="btn-label">Clear</span>
                </button>
                <button
                  className="btn-icon-text"
                  onClick={() => setShowDateRangeModal(false)}
                >
                  <span className="btn-label">Apply</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className={`toast toast-${toast.type}`} role="alert">
            {toast.type === "success"
              ? <CheckCircle size={15} strokeWidth={2.5} />
              : <AlertCircle size={15} strokeWidth={2.5} />}
            <span>{toast.msg}</span>
          </div>
        )}

        {(!showLanding && activeTab !== "about") && (
          <header className="top-header">
            <button
              className="icon-btn mobile-menu-toggle"
              type="button"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={18} strokeWidth={1.8} />
            </button>
            <div className="top-header__brand">
              <div className="brand-logo">
                <span className="brand-dot" />
                <span className="brand-name">CRM Lite</span>
              </div>
              <span className="brand-sub">Sales Pipeline</span>
            </div>

            <nav className="top-nav desktop-nav" aria-label="Primary navigation">
              {visibleNavItems.map((item) => (
                <button
                  key={item.id}
                  className={`top-nav__item ${activeTab === item.id ? "active" : ""}`}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={activeTab === item.id ? "page" : undefined}
                >
                  <item.Icon size={16} strokeWidth={activeTab === item.id ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="top-header__actions">
              <button
                className="icon-btn notification-toggle"
                type="button"
                onClick={toggleNotifications}
                aria-label="View notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell size={16} strokeWidth={1.8} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>
              <button
                className="icon-btn"
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? <Moon size={16} strokeWidth={1.8} /> : <Sun size={16} strokeWidth={1.8} />}
              </button>
              {!token ? (
                <button type="button" className="btn-icon-text" onClick={() => openAuth("login")} title="Login / Register">
                  <Users size={15} />
                  <span className="btn-label">Login</span>
                </button>
              ) : (
                <UserMenu onSelect={handleUserMenuAction} />
              )}
              <button
                className="icon-btn terms-nav-toggle"
                type="button"
                onClick={openTerms}
                aria-label="View Terms and Conditions"
                title="Terms & Conditions"
              >
                <FileText size={16} strokeWidth={1.8} />
              </button>
            </div>

            <div className={`mobile-nav-panel ${mobileMenuOpen ? "open" : ""}`}>
              <nav className="top-nav mobile-nav" aria-label="Mobile primary navigation">
                {visibleNavItems.map((item) => (
                  <button
                    key={item.id}
                    className={`top-nav__item ${activeTab === item.id ? "active" : ""}`}
                    onClick={() => {
                      handleNavClick(item.id);
                      setMobileMenuOpen(false);
                    }}
                    aria-current={activeTab === item.id ? "page" : undefined}
                  >
                    <item.Icon size={16} strokeWidth={activeTab === item.id ? 2.2 : 1.8} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className={`notification-panel ${notificationsOpen ? "open" : ""}`}>
              <div className="notification-panel__header">
                <div>
                  <div className="notification-panel__title">Notifications</div>
                  <div className="notification-panel__subtitle">Recent account updates</div>
                </div>
                <button type="button" className="icon-btn" onClick={closeOverlays} aria-label="Close notifications">
                  <X size={16} strokeWidth={1.8} />
                </button>
              </div>
              <div className="notification-panel__list">
                {notifications.length === 0 ? (
                  <div className="notification-item notification-item--empty">
                    <div>
                      <div className="notification-item__title">You're all caught up</div>
                      <div className="notification-item__message">No new activity right now.</div>
                    </div>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <button
                      type="button"
                      className="notification-item notification-item--clickable"
                      key={item.id}
                      onClick={() => handleNotificationClick(item.tab)}
                    >
                      <div className="notification-item__icon" />
                      <div>
                        <div className="notification-item__title">{item.title}</div>
                        <div className="notification-item__message">{item.message}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </header>
        )}

        {!showLanding && activeTab !== "about" && (
          <div className="page-header">
            <div className="page-header__content">
              <div className="page-title-group">
                <div className="page-title-group__icon">
                  <TabIcon size={18} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="page-title">{activePageHeader.title}</h2>
                  <p className="page-sub">{activePageHeader.subtitle}</p>
                </div>
              </div>
              <div className="page-actions">
                {activePageHeader.actions.map((action) => (
                  <button key={action.label} className="btn-icon-text" onClick={action.onClick}>
                    <action.icon size={15} strokeWidth={2} />
                    <span className="btn-label">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showLanding ? (
          <LandingPage onEnter={() => setShowLanding(false)} />
        ) : activeTab === "about" ? (
          <AboutPage />
        ) : (
          <div className="content-wrapper" style={{ flex: 1 }}>
            {!activeTabAllowed ? (
              <div className="crm-alert crm-alert--error">
                <AlertCircle size={15} />
                You do not have permission to view this page.
              </div>
            ) : isLoading ? (
              <LoadingSkeleton />
            ) : activeTab === "dashboard" ? (
              token ? (
                <DashboardPage leads={leads} onToast={showToast} />
              ) : (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p>You must login to view your dashboard</p>
                  <button className="btn-icon-text" onClick={() => openAuth("login")}>
                    Login to Continue
                  </button>
                </div>
              )
            ) : activeTab === "stats" ? (
              <AnalyticsSection leads={analyticsLeads} />
            ) : activeTab === "customers" ? (
              token ? (
                <CustomerManagementPage ref={customerPageRef} canEdit={canEditCustomers} onToast={showToast} />
              ) : (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p>You must login to manage customers</p>
                  <button className="btn-icon-text" onClick={() => openAuth("login")}>Login to Continue</button>
                </div>
              )
            ) : activeTab === "contacts" ? (
              <ContactManagementPage ref={contactPageRef} canEdit={canEditContacts} onToast={showToast} />
            ) : activeTab === "tasks" ? (
              token ? (
                <TaskManagementPage ref={taskPageRef} canEdit={canEditTasks} onToast={showToast} />
              ) : (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p>You must login to manage tasks</p>
                  <button className="btn-icon-text" onClick={() => openAuth("login")}>Login to Continue</button>
                </div>
              )
            ) : activeTab === "profile" ? (
              token ? (
                <ProfilePage
                  viewUserId={viewUserId}
                  onBack={() => {
                    setViewUserId(null);
                    setActiveTab("leads");
                  }}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p>You must login to view your profile</p>
                  <button className="btn-icon-text" onClick={() => openAuth("login")}>
                    Login to Continue
                  </button>
                </div>
              )
            ) : activeTab === "add" ? (
              <LeadForm onAdd={addLead} onRequestAuth={openAuth} onCancel={() => handleNavClick("leads")} />
            ) : (
              <LeadList
                ref={leadListRef}
                leads={leads}
                refreshKey={leadListRefreshKey}
                onRequestAuth={openAuth}
                onToast={showToast}
                onOpenAddLead={() => setActiveTab("add")}
                onViewProfile={(userId) => {
                  setViewUserId(userId);
                  setActiveTab("profile");
                }}
              />
            )}
          </div>
        )}

        <GlobalFooter
          page={showLanding ? "landing" : footerPageMap[activeTab] || "default"}
          leadsCount={leads.length}
          user={user}
          onNavigate={handleFooterNav}
        />
      </main>

      <ChatBox leads={leads} />
      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={handleAcceptTerms}
        requireAcceptance={termsMode === "required" && !user?.termsAccepted}
        accepted={Boolean(user?.termsAccepted)}
      />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} initialMode={authMode} />}
    </div>
  );
}