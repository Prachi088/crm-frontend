import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import gsap from "gsap";
import {
  Search,
  Filter,
  X,
  Edit2,
  Check,
  MessageSquarePlus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
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
  updateLeadNote,
  searchLeads,
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import { LEAD_STATUSES, LEAD_STATUS_COLORS, normalizeLeadStatus } from "../constants/crm";

const AVATAR_COLORS = ["#6366F1", "#F97316", "#22C55E", "#F43F5E", "#0EA5E9", "#A855F7"];
const PAGE_SIZE = 10;

function getLeadPriority(lead) {
  const now     = new Date();
  const created = new Date(lead.createdAt || Date.now());
  const days    = (now - created) / (1000 * 60 * 60 * 24);
  if (lead.dealValue > 50000) return { label: "High Value",      color: "#22C55E" };
  if (days > 7)               return { label: "Stale",           color: "#EF4444" };
  if (days > 3)               return { label: "Needs Attention", color: "#F59E0B" };
  return null;
}

function Avatar({ name }) {
  const initials = name
    ? name.split(" ").map((c) => c[0]).join("").slice(0, 2).toUpperCase()
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
  const label = normalizeLeadStatus(status);
  const statusColor = LEAD_STATUS_COLORS[label];
  const colors = statusColor
    ? { bg: statusColor.bg, text: statusColor.text, dot: statusColor.color }
    : { bg: "#F1F5F9", text: "#64748B", dot: "#94A3B8" };
  return (
    <span className="badge" style={{ background: colors.bg, color: colors.text }}>
      <span className="badge-dot" style={{ background: colors.dot }} />
      {label}
    </span>
  );
}

/* ─── Notes sub-component ─────────────────────────────────── */
function Notes({ leadId, currentUserId, onRequestAuth, onToast }) {
  const [notes,      setNotes]      = useState([]);
  const [text,       setText]       = useState("");
  const [open,       setOpen]       = useState(false);
  const [adding,     setAdding]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [noteError,  setNoteError]  = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [editingId,  setEditingId]  = useState(null);
  const [editText,   setEditText]   = useState("");
  const [savingId,   setSavingId]   = useState(null);
  const isLoggedIn = Boolean(currentUserId);

  const resolveNoteError = useCallback(
    (error, fallbackMessage) => {
      if (error?.status === 401) { onRequestAuth?.("login"); return "Session expired. Please sign in again."; }
      if (error?.status === 403) return "You don't have permission to do this.";
      return error?.message || fallbackMessage;
    },
    [onRequestAuth]
  );

  const syncNotes = useCallback((nextNotes) => {
    setNotes(Array.isArray(nextNotes) ? nextNotes : []);
  }, []);

  const loadNotes = useCallback(async ({ notify = false } = {}) => {
    setLoading(true);
    try {
      const data = await fetchLeadNotes(leadId);
      const nextNotes = Array.isArray(data) ? data : [];
      syncNotes(nextNotes);
      setNoteError("");
    } catch (error) {
      const message = resolveNoteError(error, "Failed to load notes");
      setNoteError(message);
      if (notify) onToast?.(message, "error");
    } finally {
      setLoading(false);
    }
  }, [leadId, onToast, resolveNoteError, syncNotes]);

  useEffect(() => { loadNotes({ notify: false }); }, [loadNotes]);
  useEffect(() => { if (open) loadNotes(); }, [open, loadNotes]);

  const addNote = async () => {
    const content = text.trim();
    if (!content) { setNoteError("Note content cannot be empty"); return; }
    if (!isLoggedIn || adding) return;
    setAdding(true); setNoteError("");
    try {
      const createdNote = await createLeadNote(leadId, { content });
      const optimisticNote = {
        id: createdNote?.id ?? `temp-${Date.now()}`,
        content,
        createdAt: createdNote?.createdAt ?? new Date().toISOString(),
        createdBy: createdNote?.createdBy ?? { id: currentUserId, email: "You" },
      };
      const nextNotes = [optimisticNote, ...notes];
      syncNotes(nextNotes);
      setOpen(true);
      setText("");
      await loadNotes({ notify: false });
      onToast?.("Note added successfully!", "success");
    } catch (error) {
      setNoteError(resolveNoteError(error, "Failed to add note"));
    } finally { setAdding(false); }
  };

  const removeNote = async (noteId) => {
    if (deletingId) return;
    setDeletingId(noteId); setNoteError("");
    try {
      await deleteLeadNote(noteId);
      const nextNotes = notes.filter((note) => note.id !== noteId);
      syncNotes(nextNotes);
      onToast?.("Note deleted successfully!", "success");
    } catch (error) {
      setNoteError(resolveNoteError(error, "Failed to delete note"));
    } finally { setDeletingId(null); }
  };

  const startEdit  = (note) => { setEditingId(note.id); setEditText(note.content); setNoteError(""); };
  const cancelEdit = ()     => { setEditingId(null); setEditText(""); };

  const saveEdit = async (noteId) => {
    if (!editText.trim()) { setNoteError("Note content cannot be empty"); return; }
    setSavingId(noteId); setNoteError("");
    try {
      await updateLeadNote(noteId, { content: editText.trim() });
      const nextNotes = notes.map((note) =>
        note.id === noteId ? { ...note, content: editText.trim() } : note
      );
      syncNotes(nextNotes);
      setEditingId(null); setEditText("");
      onToast?.("Note updated successfully!", "success");
    } catch (error) {
      setNoteError(resolveNoteError(error, "Failed to update note"));
    } finally { setSavingId(null); }
  };

  return (
    <div className="notes-section">
      <button type="button" className="btn-notes" onClick={() => setOpen((v) => !v)}>
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
                onChange={(e) => { setText(e.target.value); setNoteError(""); }}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                disabled={adding}
              />
              <button type="button" className="btn-add-note" onClick={addNote} disabled={adding || !text.trim()}>
                <MessageSquarePlus size={14} strokeWidth={2} />
                {adding ? "Adding..." : "Add"}
              </button>
            </div>
          ) : (
            <button type="button" className="btn-icon-text" style={{ alignSelf: "flex-start" }}
              onClick={() => onRequestAuth?.("login")}>
              Sign in to add notes
            </button>
          )}

          {noteError && <div style={{ fontSize: 12, color: "#F43F5E", marginBottom: 6 }}>{noteError}</div>}

          {loading ? (
            <div className="notes-empty">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="notes-empty">No activity yet - start by adding a note</div>
          ) : (
            notes.map((note) => {
              const isNoteCreator = currentUserId != null && note.createdBy?.id != null &&
                String(note.createdBy.id) === String(currentUserId);
              const isEditing  = editingId  === note.id;
              const isSaving   = savingId   === note.id;
              const isDeleting = deletingId === note.id;

              return (
                <div key={note.id} className="note-item" style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366F1", marginTop: "6px", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: 4 }}>
                      {note.createdBy?.email && <span style={{ fontWeight: 600, marginRight: 6 }}>{note.createdBy.email}</span>}
                      {new Date(note.createdAt || Date.now()).toLocaleString()}
                    </div>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input className="form-input notes-input" value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveEdit(note.id); if (e.key === "Escape") cancelEdit(); }}
                          autoFocus disabled={isSaving} style={{ flex: 1 }} />
                        <button type="button" className="btn-add-note" onClick={() => saveEdit(note.id)} disabled={isSaving || !editText.trim()} title="Save">
                          {isSaving ? "Saving..." : <><Check size={13} strokeWidth={2.5} /> Save</>}
                        </button>
                        <button type="button" className="btn-delete-note" onClick={cancelEdit} title="Cancel" disabled={isSaving}>
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <div className="note-content">{note.content}</div>
                    )}
                  </div>
                  {isNoteCreator && !isEditing && (
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button type="button" className="btn-delete-note" onClick={() => startEdit(note)} title="Edit note" disabled={isDeleting} style={{ color: "#6366F1" }}>
                        <Edit2 size={13} strokeWidth={2} />
                      </button>
                      <button type="button" className="btn-delete-note" onClick={() => removeNote(note.id)} title="Delete note" disabled={isDeleting}>
                        {isDeleting ? <span style={{ fontSize: 10 }}>...</span> : <X size={14} strokeWidth={2.5} />}
                      </button>
                    </div>
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

/* ─── LeadList ────────────────────────────────────────────── */
function escapeCsvValue(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const LeadList = forwardRef(function LeadList(
  { leads: allLeads, onRequestAuth, onToast, onOpenAddLead, onViewProfile, refreshKey = 0 },
  ref
) {
  const { user: currentUser } = useAuth();
  const listRef = useRef(null);
  const searchInputRef = useRef(null);
  const filterSelectRef = useRef(null);

  // ── pagination + search state ──────────────────────────────
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [page,         setPage]         = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalElements,setTotalElements]= useState(0);
  const [leads,        setLeads]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [debounced,    setDebounced]    = useState("");

  // debounce search input 400ms
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // reset to page 0 when search or filter changes
  useEffect(() => { setPage(0); }, [debounced, filterStatus]);

  // fetch from backend
  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchLeads({
        q:      debounced,
        status: filterStatus,
        page,
        size:   PAGE_SIZE,
      });
      const items = data.leads || data.content || [];
      setLeads(items);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || items.length || 0);
    } catch (err) {
      const filtered = (allLeads || []).filter((lead) => {
        const query = debounced.toLowerCase();
        const matchesSearch =
          !query ||
          lead.name?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.company?.toLowerCase().includes(query);
        const matchesStatus = filterStatus === "ALL" || normalizeLeadStatus(lead.status) === filterStatus;
        return matchesSearch && matchesStatus;
      });
      setLeads(filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE));
      setTotalPages(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
      setTotalElements(filtered.length);
      onToast?.(err.message || "Failed to load leads", "error");
    } finally {
      setLoading(false);
    }
  }, [allLeads, debounced, filterStatus, page, onToast]);

  useEffect(() => { fetchPage(); }, [fetchPage, refreshKey]);

  useImperativeHandle(ref, () => ({
    focusSearch() {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    },
    focusFilters() {
      filterSelectRef.current?.focus();
    },
    exportDisplayed() {
      if (!leads.length) {
        onToast?.("No leads to export", "error");
        return false;
      }

      const headers = ["ID", "Name", "Email", "Company", "Status", "Deal Value", "Lead Source", "Follow-up Date"];
      const rows = leads.map((lead) => [
        lead.id,
        lead.name,
        lead.email,
        lead.company || "",
        normalizeLeadStatus(lead.status),
        lead.dealValue || 0,
        lead.leadSource || "",
        lead.followUpDate || "",
      ]);
      const csv = [headers, ...rows]
        .map((row) => row.map(escapeCsvValue).join(","))
        .join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: "leads.csv",
      });
      a.click();
      URL.revokeObjectURL(url);
      onToast?.("Leads exported", "success");
      return true;
    },
  }), [leads, onToast]);

  // animate cards
  useEffect(() => {
    if (!listRef.current) return;
    const cards = listRef.current.querySelectorAll(".lead-card");
    if (!cards.length) return;
    const tween = gsap.fromTo(cards,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power2.out", overwrite: true }
    );
    return () => {
      tween.kill();
      gsap.set(cards, { opacity: 1, y: 0 });
    };
  }, [leads]);

  return (
    <div>
      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon"><Search size={15} strokeWidth={2} /></span>
          <input
            ref={searchInputRef}
            className="form-input"
            placeholder="Search by name, email or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ position: "relative", width: "160px", flexShrink: 0 }}>
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none", display: "flex" }}>
            <Filter size={14} strokeWidth={2} />
          </span>
          <select className="form-input" style={{ paddingLeft: "32px", width: "100%" }}
            ref={filterSelectRef}
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">All Status</option>
            {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
          {totalElements} {totalElements === 1 ? "lead" : "leads"} found
          {debounced && ` for "${debounced}"`}
        </div>
      )}

      {/* Empty state */}
      {!loading && leads.length === 0 ? (
        <div className="empty-state" style={{ textAlign: "center", padding: "40px" }}>
          <div className="empty-icon"><Users size={40} strokeWidth={1.2} /></div>
          <h3 style={{ marginBottom: "10px" }}>
            {debounced ? `No leads found for "${debounced}"` : "No leads yet"}
          </h3>
          <p style={{ color: "#6B7280", marginBottom: "20px" }}>
            {debounced ? "Try a different search term" : "Start by adding your first lead to track opportunities"}
          </p>
          {!debounced && (
            <button className="btn-icon-text"
              onClick={() => currentUser ? onOpenAddLead?.() : onRequestAuth?.("register")}>
              + Add Lead
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="lead-list" ref={listRef}>
            {loading ? (
              [1,2,3].map((i) => <div key={i} className="skeleton skeleton-card" />)
            ) : (
              leads.map((lead) => (
                <div key={lead.id} className="lead-card">
                  <div>
                    <div className="lead-row">
                      <div onClick={() => lead.owner?.id && onViewProfile?.(lead.owner.id)}
                        style={{ cursor: lead.owner?.id ? "pointer" : "default" }}
                        title={lead.owner?.id ? "View profile" : undefined}>
                        <Avatar name={lead.name} />
                      </div>
                      <div className="lead-info">
                        <div className="lead-name" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                          {lead.name}
                          {(() => {
                            const priority = getLeadPriority(lead);
                            return priority ? (
                              <span style={{ marginLeft: "8px", padding: "2px 8px", fontSize: "10px", borderRadius: "6px", background: priority.color, color: "#fff", whiteSpace: "nowrap" }}>
                                {priority.label}
                              </span>
                            ) : null;
                          })()}
                        </div>
                        <div className="lead-email"><Mail size={11} strokeWidth={2} style={{ opacity: 0.5 }} />{lead.email}</div>
                        {lead.company && <div className="lead-company"><Building2 size={11} strokeWidth={2} style={{ opacity: 0.5 }} />{lead.company}</div>}
                        {lead.leadSource && <div className="lead-company">Source: {lead.leadSource}</div>}
                        {lead.assignedSalesRep?.email && <div className="lead-company">Assigned: {lead.assignedSalesRep.email}</div>}
                        {lead.followUpDate && <div className="lead-company">Follow-up: {new Date(lead.followUpDate).toLocaleDateString()}</div>}
                        {lead.dealValue && <div className="lead-deal"><DollarSign size={11} strokeWidth={2.5} />INR {Number(lead.dealValue).toLocaleString()}</div>}
                        {lead.expectedRevenue && <div className="lead-deal">Expected INR {Number(lead.expectedRevenue).toLocaleString()}</div>}
                      </div>
                      <div style={{ alignSelf: "flex-start", flexShrink: 0 }}>
                        <Badge status={lead.status} />
                      </div>
                    </div>
                    <Notes
                      leadId={lead.id}
                      currentUserId={currentUser?.id ?? currentUser?.userId}
                      onRequestAuth={onRequestAuth}
                      onToast={onToast}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20 }}>
              <button
                className="btn-secondary"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                style={{ padding: "8px 14px" }}
              >
                <ChevronLeft size={15} /> Prev
              </button>

              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Page {page + 1} of {totalPages}
              </span>

              <button
                className="btn-secondary"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || loading}
                style={{ padding: "8px 14px" }}
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default LeadList;