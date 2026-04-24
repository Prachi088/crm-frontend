import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { LogOut, ChevronDown, User } from "lucide-react";
import { useAuth } from "./AuthContext";
import "./UserMenu.css";

/**
 * UserMenu — shown in the navbar when a user is logged in.
 * Replaces the "Login" button with an avatar + dropdown.
 *
 * Usage:
 *   import UserMenu from "./UserMenu";
 *   // In your navbar, conditionally render:
 *   {isAuthenticated ? <UserMenu /> : <button onClick={openAuthModal}>Login</button>}
 */
export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef     = useRef(null);

  // Derive initials & color from email or name
  const displayName = user?.name || user?.email || "User";
  const initials = displayName
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  const COLORS = ["#6366F1", "#F97316", "#22C55E", "#0EA5E9", "#A855F7", "#F43F5E"];
  const avatarColor = COLORS[displayName.charCodeAt(0) % COLORS.length];

  // Animate dropdown
  useEffect(() => {
    if (!dropdownRef.current) return;
    if (open) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, y: -8, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: "power2.out" }
      );
    } else {
      gsap.to(dropdownRef.current, { opacity: 0, y: -6, scale: 0.97, duration: 0.16 });
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

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Account menu"
      >
        <span
          className="user-menu__avatar"
          style={{ background: avatarColor + "22", border: `2px solid ${avatarColor}55`, color: avatarColor }}
        >
          {initials || <User size={14} />}
        </span>
        <span className="user-menu__name">{displayName.split("@")[0]}</span>
        <ChevronDown
          size={14}
          className="user-menu__chevron"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        />
      </button>

      {open && (
        <div className="user-menu__dropdown" ref={dropdownRef}>
          <div className="user-menu__info">
            <span
              className="user-menu__avatar user-menu__avatar--lg"
              style={{ background: avatarColor + "22", border: `2px solid ${avatarColor}55`, color: avatarColor }}
            >
              {initials || <User size={18} />}
            </span>
            <div>
              <div className="user-menu__fullname">{user?.name || "Account"}</div>
              <div className="user-menu__email">{user?.email || displayName}</div>
            </div>
          </div>

          <div className="user-menu__divider" />

          <button className="user-menu__item user-menu__item--danger" onClick={handleLogout}>
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}