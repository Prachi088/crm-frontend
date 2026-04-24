import React, { useState, useRef } from "react";
import gsap from "gsap";
import {
  User, Mail, Building2, DollarSign,
  Tag, UserPlus, Loader2, Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["PROSPECT", "QUALIFIED", "PROPOSAL", "CLOSED WON", "CLOSED LOST"];

const EMPTY = { name: "", email: "", company: "", dealValue: "", status: "PROSPECT" };

function LeadForm({ onAdd, onRequestAuth }) {
  const { isAuthenticated } = useAuth();
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const cardRef = useRef(null);

  // ── field-level validation ────────────────────────────────────
  const validate = (key, value) => {
    if (key === "name"  && !value.trim()) return "Name is required";
    if (key === "email" && !value.trim()) return "Email is required";
    if (key === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Enter a valid email";
    if (key === "dealValue" && value && isNaN(Number(value)))
      return "Must be a number";
    return "";
  };

  const handleBlur = (key, value) => {
    const msg = validate(key, value);
    setFieldErrors((prev) => ({ ...prev, [key]: msg }));
  };

  // ── submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Auth gate
    if (!isAuthenticated) {
      // Shake the card to hint auth is needed
      gsap.fromTo(
        cardRef.current,
        { x: 0 },
        { x: [-6, 6, -4, 4, 0], duration: 0.4, ease: "power1.inOut" }
      );
      onRequestAuth?.("register");
      return;
    }

    // Validate required fields
            const nameErr  = validate("name", form.name);
const emailErr = validate("email", form.email);
const dealErr  =
  !form.dealValue || Number(form.dealValue) <= 0
    ? "Enter valid amount"
    : "";

if (nameErr || emailErr || dealErr) {
  setFieldErrors({
    name: nameErr,
    email: emailErr,
    dealValue: dealErr
  });
  return;
}

    setLoading(true);
    const payload = {
      ...form,
      dealValue: form.dealValue ? parseFloat(form.dealValue) : null,
    };
    const ok = await onAdd(payload);
    if (ok) {
      setForm(EMPTY);
      setFieldErrors({});
      // Success pulse on card
      gsap.fromTo(
        cardRef.current,
        { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
        { boxShadow: "0 0 0 6px rgba(34,197,94,0)", duration: 0.5, ease: "power2.out" }
      );
    }
    setLoading(false);
  };

  const fields = [
    { key: "name",      label: "Full Name",        required: true,  type: "text",   placeholder: "e.g. Prachi Rajput",      Icon: User      },
    { key: "email",     label: "Email Address",    required: true,  type: "email",  placeholder: "e.g. prachi@example.com", Icon: Mail      },
    { key: "company",   label: "Company",          required: false, type: "text",   placeholder: "e.g. Sati College",       Icon: Building2 },
    { key: "dealValue", label: "Deal Value (₹)",   required: false, type: "number", placeholder: "e.g. 50000",              Icon: DollarSign },
  ];

  return (
    <div className="form-card" ref={cardRef}>
      {/* Auth hint banner — visible only when logged out */}
      {!isAuthenticated && (
        <div
          className="auth-hint-banner"
          onClick={() => onRequestAuth?.("login")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onRequestAuth?.("login")}
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
              {label}{required && <span className="required-star">*</span>}
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
                onChange={(e) => {
                  setForm({ ...form, [key]: e.target.value });
                  if (fieldErrors[key]) handleBlur(key, e.target.value);
                }}
                onBlur={(e) => handleBlur(key, e.target.value)}
                disabled={!isAuthenticated}
                aria-invalid={Boolean(fieldErrors[key])}
              />
            </div>
            {fieldErrors[key] && (
              <span className="inline-field-error">{fieldErrors[key]}</span>
            )}
          </div>
        ))}

        {/* Status */}
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
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              disabled={!isAuthenticated}
            >
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <button
          className={`btn-primary${!isAuthenticated ? " btn-primary--locked" : ""}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={15} strokeWidth={2} className="spin-icon" />
              Adding…
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
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }

        .required-star {
          color: var(--danger, #F43F5E);
          margin-left: 2px;
        }

        /* Auth hint banner */
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

        /* Inline field error */
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

        /* Error field underline */
        .form-group--has-error .form-input {
          border-color: var(--danger, #F43F5E) !important;
        }

        /* Locked button variant */
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

        /* Disabled inputs when logged out */
        .form-input:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          background: transparent;
        }
      `}</style>
    </div>
  );
}

export default LeadForm;