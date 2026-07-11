import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { LogOut, ChevronDown, User, Shield, UserCheck, UserCircle2, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { ROLE_LABELS, USER_ROLES } from "./constants/crm";
import "./UserMenu.css";

export default function UserMenu({ onSelect }) {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen]           = useState(false);
  const dropdownRef               = useRef(null);
  const menuRef                   = useRef(null);

  const displayName  = user?.name || user?.email || "User";
  const shortName    = displayName.split("@")[0];
  const initials     = displayName
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const COLORS      = ["#6366F1", "#F97316", "#22C55E", "#0EA5E9", "#A855F7", "#F43F5E"];
  const avatarColor = COLORS[displayName.charCodeAt(0) % COLORS.length];

  const roleLabel = ROLE_LABELS[user?.role] || "Sales Representative";
  const roleClass = isAdmin ? "admin" : user?.role === USER_ROLES.MANAGER ? "manager" : "user";

  // Animate dropdown open/close
  useEffect(() => {
    if (!dropdownRef.current) return;
    if (open) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "back.out(1.4)" }
      );
    } else {
      gsap.to(dropdownRef.current, {
        opacity: 0, y: -6, scale: 0.97,
        duration: 0.18, ease: "power2.in",
      });
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  const handleSelect = (action) => {
    setOpen(false);
    onSelect?.(action);
  };

  return (
    <div className="user-menu" ref={menuRef}>

      {/* ── Trigger pill ── */}
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Account menu"
      >
        {/* Avatar */}
        <span
          className="user-menu__avatar"
          style={{
            background: avatarColor + "22",
            border: `2px solid ${avatarColor}55`,
            color: avatarColor,
          }}
        >
          {initials || <User size={12} />}
        </span>

        {/* Name */}
        <span className="user-menu__name">{shortName}</span>

        {/* Role badge — only visible to the logged-in user themselves */}
        <span className={`user-menu__role-badge user-menu__role-badge--${roleClass}`}>
          {isAdmin && <Shield size={8} strokeWidth={2.5} />}
          {roleLabel}
        </span>

        {/* Chevron */}
        <ChevronDown
          size={13}
          className={`user-menu__chevron ${open ? "user-menu__chevron--open" : ""}`}
        />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="user-menu__dropdown" ref={dropdownRef}>

          {/* Header — avatar + name + email */}
          <div className="user-menu__info">
            <span
              className="user-menu__avatar user-menu__avatar--lg"
              style={{
                background: avatarColor + "22",
                border: `2px solid ${avatarColor}55`,
                color: avatarColor,
              }}
            >
              {initials || <User size={16} />}
            </span>
            <div className="user-menu__info-text">
              <div className="user-menu__fullname">{shortName}</div>
              <div className="user-menu__email">{user?.email}</div>
            </div>
          </div>

          {/* Role row — shows current user's own role */}
          <div className="user-menu__role-row">
            <span className="user-menu__role-label">Your role</span>
            <span className={`user-menu__role-pill user-menu__role-pill--${roleClass}`}>
              {isAdmin
                ? <><Shield size={9} strokeWidth={2.5} /> Admin</>
                : <><UserCheck size={9} strokeWidth={2.5} /> {roleLabel}</>}
            </span>
          </div>

          <button type="button" className="user-menu__item" onClick={() => handleSelect("profile") }>
            <UserCircle2 size={14} strokeWidth={2} />
            My Profile
          </button>

          <button type="button" className="user-menu__item" onClick={() => handleSelect("settings") }>
            <SettingsIcon size={14} strokeWidth={2} />
            Settings
          </button>

          <button
            type="button"
            className="user-menu__item user-menu__item--danger"
            onClick={handleLogout}
          >
            <LogOut size={14} strokeWidth={2} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
