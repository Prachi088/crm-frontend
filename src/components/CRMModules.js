import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  BarChart2,
  Calendar,
  CheckCircle,
  Edit2,
  Eye,
  Loader2,
  MessageSquarePlus,
  PlusCircle,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import {
  createContact,
  createCustomer,
  createCustomerNote,
  createTask,
  deleteContact,
  deleteCustomer,
  deleteTask,
  fetchContacts,
  fetchCustomerById,
  fetchCustomerNotes,
  fetchCustomers,
  fetchDashboardActivities,
  fetchDashboardSummary,
  fetchUpcomingTasks,
  searchContacts,
  searchCustomers,
  searchTasks,
  updateContact,
  updateCustomer,
  updateTask,
  updateTaskStatus,
} from "../api/client";
import { LEAD_STATUS_COLORS, LEAD_STATUSES, normalizeLeadStatus } from "../constants/crm";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PAGE_SIZE = 10;
const TASK_STATUSES = ["Open", "In Progress", "Completed", "Blocked"];
const CUSTOMER_STATUSES = ["ALL", "Active", "Prospect", "Inactive"];

function unwrapPage(data, key) {
  const items = data?.[key] || data?.content || (Array.isArray(data) ? data : []);
  return {
    items,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || items.length,
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value) {
  if (!value) return true; // empty is handled by required/NotBlank separately; don't double-warn
  return EMAIL_REGEX.test(value.trim());
}

// Extracts a human-readable message from an ApiError, preferring backend
// field-level validation errors (e.g. { email: "Please provide a valid email" })
// over the generic "Request failed with status 400" message.
function extractErrorMessage(error, fallback) {
  const data = error?.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const fieldMessages = Object.values(data).filter((value) => typeof value === "string");
    if (fieldMessages.length > 0) return fieldMessages.join(", ");
  }
  return error?.message || fallback;
}

function formatCurrency(value) {
  const number = Number(value) || 0;
  return `INR ${number.toLocaleString()}`;
}

function LoadingBlock() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
      <Loader2 size={26} style={{ animation: "spin 1s linear infinite", color: "var(--accent)" }} />
    </div>
  );
}

function ErrorBlock({ message }) {
  if (!message) return null;
  return (
    <div className="crm-alert crm-alert--error">
      <AlertCircle size={15} />
      {message}
    </div>
  );
}

function EmptyBlock({ icon: Icon = Users, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={38} strokeWidth={1.4} /></div>
      <div className="empty-text">{text}</div>
    </div>
  );
}

function SearchToolbar({ search, onSearch, filter, onFilter, filters, onAdd, addLabel, canAdd, searchInputRef }) {
  return (
    <div className="filter-bar">
      <div className="search-wrap">
        <span className="search-icon"><Search size={15} /></span>
        <input
          ref={searchInputRef}
          className="form-input"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search..."
        />
      </div>
      {filters?.length > 0 && (
        <select className="form-input filter-select" value={filter} onChange={(event) => onFilter(event.target.value)}>
          {filters.map((item) => <option key={item}>{item}</option>)}
        </select>
      )}
      {canAdd && (
        <button className="btn-icon-text" onClick={onAdd}>
          <PlusCircle size={15} />
          <span className="btn-label">{addLabel}</span>
        </button>
      )}
    </div>
  );
}

function Pager({ page, totalPages, onPage, disabled }) {
  if (totalPages <= 1) return null;
  return (
    <div className="crm-pager">
      <button className="btn-secondary" disabled={page === 0 || disabled} onClick={() => onPage(page - 1)}>Prev</button>
      <span>Page {page + 1} of {totalPages}</span>
      <button className="btn-secondary" disabled={page >= totalPages - 1 || disabled} onClick={() => onPage(page + 1)}>Next</button>
    </div>
  );
}

function ConfirmDialog({ title, message, onCancel, onConfirm }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onCancel}>x</button>
        </div>
        <div className="modal-body" style={{ color: "var(--text-secondary)", fontSize: 14 }}>{message}</div>
        <div className="modal-footer">
          <button className="btn-modal-close" onClick={onCancel}>Cancel</button>
          <button className="btn-delete" onClick={onConfirm}><Trash2 size={14} /> Delete</button>
        </div>
      </div>
    </div>
  );
}

