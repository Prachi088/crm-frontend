import React, { useState, useEffect } from "react";
import { User, Mail, Lock, Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = process.env.REACT_APP_API_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function ProfilePage() {
  const { user: currentUser, login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null); // { msg, type }

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch current user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/users/me`, { headers: authHeaders() });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setEmail(data.email || "");
      } catch {
        showToast("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!email.trim()) {
      showToast("Email cannot be empty", "error");
      return;
    }
    setSaving(true);
    try {
      const updates = { email: email.trim() };
      if (password.trim()) updates.password = password.trim();

      const res = await fetch(`${API}/users/me`, {
        method:  "PUT",
        headers: authHeaders(),
        body:    JSON.stringify(updates),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update profile");
      }

      const data = await res.json();

      // Update AuthContext so the UI reflects the new email immediately
      const token = localStorage.getItem("token");
      login({ token, userId: data.id, email: data.email });

      setPassword("");
      showToast("Profile updated!");
    } catch (err) {
      showToast(err.message || "Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
        <Loader2 size={28} className="spin-icon" color="var(--accent)" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>

      {/* Toast */}
      {toast && (
        <div
          className={`toast toast-${toast.type}`}
          role="alert"
          style={{ marginBottom: 16 }}
        >
          {toast.type === "success"
            ? <CheckCircle size={15} strokeWidth={2.5} />
            : <AlertCircle size={15} strokeWidth={2.5} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Card */}
      <div className="form-card">

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(99,102,241,0.12)",
            border: "2px solid rgba(99,102,241,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6366F1", fontWeight: 700, fontSize: 20,
          }}>
            {email ? email[0].toUpperCase() : <User size={24} />}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, color: "var(--text-primary)" }}>
              My Profile
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Manage your account details
            </div>
          </div>
        </div>

        {/* Email field */}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">
            <Mail size={13} strokeWidth={2} className="form-label-icon" />
            Email Address
          </label>
          <div className="input-icon-wrap">
            <span className="input-icon-prefix">
              <Mail size={15} strokeWidth={1.8} />
            </span>
            <input
              className="form-input input-with-icon"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="form-group" style={{ marginBottom: 24 }}>
          <label className="form-label">
            <Lock size={13} strokeWidth={2} className="form-label-icon" />
            New Password <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(leave blank to keep current)</span>
          </label>
          <div className="input-icon-wrap">
            <span className="input-icon-prefix">
              <Lock size={15} strokeWidth={1.8} />
            </span>
            <input
              className="form-input input-with-icon"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Save button */}
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ width: "100%" }}
        >
          {saving
            ? <><Loader2 size={15} strokeWidth={2} className="spin-icon" /> Saving…</>
            : <><Save size={15} strokeWidth={2} /> Save Changes</>}
        </button>

        {/* Info note */}
        <div style={{
          marginTop: 16, fontSize: 12, color: "var(--text-muted)",
          textAlign: "center", lineHeight: 1.5,
        }}>
          Your profile is private. Only you can view and edit it.
        </div>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}