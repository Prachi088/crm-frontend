import React, { useState, useEffect } from "react";

const API = "https://crm-backend-production-3671.up.railway.app/api";

const STATUSES = ["PROSPECT", "QUALIFIED", "PROPOSAL", "CLOSED WON", "CLOSED LOST"];

const STATUS_COLORS = {
  PROSPECT:     { bg: "#EEF2FF", text: "#4338CA", dot: "#6366F1" },
  QUALIFIED:    { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
  PROPOSAL:     { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  "CLOSED WON": { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
  "CLOSED LOST":{ bg: "#FFF1F2", text: "#BE123C", dot: "#F43F5E" },
};

const AVATAR_COLORS = ["#6366F1","#F97316","#22C55E","#F43F5E","#0EA5E9","#A855F7"];

function Avatar({ name }) {
  const initials = name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "??";
  const color = AVATAR_COLORS[name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0];
  return (
    <div className="avatar" style={{ background: color + "22", border: `2px solid ${color}44`, color }}>
      {initials}
    </div>
  );
}

function Badge({ status }) {
  const c = STATUS_COLORS[status] || { bg: "#F1F5F9", text: "#64748B", dot: "#94A3B8" };
  return (
    <span className="badge" style={{ background: c.bg, color: c.text }}>
      <span className="badge-dot" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

function Notes({ leadId }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API}/notes/lead/${leadId}`);
      const data = await res.json();
      setNotes(data);
    } catch {}
  };

  useEffect(() => { if (open) fetchNotes(); }, [open]);

  const addNote = async () => {
    if (!text.trim()) return;
    try {
      await fetch(`${API}/notes/lead/${leadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      setText("");
      fetchNotes();
    } catch {}
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`${API}/notes/${id}`, { method: "DELETE" });
      setNotes((n) => n.filter((x) => x.id !== id));
    } catch {}
  };

  return (
    <div className="notes-section">
      <button className="btn-notes" onClick={() => setOpen(!open)}>
        {open ? "Hide Notes" : `Notes (${notes.length})`}
      </button>
      {open && (
        <div className="notes-body">
          <div className="notes-input-row">
            <input
              className="form-input notes-input"
              placeholder="Add a note..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
            />
            <button className="btn-add-note" onClick={addNote}>Add</button>
          </div>
          {notes.length === 0 ? (
            <div className="notes-empty">No notes yet</div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="note-item">
                <span className="note-content">{note.content}</span>
                <button className="btn-delete-note" onClick={() => deleteNote(note.id)}>✕</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function LeadList({ leads, search, setSearch, filterStatus, setFilterStatus, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const startEdit = (lead) => {
    setEditingId(lead.id);
    setEditForm(lead);
  };

  const saveEdit = async () => {
    const ok = await onUpdate(editingId, editForm);
    if (ok) setEditingId(null);
  };

  return (
    <div>
      {/* Filters */}
      <div className="filter-bar">
        <input
          className="form-input search-input"
          placeholder="Search by name, email or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-input filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">All Status</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* List */}
      {leads.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-text">No leads found</div>
        </div>
      ) : (
        <div className="lead-list">
          {leads.map((lead) => (
            <div key={lead.id} className="lead-card">
              {editingId === lead.id ? (
                <div className="edit-form">
                  {["name", "email", "company"].map((f) => (
                    <input
                      key={f}
                      className="form-input"
                      placeholder={f}
                      value={editForm[f] || ""}
                      onChange={(e) => setEditForm({ ...editForm, [f]: e.target.value })}
                    />
                  ))}
                  <input
                    className="form-input"
                    type="number"
                    placeholder="Deal Value (₹)"
                    value={editForm.dealValue || ""}
                    onChange={(e) => setEditForm({ ...editForm, dealValue: e.target.value })}
                  />
                  <select
                    className="form-input"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <div className="edit-actions">
                    <button className="btn-save" onClick={saveEdit}>Save</button>
                    <button className="btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="lead-row">
                    <Avatar name={lead.name} />
                    <div className="lead-info">
                      <div className="lead-name">{lead.name}</div>
                      <div className="lead-email">{lead.email}</div>
                      {lead.company && <div className="lead-company">{lead.company}</div>}
                      {lead.dealValue && (
                        <div className="lead-deal">₹{Number(lead.dealValue).toLocaleString()}</div>
                      )}
                    </div>
                    <Badge status={lead.status} />
                    <div className="lead-actions">
                      <button className="btn-edit" onClick={() => startEdit(lead)}>Edit</button>
                      <button className="btn-delete" onClick={() => onDelete(lead.id)}>Delete</button>
                    </div>
                  </div>
                  <Notes leadId={lead.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LeadList;