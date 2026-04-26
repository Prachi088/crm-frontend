import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  User, Mail, Lock, Save, CheckCircle, AlertCircle,
  Loader2, DollarSign, Building2, Eye, EyeOff,
  Shield, Briefcase, TrendingUp, ArrowLeft,
} from "lucide-react";
import { getStoredToken, fetchCurrentUserProfile, updateCurrentUserProfile, apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  PROSPECT:      { bg: "#EEF2FF", text: "#4338CA", dot: "#6366F1" },
  QUALIFIED:     { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
  PROPOSAL:      { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  "CLOSED WON":  { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
  "CLOSED LOST": { bg: "#FFF1F2", text: "#BE123C", dot: "#F43F5E" },
};

const AVATAR_COLORS = ["#6366F1", "#F97316", "#22C55E", "#F43F5E", "#0EA5E9", "#A855F7"];

function getAvatarColor(str) {
  if (!str) return AVATAR_COLORS[0];
  return AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];
}

function Badge({ status }) {
  const colors = STATUS_COLORS[status] || { bg: "#F1F5F9", text: "#64748B", dot: "#94A3B8" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: colors.bg, color: colors.text, whiteSpace: "nowrap", flexShrink: 0,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: colors.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

function LeadItem({ lead }) {
  const color = getAvatarColor(lead.name);
  return (
    <div
      className="profile-lead-item"
      style={{
        background: "var(--bg-surface)", borderRadius: "var(--radius-md)",
        padding: "12px 16px", border: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 12,
        transition: "box-shadow 0.2s, transform 0.15s", opacity: 0,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: `${color}22`, border: `2px solid ${color}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color, fontWeight: 700, fontSize: 12, flexShrink: 0,
      }}>
        {lead.name ? lead.name[0].toUpperCase() : "?"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-primary)" }}>{lead.name}</div>
        {lead.company && (
          <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
            <Building2 size={10} strokeWidth={2} />{lead.company}
          </div>
        )}
      </div>
      {lead.dealValue && (
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#22C55E", display: "flex", alignItems: "center", gap: 3 }}>
          <DollarSign size={11} strokeWidth={2.5} />
          {Number(lead.dealValue).toLocaleString()}
        </div>
      )}
      <Badge status={lead.status} />
    </div>
  );
}

function MiniStats({ leads }) {
  const totalDeal = leads.reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);
  const wonLeads = leads.filter((l) => l.status === "CLOSED WON").length;
  const stats = [
    { icon: Briefcase, label: "Total Leads", value: leads.length, color: "#6366F1" },
    { icon: TrendingUp, label: "Closed Won", value: wonLeads, color: "#22C55E" },
    { icon: DollarSign, label: "Pipeline", value: `₹${totalDeal >= 1000 ? (totalDeal / 1000).toFixed(0) + "K" : totalDeal}`, color: "#F97316" },
  ];
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
      {stats.map((stat) => (
        <div key={stat.label} style={{
          flex: 1, minWidth: 120,
          background: "var(--bg-surface)", borderRadius: "var(--radius-md)",
          padding: "12px 16px", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${stat.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <stat.icon size={15} color={stat.color} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'DM Serif Display', serif" }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Own Profile ───────────────────────────────────────────────────
function OwnProfile() {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const cardRef = useRef(null);
  const leadsRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ msg: message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [profile, allLeads] = await Promise.all([
          fetchCurrentUserProfile(),
          apiRequest("/leads", { auth: true }),
        ]);
        const profileEmail = profile?.email || "";
        setEmail(profileEmail);
        const myLeads = (allLeads || []).filter(
          (l) => l.owner?.email === profileEmail
        );
        setLeads(myLeads);
      } catch (error) {
        if (error?.status === 401 || error?.status === 403) { logout(); return; }
        showToast(error.message || "Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [logout]);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power2.out", delay: 0.1 }
      );
      if (leadsRef.current) {
        gsap.fromTo(
          leadsRef.current.querySelectorAll(".profile-lead-item"),
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.07, ease: "power2.out", delay: 0.3 }
        );
      }
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  const handleSave = async () => {
    const trimmedPassword = password.trim();
    if (!trimmedPassword) { showToast("Enter a new password to save", "error"); return; }
    if (trimmedPassword.length < 6) { showToast("Password must be at least 6 characters", "error"); return; }
    setSaving(true);
    try {
      const data = await updateCurrentUserProfile({ password: trimmedPassword });
      login({ token: getStoredToken(), userId: data?.id ?? data?.userId, email: data?.email ?? email });
      setPassword("");
      showToast("Password updated successfully!");
      gsap.fromTo(cardRef.current, { scale: 1.01 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) { logout(); showToast("Session expired. Please log in again.", "error"); return; }
      showToast(error.message || "Failed to update password", "error");
    } finally {
      setSaving(false);
    }
  };

  const avatarColor = getAvatarColor(email);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
        <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ maxWidth: 680, margin: "0 auto", padding: "8px 0" }}>
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert" style={{ position: "relative", top: 0, right: 0, marginBottom: 16 }}>
          {toast.type === "success" ? <CheckCircle size={15} strokeWidth={2.5} /> : <AlertCircle size={15} strokeWidth={2.5} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div ref={headerRef} style={{ marginBottom: 20, opacity: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: `${avatarColor}22`, border: `2px solid ${avatarColor}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: avatarColor, fontWeight: 800, fontSize: 24,
          }}>
            {email ? email[0].toUpperCase() : <User size={28} />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: "var(--text-primary)", fontFamily: "'DM Serif Display', serif" }}>
              My Profile
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{email}</div>
          </div>
        </div>
        <MiniStats leads={leads} />
      </div>

      {/* Settings card */}
      <div ref={cardRef} className="form-card" style={{ marginBottom: 20, opacity: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={15} color="var(--accent)" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Account Settings</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Change your password</div>
          </div>
        </div>

        {/* Email read-only */}
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">
            <Mail size={13} strokeWidth={2} className="form-label-icon" /> Email Address
          </label>
          <div className="input-icon-wrap">
            <span className="input-icon-prefix"><Mail size={15} strokeWidth={1.8} /></span>
            <input
              className="form-input input-with-icon"
              type="email"
              value={email}
              readOnly
              style={{ opacity: 0.65, cursor: "not-allowed", background: "var(--bg-secondary)" }}
            />
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>Email cannot be changed</div>
        </div>

        {/* Password */}
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">
            <Lock size={13} strokeWidth={2} className="form-label-icon" /> New Password
          </label>
          <div className="input-icon-wrap" style={{ position: "relative" }}>
            <span className="input-icon-prefix"><Lock size={15} strokeWidth={1.8} /></span>
            <input
              className="form-input input-with-icon"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
              style={{ paddingRight: 40 }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 2 }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={saving || !password.trim()}>
          {saving
            ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
            : <><Save size={15} strokeWidth={2} /> Update Password</>}
        </button>

        <div style={{ marginTop: 14, fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
          Only you can view and edit your account settings
        </div>
      </div>

      {/* My Leads */}
      <div ref={leadsRef}>
        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Briefcase size={15} color="var(--accent)" strokeWidth={2} />
          My Leads ({leads.length})
        </div>
        {leads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 13 }}>
            No leads assigned to you yet
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {leads.map((lead) => <LeadItem key={lead.id} lead={lead} />)}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Other User Profile (read-only) ────────────────────────────────
function OtherProfile({ userId, onBack }) {
  const [profileData, setProfileData] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [profile, allLeads] = await Promise.all([
          apiRequest(`/users/${userId}`, { auth: true }),
          apiRequest("/leads", { auth: false }),
        ]);
        setProfileData(profile);
        const theirLeads = (allLeads || []).filter(
          (l) => String(l.owner?.id) === String(userId)
        );
        setLeads(theirLeads);
      } catch (error) {
        console.error("Failed to load user profile", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
      gsap.fromTo(
        containerRef.current.querySelectorAll(".profile-lead-item"),
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.07, ease: "power2.out", delay: 0.2 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
        <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: "var(--accent)" }} />
      </div>
    );
  }

  const email = profileData?.email || "";
  const avatarColor = getAvatarColor(email);

  return (
    <div ref={containerRef} style={{ maxWidth: 680, margin: "0 auto", padding: "8px 0" }}>
      {onBack && (
        <button onClick={onBack} className="btn-icon-text" style={{ marginBottom: 16 }}>
          <ArrowLeft size={14} strokeWidth={2} /> Back to Leads
        </button>
      )}

      <div ref={headerRef} style={{ marginBottom: 20, opacity: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: `${avatarColor}22`, border: `2px solid ${avatarColor}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: avatarColor, fontWeight: 800, fontSize: 24,
          }}>
            {email ? email[0].toUpperCase() : <User size={28} />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: "var(--text-primary)", fontFamily: "'DM Serif Display', serif" }}>
              {email.split("@")[0]}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Team Member</div>
          </div>
        </div>
        <MiniStats leads={leads} />
      </div>

      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Briefcase size={15} color="var(--accent)" strokeWidth={2} />
          Their Leads ({leads.length})
        </div>
        {leads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 13 }}>
            No leads assigned to this user
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {leads.map((lead) => <LeadItem key={lead.id} lead={lead} />)}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────
export default function ProfilePage({ viewUserId, onBack }) {
  const { user } = useAuth();

  const isOwnProfile =
    !viewUserId ||
    String(viewUserId) === String(user?.id) ||
    String(viewUserId) === String(user?.userId);

  if (isOwnProfile) return <OwnProfile />;
  return <OtherProfile userId={viewUserId} onBack={onBack} />;
}