function TimelineNotes({ customerId, canEdit, onToast }) {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCustomerNotes(customerId);
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      onToast?.(error.message || "Failed to load notes", "error");
    } finally {
      setLoading(false);
    }
  }, [customerId, onToast]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!content.trim()) return;
    try {
      await createCustomerNote(customerId, { content: content.trim() });
      setContent("");
      await load();
      onToast?.("Note added", "success", "customers");
    } catch (error) {
      onToast?.(error.message || "Failed to add note", "error");
    }
  };

  return (
    <div className="crm-panel">
      <div className="crm-panel-title">Notes Timeline</div>
      {canEdit && (
        <div className="notes-input-row" style={{ marginBottom: 12 }}>
          <input className="form-input notes-input" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Add a note..." />
          <button className="btn-add-note" onClick={add}><MessageSquarePlus size={14} /> Add</button>
        </div>
      )}
      {loading ? <div className="notes-empty">Loading notes...</div> : notes.length === 0 ? (
        <div className="notes-empty">No notes yet</div>
      ) : (
        <div className="crm-timeline">
          {notes.map((note) => (
            <div className="crm-timeline-item" key={note.id}>
              <span className="crm-timeline-dot" />
              <div>
                <div className="crm-timeline-meta">{note.createdBy?.email || "Team"} · {new Date(note.createdAt || Date.now()).toLocaleString()}</div>
                <div className="note-content">{note.content}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardPage({ leads, onToast }) {
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [summaryData, activityData, upcomingTasks] = await Promise.all([
          fetchDashboardSummary(),
          fetchDashboardActivities(),
          fetchUpcomingTasks(),
        ]);
        setSummary(summaryData || {});
        setActivities(Array.isArray(activityData) ? activityData : []);
        setTasks(Array.isArray(upcomingTasks) ? upcomingTasks : []);
        setError("");
      } catch (err) {
        const totalRevenue = leads.reduce((sum, lead) => sum + (Number(lead.expectedRevenue ?? lead.dealValue) || 0), 0);
        setSummary({
          totalCustomers: 0,
          totalLeads: leads.length,
          activeDeals: leads.filter((lead) => !["Won", "Lost"].includes(normalizeLeadStatus(lead.status))).length,
          pendingTasks: 0,
          revenue: totalRevenue,
          leadStatus: LEAD_STATUSES.map((status) => ({
            name: status,
            value: leads.filter((lead) => normalizeLeadStatus(lead.status) === status).length,
          })),
          monthlyLeads: [],
        });
        setActivities([]);
        setTasks([]);
        setError(err.message || "Dashboard API unavailable. Showing lead fallback data.");
        onToast?.(err.message || "Failed to load dashboard", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [leads, onToast]);

  const leadStatusData = summary?.leadStatusCounts
    ? Object.entries(summary.leadStatusCounts)
        .map(([name, value]) => ({ name, value }))
        .filter((entry) => entry.value > 0)
    : (summary?.leadStatus || summary?.leadStatusChart || []);
  const monthlyLeadsData = summary?.monthlyLeadStats || summary?.monthlyLeads || [];
  const cards = [
    ["Total Customers", summary?.totalCustomers ?? 0],
    ["Total Leads", summary?.totalLeads ?? leads.length],
    ["Active Deals", summary?.activeDeals ?? 0],
    ["Pending Tasks", summary?.pendingTasks ?? tasks.length],
    ["Revenue", formatCurrency(summary?.totalRevenue ?? summary?.revenue ?? 0)],
  ];

  if (loading) return <LoadingBlock />;

  return (
    <div className="analytics-container">
      <ErrorBlock message={error} />
      <div className="stat-grid crm-stat-grid">
        {cards.map(([label, value]) => (
          <div className="stat-card" style={{ opacity: 1 }} key={label}>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
      <div className="analytics-section">
        <div className="chart-card" style={{ opacity: 1 }}>
          <div className="chart-title"><span>Lead Status</span><span className="chart-subtitle">count</span></div>
          <div className="chart-container">
            {leadStatusData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={leadStatusData} dataKey="value" nameKey="name" outerRadius={78}>
                    {leadStatusData.map((entry) => <Cell key={entry.name} fill={LEAD_STATUS_COLORS[entry.name]?.color || "var(--accent)"} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyBlock icon={BarChart2} text="No lead status data" />}
          </div>
        </div>
        <div className="chart-card" style={{ opacity: 1 }}>
          <div className="chart-title"><span>Monthly Leads</span><span className="chart-subtitle">new</span></div>
          <div className="chart-container">
            {monthlyLeadsData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyLeadsData}>
                  <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyBlock icon={BarChart2} text="No monthly lead data" />}
          </div>
        </div>
        <div className="chart-card" style={{ opacity: 1 }}>
          <div className="chart-title"><span>Upcoming Tasks</span><span className="chart-subtitle">next</span></div>
          {tasks.length === 0 ? <div className="notes-empty">No upcoming tasks</div> : (
            <div className="crm-list-compact">
              {tasks.slice(0, 5).map((task) => (
                <div className="crm-compact-row" key={task.id}>
                  <span>{task.title}</span>
                  <small>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : task.status}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="crm-panel">
        <div className="crm-panel-title">Recent Activities</div>
        {activities.length === 0 ? <div className="notes-empty">No recent activities</div> : (
          <div className="crm-timeline">
            {activities.map((activity, index) => (
              <div className="crm-timeline-item" key={activity.id || index}>
                <span className="crm-timeline-dot" />
                <div>
                  <div className="crm-timeline-meta">{new Date(activity.createdAt || Date.now()).toLocaleString()}</div>
                  <div className="note-content">{activity.message || activity.description || activity.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    company: initial?.company || "",
    status: initial?.status || "Active",
  }));
  const [emailTouched, setEmailTouched] = useState(false);

  const emailError = emailTouched && form.email && !isValidEmail(form.email)
    ? "Please enter a valid email address (e.g. name@example.com)"
    : "";

  const handleSave = () => {
    setEmailTouched(true);
    if (form.email && !isValidEmail(form.email)) return;
    onSave(form);
  };

  return (
    <div className="form-card crm-form-card">
      {["name", "email", "phone", "company"].map((key) => (
        <div className="form-group" key={key}>
          <label className="form-label">{key[0].toUpperCase() + key.slice(1)}</label>
          <input
            className="form-input"
            type={key === "email" ? "email" : "text"}
            value={form[key]}
            onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
            onBlur={key === "email" ? () => setEmailTouched(true) : undefined}
          />
          {key === "email" && emailError && (
            <div className="form-error-text">{emailError}</div>
          )}
        </div>
      ))}
      <div className="form-group">
        <label className="form-label">Status</label>
        <select className="form-input" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
          {CUSTOMER_STATUSES.filter((item) => item !== "ALL").map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="edit-actions">
        <button className="btn-save" onClick={handleSave} disabled={Boolean(emailError)}><CheckCircle size={14} /> Save</button>
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function CustomerDetails({ customerId, canEdit, onBack, onToast }) {
  const [customer, setCustomer] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [customerData, contactData] = await Promise.all([
          fetchCustomerById(customerId),
          fetchContacts(customerId),
        ]);
        setCustomer(customerData);
        setContacts(Array.isArray(contactData) ? contactData : []);
      } catch (error) {
        onToast?.(error.message || "Failed to load customer", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [customerId, onToast]);

  if (loading) return <LoadingBlock />;
  if (!customer) return <EmptyBlock text="Customer not found" />;

  return (
    <div className="crm-stack">
      <button className="btn-icon-text" onClick={onBack}><ArrowLeft size={14} /> Back to Customers</button>
      <div className="lead-card">
        <div className="lead-name">{customer.name}</div>
        <div className="lead-email">{customer.email}</div>
        <div className="lead-company">{customer.company}</div>
      </div>
      <div className="crm-panel">
        <div className="crm-panel-title">Contacts</div>
        {contacts.length === 0 ? <div className="notes-empty">No contacts for this customer</div> : contacts.map((contact) => (
          <div className="crm-compact-row" key={contact.id}>
            <span>{contact.name}</span>
            <small>{contact.email || contact.phone}</small>
          </div>
        ))}
      </div>
      <TimelineNotes customerId={customerId} canEdit={canEdit} onToast={onToast} />
    </div>
  );
}

export const CustomerManagementPage = forwardRef(function CustomerManagementPage({ canEdit, onToast }, ref) {
  const [mode, setMode] = useState("list");
  const [selected, setSelected] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const searchInputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchCustomers({ q: search, status: filter, page, size: PAGE_SIZE });
      const pageData = unwrapPage(data, "customers");
      setCustomers(pageData.items);
      setTotalPages(pageData.totalPages);
    } catch (error) {
      onToast?.(error.message || "Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, onToast, page, search]);

  useEffect(() => { if (mode === "list") load(); }, [load, mode]);
  useEffect(() => { setPage(0); }, [search, filter]);

  const save = async (payload) => {
    try {
      if (selected) await updateCustomer(selected.id, payload);
      else await createCustomer(payload);
      setMode("list");
      setSelected(null);
      await load();
      onToast?.("Customer saved", "success", "customers");
    } catch (error) {
      onToast?.(extractErrorMessage(error, "Failed to save customer"), "error");
    }
  };

  const remove = async () => {
    try {
      await deleteCustomer(confirmDelete.id);
      setConfirmDelete(null);
      await load();
      onToast?.("Customer deleted", "success", "customers");
    } catch (error) {
      const raw = error.message || "";
      const isConstraintError = /constraint|foreign key|violates|SQL/i.test(raw);
      const message = isConstraintError
        ? `Cannot delete "${confirmDelete.name}" — it still has linked contacts. Remove or reassign those contacts first.`
        : raw || "Failed to delete customer";
      onToast?.(message, "error");
    }
  };

  const exportCsv = useCallback(() => {
    const headers = ["ID", "Name", "Email", "Company", "Status"];
    const rows = customers.map((c) => [c.id, c.name, c.email || "", c.company || "", c.status || ""]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "customers.csv" });
    a.click();
    URL.revokeObjectURL(url);
  }, [customers]);

  // Exposes header-button actions (Add Customer / Search / Filters / Export) to the
  // parent App.js, since this component owns the relevant state internally.
  useImperativeHandle(ref, () => ({
    openAdd: () => { setMode("add"); setSelected(null); },
    focusSearch: () => {
      setMode("list");
      searchInputRef.current?.focus();
      searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    exportCsv,
  }), [exportCsv]);

  if (mode === "add" || mode === "edit") {
    return <CustomerForm initial={selected} onSave={save} onCancel={() => { setMode("list"); setSelected(null); }} />;
  }
  if (mode === "details" && selected) {
    return <CustomerDetails customerId={selected.id} canEdit={canEdit} onBack={() => setMode("list")} onToast={onToast} />;
  }

  return (
    <div>
      <SearchToolbar
        search={search}
        onSearch={setSearch}
        filter={filter}
        onFilter={setFilter}
        filters={CUSTOMER_STATUSES}
        canAdd={canEdit}
        addLabel="Add Customer"
        onAdd={() => setMode("add")}
        searchInputRef={searchInputRef}
      />
      {loading ? <LoadingBlock /> : customers.length === 0 ? <EmptyBlock text="No customers found" /> : (
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Status</th><th /></tr></thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.company}</td>
                  <td><span className="badge">{customer.status}</span></td>
                  <td>
                    <div className="lead-actions">
                      <button className="btn-edit" onClick={() => { setSelected(customer); setMode("details"); }}><Eye size={13} /> View</button>
                      {canEdit && <button className="btn-edit" onClick={() => { setSelected(customer); setMode("edit"); }}><Edit2 size={13} /> Edit</button>}
                      {canEdit && <button className="btn-delete" onClick={() => setConfirmDelete(customer)}><Trash2 size={13} /> Delete</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} totalPages={totalPages} onPage={setPage} disabled={loading} />
      {confirmDelete && <ConfirmDialog title="Delete customer?" message={`Delete ${confirmDelete.name}? This cannot be undone.`} onCancel={() => setConfirmDelete(null)} onConfirm={remove} />}
    </div>
  );
});

function ContactForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    firstName: initial?.firstName || "",
    lastName: initial?.lastName || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    designation: initial?.designation || "",
    department: initial?.department || "",
    customerId: initial?.customerId || initial?.customer?.id || "",
  }));
  const [fieldErrors, setFieldErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingCustomers(true);
    fetchCustomers()
      .then((data) => {
        if (cancelled) return;
        const items = unwrapPage(data, "customers").items;
        setCustomers(Array.isArray(items) ? items : []);
      })
      .catch(() => { if (!cancelled) setCustomers([]); })
      .finally(() => { if (!cancelled) setLoadingCustomers(false); });
    return () => { cancelled = true; };
  }, []);

  const validate = (key, value) => {
    const trimmedValue = typeof value === "string" ? value.trim() : value;

    if (key === "firstName" && !trimmedValue) return "First name is required";
    if (key === "lastName" && !trimmedValue) return "Last name is required";
    if (key === "customerId" && !trimmedValue) return "Customer is required";
    if (key === "email" && trimmedValue && !isValidEmail(trimmedValue)) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const handleBlur = (key, value) => {
    const message = validate(key, value);
    setFieldErrors((prev) => ({ ...prev, [key]: message }));
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) handleBlur(key, value);
  };

  const handleSave = () => {
    const errors = {
      firstName: validate("firstName", form.firstName),
      lastName: validate("lastName", form.lastName),
      email: validate("email", form.email),
      customerId: validate("customerId", form.customerId),
    };

    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors);
      return;
    }

    onSave(form);
  };

  const fields = [
    { key: "firstName", label: "First Name", type: "text", required: true },
    { key: "lastName", label: "Last Name", type: "text", required: true },
    { key: "email", label: "Email", type: "email", required: false },
    { key: "phone", label: "Phone", type: "text", required: false },
    { key: "designation", label: "Designation", type: "text", required: false },
    { key: "department", label: "Department", type: "text", required: false },
  ];

  return (
    <div className="form-card crm-form-card">
      {fields.map(({ key, label, type, required }) => (
        <div className="form-group" key={key}>
          <label className="form-label">
            {label}
            {required && <span style={{ color: "#F43F5E", marginLeft: 2 }}>*</span>}
          </label>
          <input
            className="form-input"
            type={type}
            value={form[key]}
            onChange={(event) => handleChange(key, event.target.value)}
            onBlur={(event) => handleBlur(key, event.target.value)}
            aria-invalid={Boolean(fieldErrors[key])}
            style={fieldErrors[key] ? { borderColor: "#F43F5E" } : undefined}
          />
          {fieldErrors[key] && <div className="form-error-text">{fieldErrors[key]}</div>}
        </div>
      ))}

      <div className="form-group">
        <label className="form-label">
          Customer
          <span style={{ color: "#F43F5E", marginLeft: 2 }}>*</span>
        </label>
        <select
          className="form-input"
          value={form.customerId}
          onChange={(event) => handleChange("customerId", event.target.value)}
          onBlur={(event) => handleBlur("customerId", event.target.value)}
          disabled={loadingCustomers}
          style={fieldErrors.customerId ? { borderColor: "#F43F5E" } : undefined}
        >
          <option value="">{loadingCustomers ? "Loading customers..." : "Select a customer"}</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name || customer.company || `Customer #${customer.id}`}
            </option>
          ))}
        </select>
        {fieldErrors.customerId && <div className="form-error-text">{fieldErrors.customerId}</div>}
      </div>

      <div className="edit-actions">
        <button className="btn-save" onClick={handleSave}>Save</button>
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export const ContactManagementPage = forwardRef(function ContactManagementPage({ canEdit, onToast }, ref) {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("list");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchContacts({ q: search, page: 0, size: 50 });
      setContacts(unwrapPage(data, "contacts").items);
    } catch (error) {
      onToast?.(error.message || "Failed to load contacts", "error");
    } finally {
      setLoading(false);
    }
  }, [onToast, search]);

  useEffect(() => { if (mode === "list") load(); }, [load, mode]);

  const save = async (payload) => {
    try {
      if (selected) await updateContact(selected.id, payload);
      else await createContact(payload);
      setMode("list");
      setSelected(null);
      await load();
      onToast?.("Contact saved", "success", "contacts");
    } catch (error) {
      onToast?.(extractErrorMessage(error, "Failed to save contact"), "error");
    }
  };

  // Exposes header-button actions (Add Contact / Search / Filters) to the
  // parent App.js, since this component owns the relevant state internally.
  useImperativeHandle(ref, () => ({
    openAdd: () => { setMode("add"); setSelected(null); },
    focusSearch: () => {
      setMode("list");
      searchInputRef.current?.focus();
      searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  }), []);

  if (mode !== "list") return <ContactForm initial={selected} onSave={save} onCancel={() => { setMode("list"); setSelected(null); }} />;

  return (
    <div>
      <SearchToolbar search={search} onSearch={setSearch} canAdd={canEdit} addLabel="Add Contact" onAdd={() => setMode("add")} searchInputRef={searchInputRef} />
      {loading ? <LoadingBlock /> : contacts.length === 0 ? <EmptyBlock text="No contacts found" /> : (
        <div className="lead-list">
          {contacts.map((contact) => (
            <div className="lead-card" key={contact.id}>
              <div className="lead-row">
                <div className="lead-info">
                  <div className="lead-name">{[contact.firstName, contact.lastName].filter(Boolean).join(" ") || "Unnamed contact"}</div>
                  <div className="lead-email">{contact.email}</div>
                  <div className="lead-company">{contact.phone || contact.designation}</div>
                </div>
                {canEdit && <div className="lead-actions">
                  <button className="btn-edit" onClick={() => { setSelected(contact); setMode("edit"); }}><Edit2 size={13} /> Edit</button>
                  <button className="btn-delete" onClick={async () => { await deleteContact(contact.id, contact.customerId); await load(); onToast?.("Contact deleted", "success", "contacts"); }}><Trash2 size={13} /> Delete</button>
                </div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

function TaskForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    title: initial?.title || "",
    description: initial?.description || "",
    dueDate: initial?.dueDate || "",
    status: initial?.status || "Open",
    priority: initial?.priority || "Medium",
  }));

  return (
    <div className="form-card crm-form-card">
      {["title", "description", "dueDate"].map((key) => (
        <div className="form-group" key={key}>
          <label className="form-label">{key === "dueDate" ? "Due Date" : key[0].toUpperCase() + key.slice(1)}</label>
          <input type={key === "dueDate" ? "date" : "text"} className="form-input" value={form[key]} onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))} />
        </div>
      ))}
      <div className="form-group">
        <label className="form-label">Status</label>
        <select className="form-input" value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
          {TASK_STATUSES.map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Priority</label>
        <select className="form-input" value={form.priority} onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}>
          {["Low", "Medium", "High"].map((priority) => <option key={priority}>{priority}</option>)}
        </select>
      </div>
      <div className="edit-actions">
        <button className="btn-save" onClick={() => onSave(form)}>Save</button>
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export const TaskManagementPage = forwardRef(function TaskManagementPage({ canEdit, onToast }, ref) {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("dueDate");
  const [mode, setMode] = useState("list");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchTasks({ q: search, status: filter, sort, page: 0, size: 50 });
      setTasks(unwrapPage(data, "tasks").items);
    } catch (error) {
      onToast?.(error.message || "Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, onToast, search, sort]);

  useEffect(() => { if (mode === "list") load(); }, [load, mode]);

  const save = async (payload) => {
    try {
      if (selected) await updateTask(selected.id, payload);
      else await createTask(payload);
      setMode("list");
      setSelected(null);
      await load();
      onToast?.("Task saved", "success", "tasks");
    } catch (error) {
      onToast?.(error.message || "Failed to save task", "error");
    }
  };

  // Exposes header-button actions (Add Task / Search / Filters) to the
  // parent App.js, since this component owns the relevant state internally.
  useImperativeHandle(ref, () => ({
    openAdd: () => { setMode("add"); setSelected(null); },
    focusSearch: () => {
      setMode("list");
      searchInputRef.current?.focus();
      searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  }), []);

  if (mode !== "list") return <TaskForm initial={selected} onSave={save} onCancel={() => { setMode("list"); setSelected(null); }} />;

  return (
    <div>
      <SearchToolbar searchInputRef={searchInputRef} search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} filters={["ALL", ...TASK_STATUSES]} canAdd={canEdit} addLabel="Add Task" onAdd={() => setMode("add")} />
      <div className="filter-bar">
        <select className="form-input filter-select" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="dueDate">Sort by due date</option>
          <option value="priority">Sort by priority</option>
          <option value="createdAt">Sort by created date</option>
        </select>
      </div>
      {loading ? <LoadingBlock /> : tasks.length === 0 ? <EmptyBlock icon={Calendar} text="No tasks found" /> : (
        <div className="lead-list">
          {tasks.map((task) => (
            <div className="lead-card" key={task.id}>
              <div className="lead-row">
                <div className="lead-info">
                  <div className="lead-name">{task.title}</div>
                  <div className="lead-email">{task.description}</div>
                  <div className="lead-company">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"} · {task.priority}</div>
                </div>
                <select className="form-input filter-select" value={task.status} disabled={!canEdit} onChange={async (event) => { await updateTaskStatus(task.id, event.target.value); await load(); onToast?.(`Task status updated to "${event.target.value}"`, "success", "tasks"); }}>
                  {TASK_STATUSES.map((status) => <option key={status}>{status}</option>)}
                </select>
                {canEdit && <div className="lead-actions">
                  <button className="btn-edit" onClick={() => { setSelected(task); setMode("edit"); }}><Edit2 size={13} /> Edit</button>
                  <button className="btn-delete" onClick={async () => { await deleteTask(task.id); await load(); onToast?.("Task deleted", "success", "tasks"); }}><Trash2 size={13} /> Delete</button>
                </div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});