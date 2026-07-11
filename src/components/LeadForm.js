import React, { useRef, useState } from "react";
import gsap from "gsap";
import {
  User,
  Mail,
  Building2,
  DollarSign,
  Tag,
  UserPlus,
  Loader2,
  Lock,
  Calendar,
  Flag,
  Megaphone,
  UserCheck,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchUsers } from "../api/client";
import { LEAD_STATUSES, USER_ROLES } from "../constants/crm";

const EMPTY_FORM = {
  name: "",
  email: "",
  company: "",
  dealValue: "",
  status: "New",
  leadSource: "",
  assignedSalesRepId: "",
  expectedRevenue: "",
  followUpDate: "",
  priority: "Medium",
};

function LeadForm({ onAdd, onRequestAuth, onCancel }) {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [salesReps, setSalesReps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const cardRef = useRef(null);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    Promise.resolve(fetchUsers())
      .then((users) => {
        const reps = Array.isArray(users)
          ? users.filter((user) => user.role === USER_ROLES.SALES_REP || user.role === "ROLE_SALES_REP")
          : [];
        setSalesReps(reps);
      })
      .catch(() => setSalesReps([]));
  }, [isAuthenticated]);

  const validate = (key, value) => {
    const trimmedValue = typeof value === "string" ? value.trim() : value;

    if (key === "name" && !trimmedValue) return "Name is required";
    if (key === "email" && !trimmedValue) return "Email is required";
    if (key === "email" && trimmedValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
      return "Enter a valid email";
    }
    if (key === "dealValue" && trimmedValue !== "" && Number.isNaN(Number(trimmedValue))) {
      return "Must be a number";
    }
    if (key === "expectedRevenue" && trimmedValue !== "" && Number.isNaN(Number(trimmedValue))) {
      return "Must be a number";
    }
    return "";
  };

  const handleBlur = (key, value) => {
    const message = validate(key, value);
    setFieldErrors((prev) => ({ ...prev, [key]: message }));
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    onCancel?.();
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      gsap.fromTo(
        cardRef.current,
        { x: 0 },
        { x: [-6, 6, -4, 4, 0], duration: 0.4, ease: "power1.inOut" }
      );
      onRequestAuth?.("register");
      return;
    }

    const nameError = validate("name", form.name);
    const emailError = validate("email", form.email);
    const dealValueError = validate("dealValue", form.dealValue);
    const expectedRevenueError = validate("expectedRevenue", form.expectedRevenue);

    if (nameError || emailError || dealValueError || expectedRevenueError) {
      setFieldErrors({
        name: nameError,
        email: emailError,
        dealValue: dealValueError,
        expectedRevenue: expectedRevenueError,
      });
      return;
    }

    setLoading(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      dealValue: form.dealValue === "" ? null : Number(form.dealValue),
      status: form.status,
      leadSource: form.leadSource.trim(),
      assignedSalesRepId: form.assignedSalesRepId || null,
      expectedRevenue: form.expectedRevenue === "" ? null : Number(form.expectedRevenue),
      followUpDate: form.followUpDate || null,
      priority: form.priority,
    };

    const added = await onAdd(payload);

    if (added) {
      setForm(EMPTY_FORM);
      setFieldErrors({});
      gsap.fromTo(
        cardRef.current,
        { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
        { boxShadow: "0 0 0 6px rgba(34,197,94,0)", duration: 0.5, ease: "power2.out" }
      );
    }

    setLoading(false);
  };

  const fields = [
    {
      key: "name",
      label: "Full Name",
      required: true,
      type: "text",
      placeholder: "e.g. Prachi Rajput",
      Icon: User,
    },
    {
      key: "email",
      label: "Email Address",
      required: true,
      type: "email",
      placeholder: "e.g. prachi@example.com",
      Icon: Mail,
    },
    {
      key: "company",
      label: "Company",
      required: false,
      type: "text",
      placeholder: "e.g. Sati College",
      Icon: Building2,
    },
    {
      key: "leadSource",
      label: "Lead Source",
      required: false,
      type: "text",
      placeholder: "e.g. Website, Referral",
      Icon: Megaphone,
    },
    {
      key: "dealValue",
      label: "Deal Value (INR)",
      required: false,
      type: "number",
      placeholder: "e.g. 50000",
      Icon: DollarSign,
    },
    {
      key: "expectedRevenue",
      label: "Expected Revenue (INR)",
      required: false,
      type: "number",
      placeholder: "e.g. 75000",
      Icon: DollarSign,
    },
    {
      key: "followUpDate",
      label: "Follow-up Date",
      required: false,
      type: "date",
      placeholder: "",
      Icon: Calendar,
    },
  ];

  return (
    <div className="form-card" ref={cardRef}>
      {!isAuthenticated && (
        <div
          className="auth-hint-banner"
          onClick={() => onRequestAuth?.("login")}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => event.key === "Enter" && onRequestAuth?.("login")}
        >
          <Lock size={13} strokeWidth={2} />
          <span>
            <strong>Sign in</strong> to add leads to your pipeline
          </span>
        </div>
      )}

      <div className="form-fields">
        {fields.map(({ key, label, required, type, placeholder, Icon }) => (
          <div className={`form-group${fieldErrors[key] ? " form-group--has-error" : ""}`} key={key}>
            <label className="form-label">
              <Icon size={13} strokeWidth={2} className="form-label-icon" />
              {label}
              {required && <span className="required-star">*</span>}
            </label>
            <div className="input-icon-wrap">
              <span className="input-icon-prefix">
                <Icon size={15} strokeWidth={1.8} />
              </span>
              <input
                className="form-input input-with-icon"
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((prev) => ({ ...prev, [key]: value }));
                  if (fieldErrors[key]) {
                    handleBlur(key, value);
                  }
                }}
                onBlur={(event) => handleBlur(key, event.target.value)}
                disabled={!isAuthenticated}
                aria-invalid={Boolean(fieldErrors[key])}
              />
            </div>
            {fieldErrors[key] && <span className="inline-field-error">{fieldErrors[key]}</span>}
          </div>
        ))}

        <div className="form-group">
          <label className="form-label">
            <Tag size={13} strokeWidth={2} className="form-label-icon" />
            Status
          </label>
          <div className="input-icon-wrap">
            <span className="input-icon-prefix">
              <Tag size={15} strokeWidth={1.8} />
            </span>
            <select
              className="form-input input-with-icon"
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              disabled={!isAuthenticated}
            >
              {LEAD_STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <UserCheck size={13} strokeWidth={2} className="form-label-icon" />
            Assigned Sales Representative
          </label>
          <div className="input-icon-wrap">
            <span className="input-icon-prefix">
              <UserCheck size={15} strokeWidth={1.8} />
            </span>
            <select
              className="form-input input-with-icon"
              value={form.assignedSalesRepId}
              onChange={(event) => setForm((prev) => ({ ...prev, assignedSalesRepId: event.target.value }))}
              disabled={!isAuthenticated}
            >
              <option value="">Unassigned</option>
              {salesReps.map((rep) => (
                <option key={rep.id ?? rep.userId ?? rep.email} value={rep.id ?? rep.userId}>
                  {rep.name || rep.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <Flag size={13} strokeWidth={2} className="form-label-icon" />
            Priority
          </label>
          <div className="input-icon-wrap">
            <span className="input-icon-prefix">
              <Flag size={15} strokeWidth={1.8} />
            </span>
            <select
              className="form-input input-with-icon"
              value={form.priority}
              onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
              disabled={!isAuthenticated}
            >
              {["Low", "Medium", "High"].map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions-row">
          <button
            className={`btn-primary${!isAuthenticated ? " btn-primary--locked" : ""}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={15} strokeWidth={2} className="spin-icon" />
                Adding...
              </>
            ) : !isAuthenticated ? (
              <>
                <UserPlus size={15} strokeWidth={2} />
                Sign up to Add Lead
              </>
            ) : (
              <>
                <UserPlus size={15} strokeWidth={2} />
                Add Lead
              </>
            )}
          </button>
          <button className="btn-cancel" type="button" onClick={handleCancel} disabled={loading}>
            <X size={15} strokeWidth={2} />
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }

        .required-star {
          color: var(--danger, #F43F5E);
          margin-left: 2px;
        }

        .auth-hint-banner {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 14px;
          margin-bottom: 16px;
          background: rgba(99,102,241,0.06);
          border: 1px dashed rgba(99,102,241,0.3);
          border-radius: 9px;
          font-size: 13px;
          color: #6366F1;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          user-select: none;
        }
        .auth-hint-banner:hover {
          background: rgba(99,102,241,0.1);
          border-color: rgba(99,102,241,0.5);
        }
        .auth-hint-banner strong { font-weight: 700; }

        .inline-field-error {
          font-size: 11.5px;
          color: var(--danger, #F43F5E);
          font-weight: 500;
          margin-top: 3px;
          display: flex;
          align-items: center;
          gap: 4px;
          animation: fadeSlideIn 0.18s ease;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-3px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .form-group--has-error .form-input {
          border-color: var(--danger, #F43F5E) !important;
        }

        .btn-primary--locked {
          background: var(--surface, #F3F4F6) !important;
          color: #6366F1 !important;
          border: 1.5px dashed rgba(99,102,241,0.4) !important;
          box-shadow: none !important;
        }
        .btn-primary--locked:hover {
          background: rgba(99,102,241,0.08) !important;
          border-color: rgba(99,102,241,0.6) !important;
        }

        .form-input:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          background: transparent;
        }

        .form-actions-row {
          display: flex;
          gap: 10px;
        }
        .form-actions-row .btn-primary {
          flex: 1;
        }
      `}</style>
    </div>
  );
}

export default LeadForm;