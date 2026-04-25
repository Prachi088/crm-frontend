import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  Sparkles, LogIn, UserPlus, AlertCircle, CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./AuthModal.css";

const API = process.env.REACT_APP_API_URL;

// initialMode: "login" (default) | "register"
export default function AuthModal({ onClose, initialMode = "login" }) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode !== "register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const modalRef = useRef(null);
  const formRef = useRef(null);
  const errorRef = useRef(null);

  // ── entrance animation ──────────────────────────────────────────
  useEffect(() => {
  // Backdrop fade in
  gsap.fromTo(".auth-backdrop", { opacity: 0 }, { opacity: 1, duration: 0.3 });

  // Modal slide up + fade
  gsap.fromTo(
    modalRef.current,
    { opacity: 0, y: 40, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }
  );

  // ✅ FIX: Don't animate form-group opacity from 0.
  // Just do a subtle translateY only, keep opacity: 1
  if (formRef.current) {
    gsap.fromTo(
      formRef.current.querySelectorAll(".form-group"),
      { y: 10, opacity: 1 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out", delay: 0.2 }
    );
  }

  // Button entrance — no opacity:0 start
  if (formRef.current) {
    const button = formRef.current.querySelector(".auth-submit-btn");
    if (button) {
      gsap.fromTo(
        button,
        { y: 8, opacity: 1 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", delay: 0.3 }
      );
    }
  }
}, [isLogin]);

  // ── inline validation ──────────────────────────────────────────────
  const validateField = (key, value) => {
    if (key === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Enter a valid email address";
    }
    if (key === "password" && value && value.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const handleBlur = (key, value) => {
    const msg = validateField(key, value);
    setFieldErrors((prev) => ({ ...prev, [key]: msg }));
  };

  // ── submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // client-side guard
    const emailErr = validateField("email", email);
    const passErr  = validateField("password", password);
    if (emailErr || passErr) {
      setFieldErrors({ email: emailErr, password: passErr });
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isLogin ? `${API}/auth/login` : `${API}/auth/register`;
      const res = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const text = await res.text();

let data = {};
try {
  data = text ? JSON.parse(text) : {};
} catch {
  data = {};
}

if (!res.ok) {
  throw new Error(
    data?.message || data?.error || (isLogin ? "Invalid credentials." : "Registration failed.")
  );
}
      // success
      setSuccess(isLogin ? "Welcome back! Signing you in…" : "Account created! Signing you in…");
       login(data);   // ← NEW
      gsap.to(formRef.current, {
        opacity: 0, y: -12, duration: 0.3, delay: 0.6,
        onComplete: () => setTimeout(onClose, 80),
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── toggle login / register ──────────────────────────────────────
  const toggleMode = () => {
    gsap.to(formRef.current, {
      opacity: 0, x: isLogin ? 18 : -18, duration: 0.18,
      onComplete: () => {
        setIsLogin((v) => !v);
        setEmail("");
        setPassword("");
        setShowPassword(false);
        setError("");
        setSuccess("");
        setFieldErrors({});
      },
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target !== e.currentTarget) return;
    gsap.to(modalRef.current, { opacity: 0, y: 16, scale: 0.97, duration: 0.25, onComplete: onClose });
    gsap.to(".auth-backdrop", { opacity: 0, duration: 0.25 });
  };

  return (
    <div className="auth-backdrop" onClick={handleBackdropClick}>
      <div className="auth-modal" ref={modalRef}>
        <div className="auth-bg-gradient" />

        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-icon-badge">
              {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            </div>
            <h2 className="auth-title">{isLogin ? "Welcome Back" : "Create Account"}</h2>
            <p className="auth-subtitle">
              {isLogin ? "Sign in to access your sales pipeline" : "Join us to manage your leads"}
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="auth-alert auth-alert--error" ref={errorRef}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div className="auth-alert auth-alert--success">
              <CheckCircle2 size={15} />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Email */}
            <div className={`form-group ${fieldErrors.email ? "form-group--error" : ""}`}>
              <label htmlFor="email" className="form-label">
                <Mail size={15} className="form-label-icon" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onBlur={(e) => handleBlur("email", e.target.value)}
                className="form-input"
                required
                autoComplete="email"
              />
              <div className="form-underline" />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className={`form-group ${fieldErrors.password ? "form-group--error" : ""}`}>
              <label htmlFor="password" className="form-label">
                <Lock size={15} className="form-label-icon" />
                Password
              </label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onBlur={(e) => handleBlur("password", e.target.value)}
                  className="form-input"
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex="-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="form-underline" />
              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || Boolean(success)}
              className="auth-submit-btn"
            >
              <span className="btn-text">
                {isLoading
                  ? isLogin ? "Signing in…" : "Creating account…"
                  : isLogin ? "Sign In" : "Create Account"}
              </span>
              {!isLoading && !success && <ArrowRight size={16} className="btn-icon" />}
              {isLoading && <div className="spinner" />}
              {success && <CheckCircle2 size={16} />}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          {/* Toggle */}
          <button type="button" onClick={toggleMode} className="auth-toggle-btn">
            <span className="toggle-text">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <span className="toggle-action">{isLogin ? "Sign Up" : "Sign In"}</span>
          </button>

          {/* Footer */}
          <div className="auth-footer">
             <button
              type="button"
              onClick={() => {
                gsap.to(modalRef.current, { opacity: 0, y: 16, scale: 0.97, duration: 0.25, onComplete: onClose });
                gsap.to(".auth-backdrop", { opacity: 0, duration: 0.25 });
              }}
              className="close-btn"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="sparkle"><Sparkles size={16} /></div>
      </div>
    </div>
  );
}