import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Search,
  Filter,
  X,
  MessageSquarePlus,
  ChevronDown,
  ChevronUp,
  Mail,
  Building2,
  DollarSign,
  StickyNote,
  Users,
} from "lucide-react";
import {
  createLeadNote,
  deleteLeadNote,
  fetchLeadNotes,
} from "../api/client";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["PROSPECT", "QUALIFIED", "PROPOSAL", "CLOSED WON", "CLOSED LOST"];
const STATUS_COLORS = {
  PROSPECT: { bg: "#EEF2FF", text: "#4338CA", dot: "#6366F1" },
  QUALIFIED: { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
  PROPOSAL: { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  "CLOSED WON": { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
  "CLOSED LOST": { bg: "#FFF1F2", text: "#BE123C", dot: "#F43F5E" },
};
const AVATAR_COLORS = ["#6366F1", "#F97316", "#22C55E", "#F43F5E", "#0EA5E9", "#A855F7"];

function getLeadPriority(lead) {
  const now = new Date();
  const created = new Date(lead.createdAt || Date.now());
  const days = (now - created) / (1000 * 60 * 60 * 24);

  if (lead.dealValue > 50000) return { label: "High Value", color: "#22C55E" };
  if (days > 7) return { label: "Stale", color: "#EF4444" };
  if (days > 3) return { label: "Needs Attention", color: "#F59E0B" };
  return null;
}

function Avatar({ name }) {
  const initials = name
    ? name
        .split(" ")
        .map((chunk) => chunk[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";
  const color = AVATAR_COLORS[name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0];

  return (
    <div
      className="avatar"
      style={{ background: `${color}22`, border: `2px solid ${color}44`, color }}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );
}

function Badge({ status }) {
  const colors = STATUS_COLORS[status] || {
    bg: "#F1F5F9",
    text: "#64748B",
    dot: "#94A3B8",
  };

  return (
    <span className="badge" style={{ background: colors.bg, color: colors.text }}>
      <span className="badge-dot" style={{ background: colors.dot }} />
      {status}
    </span>
  );
}

function Notes({ leadId, currentUserId, onRequestAuth, onToast }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noteError, setNoteError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const isLoggedIn = Boolean(currentUserId);

  const resolveNoteError = useCallback(
    (error, fallbackMessage) => {
      if (error?.status === 401) {
        onRequestAuth?.("login");
        return "Session expired. Please sign in again.";
      }
      if (error?.status === 403) {
        return "You don't have permission to do this.";
      }
      return error?.message || fallbackMessage;
    },
    [onRequestAuth]
  );

  const loadNotes = useCallback(
    async ({ notify = false } = {}) => {
      setLoading(true);

      try {
        const data = await fetchLeadNotes(leadId);
        setNotes(Array.isArray(data) ? data : []);
        setNoteError("");
      } catch (error) {
        const message = resolveNoteError(error, "Failed to load notes");
        setNoteError(message);
        if (notify) {
          onToast?.(message, "error");
        }
      } finally {
        setLoading(false);
      }
    },
    [leadId, onToast, resolveNoteError]
  );

  useEffect(() => {
    if (open) {
      loadNotes();
    }
  }, [open, loadNotes]);

  const addNote = async () => {
    const content = text.trim();
    if (!content) {
      setNoteError("Note content cannot be empty");
      return;
    }
    if (!isLoggedIn || adding) return;

    setAdding(true);
    setNoteError("");

    try {
      await createLeadNote(leadId, { content });
      await loadNotes();
      setText("");
      onToast?.("Note added successfully!", "success");
    } catch (error) {
      setNoteError(resolveNoteError(error, "Failed to add note"));
    } finally {
      setAdding(false);
    }
  };

  const removeNote = async (noteId) => {
    if (deletingId) return;

    setDeletingId(noteId);
    setNoteError("");

    try {
      await deleteLeadNote(noteId);
      await loadNotes();
      onToast?.("Note deleted successfully!", "success");
    } catch (error) {
      setNoteError(resolveNoteError(error, "Failed to delete note"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="notes-section">
      <button className="btn-notes" onClick={() => setOpen((value) => !value)}>
        <StickyNote size={13} strokeWidth={2} />
        {open ? "Hide Notes" : `Notes (${notes.length})`}
        {open ? <ChevronUp size={12} strokeWidth={2.5} /> : <ChevronDown size={12} strokeWidth={2.5} />}
      </button>

      {open && (
        <div className="notes-body">
          {isLoggedIn ? (
            <div className="notes-input-row">
              <input
                className="form-input notes-input"
                placeholder="Add a note..."
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setNoteError("");
                }}
                onKeyDown={(event) => event.key === "Enter" && addNote()}
                disabled={adding}
              />
              <button className="btn-add-note" onClick={addNote} disabled={adding || !text.trim()}>
                <MessageSquarePlus size={14} strokeWidth={2} />
                {adding ? "Adding..." : "Add"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-icon-text"
              style={{ alignSelf: "flex-start" }}
              onClick={() => onRequestAuth?.("login")}
            >
              Sign in to add notes
            </button>
          )}

          {noteError && (
            <div style={{ fontSize: 12, color: "#F43F5E", marginBottom: 6 }}>{noteError}</div>
          )}

          {loading ? (
            <div className="notes-empty">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="notes-empty">No activity yet - start by adding a note</div>
          ) : (
            notes.map((note) => {
              const isNoteCreator =
                currentUserId != null &&
                note.createdBy?.id != null &&
                String(note.createdBy.id) === String(currentUserId);

              return (
                <div
                  key={note.id}
                  className="note-item"
                  style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#6366F1",
                      marginTop: "6px",
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", color: "#6B7280" }}>
                      {note.createdBy?.email && (
                        <span style={{ fontWeight: 600, marginRight: 6 }}>{note.createdBy.email}</span>
                      )}
                      {new Date(note.createdAt || Date.now()).toLocaleString()}
                    </div>
                    <div className="note-content">{note.content}</div>
                  </div>

                  {isNoteCreator && (
                    <button
                      className="btn-delete-note"
                      onClick={() => removeNote(note.id)}
                      title="Delete note"
                      disabled={deletingId === note.id}
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function LeadList({
  leads,
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  onRequestAuth,
  onToast,
  onOpenAddLead,
  onViewProfile,
}) {
  const { user: currentUser } = useAuth();
  const listRef = useRef(null);

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
      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">
            <Search size={15} strokeWidth={2} />
          </span>
          <input
            className="form-input"
            placeholder="Search by name, email or company..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div style={{ position: "relative", width: "160px", flexShrink: 0 }}>
          <span
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none",
              display: "flex",
            }}
          >
            <Filter size={14} strokeWidth={2} />
          </span>
          <select
            className="form-input"
            style={{ paddingLeft: "32px", width: "100%" }}
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
          >
            <option value="ALL">All Status</option>
            {STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
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
          <button
            className="btn-icon-text"
            onClick={() => (currentUser ? onOpenAddLead?.() : onRequestAuth?.("register"))}
          >
            + Add Lead
          </button>
        </div>
      ) : (
        <div className="lead-list" ref={listRef}>
          {leads.map((lead) => (
            <div key={lead.id} className="lead-card">
              <div>
                <div className="lead-row">
                  <div onClick={() => lead.owner?.id && onViewProfile?.(lead.owner.id)} style={{ cursor: lead.owner?.id ? "pointer" : "default" }} title={lead.owner?.id ? "View profile" : undefined}><Avatar name={lead.name} /></div>
                  <div className="lead-info">
                    <div className="lead-name">
                      {lead.name}
                      {(() => {
                        const priority = getLeadPriority(lead);
                        return priority ? (
                          <span
                            style={{
                              marginLeft: "8px",
                              padding: "2px 8px",
                              fontSize: "10px",
                              borderRadius: "6px",
                              background: priority.color,
                              color: "#fff",
                            }}
                          >
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
                        INR {Number(lead.dealValue).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <Badge status={lead.status} />
                </div>

                <Notes
                  leadId={lead.id}
                  currentUserId={currentUser?.id ?? currentUser?.userId}
                  onRequestAuth={onRequestAuth}
                  onToast={onToast}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LeadList;