import React, { useState } from "react";

const STATUSES = ["PROSPECT", "QUALIFIED", "PROPOSAL", "CLOSED WON", "CLOSED LOST"];

function LeadForm({ onAdd }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    dealValue: "",
    status: "PROSPECT",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email) return;
    setLoading(true);
    const ok = await onAdd(form);
    if (ok) setForm({ name: "", email: "", company: "", dealValue: "", status: "PROSPECT" });
    setLoading(false);
  };

  return (
    <div className="form-card">
      <div className="form-fields">

        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Prachi Rajput"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input
            className="form-input"
            type="email"
            placeholder="e.g. prachi@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Company</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Sati College"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Deal Value (₹)</label>
          <input
            className="form-input"
            type="number"
            placeholder="e.g. 50000"
            value={form.dealValue}
            onChange={(e) => setForm({ ...form, dealValue: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-input"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Adding..." : "Add Lead"}
        </button>

      </div>
    </div>
  );
}

export default LeadForm;