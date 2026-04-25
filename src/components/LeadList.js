import React, { useState, useEffect, useCallback, useRef } from "react";
import gsap from "gsap";
import {
  Search, Filter,
  X, MessageSquarePlus,
  ChevronDown, ChevronUp,
  Mail, Building2, DollarSign, StickyNote, Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = process.env.REACT_APP_API_URL;
const STATUSES = ["PROSPECT", "QUALIFIED", "PROPOSAL", "CLOSED WON", "CLOSED LOST"];

const STATUS_COLORS = {
  PROSPECT:      { bg: "#EEF2FF", text: "#4338CA", dot: "#6366F1" },
  QUALIFIED:     { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
  PROPOSAL:      { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  "CLOSED WON":  { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
  "CLOSED LOST": { bg: "#FFF1F2", text: "#BE123C", dot: "#F43F5E" },
};

const AVATAR_COLORS = ["#6366F1","#F97316","#22C55E","#F43F5E","#0EA5E9","#A855F7"];

function getLeadPriority(lead) {
  const now     = new Date();
  const created = new Date(lead.createdAt || Date.now());
  const days    = (now - created) / (1000 * 60 * 60 * 24);

  if (lead.dealValue > 50000) return { label: "High Value",      color: "#22C55E" };
  if (days > 7)               return { label: "Stale",           color: "#EF4444" };
  if (days > 3)               return { label: "Needs Attention", color: "#F59E0B" };
  return null;
}

// ── Avatar ────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";
  const color = AVATAR_COLORS[name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0];
  return (
    <div
      className="avatar"
      style={{ background: color + "22", border: `2px solid ${color}44`, color }}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────
function Badge({ status }) {
  const c = STATUS_COLORS[status] || { bg: "#F1F5F9", text: "#64748B", dot: "#94A3B8" };
  return (
    <span className="badge" style={{ background: c.bg, color: c.text }}>
      <span className="badge-dot" style={{ background: c.dot }} />
      {status}
    </span>
  );
}

// ── Notes ─────────────────────────────────────────────────────────
function Notes({ leadId, leadOwnerId, currentUserId }) {
  const [notes, setNotes]     = useState([]);
  const [text, setText]       = useState("");
  const [open, setOpen]       = useState(false);
  const [adding, setAdding]   = useState(false);
  const [noteError, setNoteError] = useState("");

  // FIX: use loose equality (==) to handle number vs string type mismatch from JSON.
  // Also treat any logged-in user as able to attempt adding — backend enforces ownership.
  // eslint-disable-next-line eqeqeq
  const isLoggedIn = Boolean(currentUserId);
// If owner info available from backend, compare; otherwise allow any logged-in user
// eslint-disable-next-line eqeqeq
const isOwner = isLoggedIn && (leadOwnerId ? currentUserId == leadOwnerId : true);

  const fetchNotes = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res   = await fetch(`${API}/notes/lead/${leadId}`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch {}
  }, [leadId]);

  // FIX: fetch notes when panel opens AND whenever leadId changes
  useEffect(() => {
    if (open) fetchNotes();
  }, [open, fetchNotes]);

  const addNote = async () => {
    if (!text.trim() || !isOwner || adding) return;
    setAdding(true);
    setNoteError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/notes/lead/${leadId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        // FIX: previously ignored the response — never knew if POST failed.
        // Now surface the error so the user knows something went wrong.
        const err = await res.json().catch(() => ({}));
        setNoteError(err.message || "Failed to add note");
        return;
      }

      // FIX: append the returned note directly to state instead of refetching.
      // This makes the note appear instantly without a round-trip.
      const saved = await res.json();
      setNotes((prev) => [...prev, saved]);
      setText("");
    } catch {
      setNoteError("Network error");
    } finally {
      setAdding(false);
    }
  };

  const deleteNote = async (id) => {
    if (!isOwner) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // FIX: optimistic removal — update UI immediately on success
        setNotes((n) => n.filter((x) => x.id !== id));
      }
    } catch {}
  };

  return (
    <div className="notes-section">
      <button className="btn-notes" onClick={() => setOpen(!open)}>
        <StickyNote size={13} strokeWidth={2} />
        {open ? "Hide Notes" : `Notes (${notes.length})`}
        {open
          ? <ChevronUp size={12} strokeWidth={2.5} />
          : <ChevronDown size={12} strokeWidth={2.5} />}
      </button>

      {open && (
        <div className="notes-body">

          {/* ── show add-note input for logged-in users; backend enforces ownership ── */}
          {isLoggedIn ? (
            <div className="notes-input-row">
              <input
                className="form-input notes-input"
                placeholder={isOwner ? "Add a note…" : "Only the lead owner can add notes"}
                value={text}
                onChange={(e) => { setText(e.target.value); setNoteError(""); }}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                disabled={adding || !isOwner}
                style={!isOwner ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              />
              <button className="btn-add-note" onClick={addNote} disabled={adding || !isOwner}
                style={!isOwner ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
                <MessageSquarePlus size={14} strokeWidth={2} />
                {adding ? "Adding…" : "Add"}
              </button>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
              Sign in to add notes
            </div>
          )}

          {/* Error feedback for note POST failures */}
          {noteError && (
            <div style={{ fontSize: 12, color: "#F43F5E", marginBottom: 6 }}>
              {noteError}
            </div>
          )}

          {notes.length === 0 ? (
            <div className="notes-empty">No activity yet — start by adding a note</div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="note-item"
                style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
              >
                {/* timeline dot */}
                <div style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: "#6366F1", marginTop: "6px", flexShrink: 0,
                }} />

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>
                    {note.createdBy?.email && (
                      <span style={{ fontWeight: 600, marginRight: 6 }}>
                        {note.createdBy.email}
                      </span>
                    )}
                    {new Date(note.createdAt || Date.now()).toLocaleString()}
                  </div>
                  <div className="note-content">{note.content}</div>
                </div>

                {/* ── only lead owner can delete notes ── */}
                {isOwner && (
                  <button
                    className="btn-delete-note"
                    onClick={() => deleteNote(note.id)}
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── LeadList ──────────────────────────────────────────────────────
function LeadList({ leads, search, setSearch, filterStatus, setFilterStatus, onRequestAuth }) {
  const { user: currentUser } = useAuth();
  const listRef = useRef(null);

  // Animate cards in on initial render / filter change
  useEffect(() => {
    if (!listRef.current) return;
    const cards = listRef.current.querySelectorAll(".lead-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" }
    );
  }, [leads.length]);

  return (
    <div>
      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">
            <Search size={15} strokeWidth={2} />
          </span>
          <input
            className="form-input"
            placeholder="Search by name, email or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ position: "relative", width: "160px", flexShrink: 0 }}>
          <span style={{
            position: "absolute", left: "10px", top: "50%",
            transform: "translateY(-50%)", color: "var(--text-muted)",
            pointerEvents: "none", display: "flex",
          }}>
            <Filter size={14} strokeWidth={2} />
          </span>
          <select
            className="form-input"
            style={{ paddingLeft: "32px", width: "100%" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="empty-state" style={{ textAlign: "center", padding: "40px" }}>
          <div className="empty-icon">
            <Users size={40} strokeWidth={1.2} />
          </div>
          <h3 style={{ marginBottom: "10px" }}>No leads yet</h3>
          <p style={{ color: "#6B7280", marginBottom: "20px" }}>
            Start by adding your first lead to track opportunities
          </p>
          <button className="btn-icon-text" onClick={() => onRequestAuth?.()}>
            + Add Lead
          </button>
          <button
            className="btn-icon-text"
            style={{ marginTop: "12px" }}
            onClick={() => onRequestAuth?.()}
          >
            Sign In to Add Leads
          </button>
        </div>
      ) : (
        <div className="lead-list" ref={listRef}>
          {leads.map((lead) => {
            const cardRef = React.createRef();

            // FIX: compute isOwner per lead using == (loose equality) to handle
            // number vs number comparison safely across JSON serialization.
            // eslint-disable-next-line eqeqeq
            return (
              <div key={lead.id} className="lead-card" ref={cardRef}>
                <div>
                    <div className="lead-row">
                      <Avatar name={lead.name} />
                      <div className="lead-info">
                        <div className="lead-name">
                          {lead.name}
                          {(() => {
                            const priority = getLeadPriority(lead);
                            return priority ? (
                              <span style={{
                                marginLeft: "8px", padding: "2px 8px",
                                fontSize: "10px", borderRadius: "6px",
                                background: priority.color, color: "#fff",
                              }}>
                                {priority.label}
                              </span>
                            ) : null;
                          })()}
                        </div>
                        <div className="lead-email">
                          <Mail size={11} strokeWidth={2} style={{ opacity: 0.5 }} />
                          {lead.email}
                        </div>
                        {lead.company && (
                          <div className="lead-company">
                            <Building2 size={11} strokeWidth={2} style={{ opacity: 0.5 }} />
                            {lead.company}
                          </div>
                        )}
                        {lead.dealValue && (
                          <div className="lead-deal">
                            <DollarSign size={11} strokeWidth={2.5} />
                            ₹{Number(lead.dealValue).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <Badge status={lead.status} />
                    </div>

                    {/* Notes — pass owner + currentUser for security */}
                    <Notes
                      leadId={lead.id}
                      leadOwnerId={lead.owner?.id}
                      currentUserId={currentUser?.id ?? currentUser?.userId}
                    />
                  </div>
                </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LeadList;