import React, { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer
} from "recharts";
import LeadForm from "./components/LeadForm";
import LeadList from "./components/LeadList";
import "./App.css";

const API = "http://localhost:8080/api";

const STATUSES = ["PROSPECT", "QUALIFIED", "PROPOSAL", "CLOSED WON", "CLOSED LOST"];

const STATUS_COLORS_MAP = {
  PROSPECT:      "#6366F1",
  QUALIFIED:     "#F97316",
  PROPOSAL:      "#3B82F6",
  "CLOSED WON":  "#22C55E",
  "CLOSED LOST": "#F43F5E",
};

function App() {
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("leads");
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API}/leads`);
      const data = await res.json();
      setLeads(data);
    } catch {
      showToast("Could not connect to backend", "error");
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const addLead = async (form) => {
    try {
      const res = await fetch(`${API}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      await fetchLeads();
      showToast("Lead added successfully!");
      return true;
    } catch {
      showToast("Failed to add lead", "error");
      return false;
    }
  };

  const deleteLead = async (id) => {
    try {
      await fetch(`${API}/leads/${id}`, { method: "DELETE" });
      setLeads((l) => l.filter((x) => x.id !== id));
      showToast("Lead deleted");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const updateLead = async (id, form) => {
    try {
      const res = await fetch(`${API}/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      await fetchLeads();
      showToast("Lead updated!");
      return true;
    } catch {
      showToast("Failed to update", "error");
      return false;
    }
  };

  const counts = STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: leads.filter((l) => l.status === s).length }),
    {}
  );

  const filtered = leads.filter((l) => {
    const matchSearch =
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.company?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pieData = STATUSES
    .filter((s) => counts[s] > 0)
    .map((s) => ({ name: s, value: counts[s], color: STATUS_COLORS_MAP[s] }));

  const barData = STATUSES.map((s) => ({
    name: s,
    value: leads.filter((l) => l.status === s).reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0),
    color: STATUS_COLORS_MAP[s],
  }));




  const exportCSV = () => {
  const headers = ["ID", "Name", "Email", "Company", "Status", "Deal Value"];
  const rows = leads.map((l) => [
    l.id, l.name, l.email, l.company, l.status, l.dealValue || 0
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leads.csv";
  a.click();
  URL.revokeObjectURL(url);
};
  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-name">CRM Lite</div>
          <div className="brand-sub">Sales Pipeline</div>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: "leads", icon: "👥", label: "Leads" },
            { id: "add",   icon: "➕", label: "Add Lead" },
            { id: "stats", icon: "📊", label: "Analytics" },
          ].map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-pipeline">
          <div className="pipeline-label">PIPELINE</div>
          {STATUSES.map((s) => (
            <div key={s} className="pipeline-row">
              <span className="pipeline-status">{s}</span>
              <span className="pipeline-count" style={{ color: STATUS_COLORS_MAP[s] }}>
                {counts[s] || 0}
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {toast && (
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        )}

        <div className="page-header">
          <h1 className="page-title">
            {activeTab === "leads" ? "All Leads" : activeTab === "add" ? "Add New Lead" : "Analytics"}
          </h1>
      <div className="page-header-row">
  <p className="page-sub">{leads.length} total leads in your pipeline</p>
  {activeTab === "leads" && (
    <button className="btn-export" onClick={exportCSV}>⬇ Export CSV</button>
  )}
</div>    
    </div>

        {/* Analytics Tab */}
        {activeTab === "stats" && (
          <div className="stats-section">
            <div className="stat-grid">
              {[
                { label: "Total Leads",  value: leads.length,               icon: "👥", cls: "purple" },
                { label: "Prospect",     value: counts["PROSPECT"] || 0,    icon: "🔵", cls: "blue"   },
                { label: "Qualified",    value: counts["QUALIFIED"] || 0,   icon: "🟠", cls: "orange" },
                { label: "Proposal",     value: counts["PROPOSAL"] || 0,    icon: "🟣", cls: "purple" },
                { label: "Closed Won",   value: counts["CLOSED WON"] || 0,  icon: "🟢", cls: "green"  },
                { label: "Closed Lost",  value: counts["CLOSED LOST"] || 0, icon: "🔴", cls: "red"    },
              ].map((s) => (
                <div key={s.label} className={`stat-card stat-${s.cls}`}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="charts-row">
              <div className="chart-card">
                <div className="chart-title">Leads by Status</div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Leads"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <div className="chart-title">Deal Value by Status (₹)</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Deal Value"]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="conversion-card">
              <div className="conversion-title">Conversion Rate</div>
              <div className="conversion-rate">
                {leads.length ? Math.round(((counts["CLOSED WON"] || 0) / leads.length) * 100) : 0}%
              </div>
              <div className="conversion-sub">
                {counts["CLOSED WON"] || 0} of {leads.length} leads closed won
              </div>
              <div className="total-deal">
                Total Pipeline Value: ₹{leads.reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {activeTab === "add" && <LeadForm onAdd={addLead} />}

        {activeTab === "leads" && (
          <LeadList
            leads={filtered}
            search={search}
            setSearch={setSearch}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onDelete={deleteLead}
            onUpdate={updateLead}
          />
        )}
      </main>
    </div>
  );
}

export default App;