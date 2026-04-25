import React, { useEffect, useState } from "react";
import { User, Mail, Lock, Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { getStoredToken, fetchCurrentUserProfile, updateCurrentUserProfile } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ msg: message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchCurrentUserProfile();
        setEmail(data?.email || "");
      } catch (error) {
        if (error?.status === 401 || error?.status === 403) {
          logout();
          return;
        }
        showToast(error.message || "Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [logout]);

  const handleSave = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      showToast("Email cannot be empty", "error");
      return;
    }

    setSaving(true);

    try {
      const updates = { email: trimmedEmail };
      if (trimmedPassword) {
        updates.password = trimmedPassword;
      }

      const data = await updateCurrentUserProfile(updates);

      login({
        token: getStoredToken(),
        userId: data?.id ?? data?.userId,
        email: data?.email ?? trimmedEmail,
      });

      setPassword("");
      showToast("Profile updated successfully!");
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        logout();
        showToast("Session expired. Please log in again.", "error");
        return;
      }

      showToast(error.message || "Failed to update profile", "error");
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
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert" style={{ marginBottom: 16 }}>
          {toast.type === "success" ? (
            <CheckCircle size={15} strokeWidth={2.5} />
          ) : (
            <AlertCircle size={15} strokeWidth={2.5} />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="form-card">
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.12)",
              border: "2px solid rgba(99,102,241,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6366F1",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
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
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 24 }}>
          <label className="form-label">
            <Lock size={13} strokeWidth={2} className="form-label-icon" />
            New Password{" "}
            <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
              (leave blank to keep current)
            </span>
          </label>
          <div className="input-icon-wrap">
            <span className="input-icon-prefix">
              <Lock size={15} strokeWidth={1.8} />
            </span>
            <input
              className="form-input input-with-icon"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
            />
          </div>
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ width: "100%" }}>
          {saving ? (
            <>
              <Loader2 size={15} strokeWidth={2} className="spin-icon" /> Saving...
            </>
          ) : (
            <>
              <Save size={15} strokeWidth={2} /> Save Changes
            </>
          )}
        </button>

        <div
          style={{
            marginTop: 16,
            fontSize: 12,
            color: "var(--text-muted)",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
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
