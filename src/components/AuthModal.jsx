import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { loginUser, registerUser } from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./AuthModal.css";

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
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(".auth-backdrop", { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    if (!formRef.current) return;
    gsap.fromTo(
      formRef.current.querySelectorAll(".form-group"),
      { y: 10 },
      { y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out", delay: 0.15 }
    );
  }, [isLogin]);

  useEffect(() => {
    setIsLogin(initialMode !== "register");
  }, [initialMode]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const validateField = (key, value) => {
    const trimmedValue = value.trim();

    if (key === "email" && trimmedValue) {
      // Use HTML5 email validation pattern (more permissive)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        return "Enter a valid email address";
      }
    }

    if (key === "password" && trimmedValue && trimmedValue.length < 6) {
      return "Password must be at least 6 characters";
    }

    return "";
  };

  const handleBlur = (key, value) => {
    const message = validateField(key, value);
    setFieldErrors((prev) => ({ ...prev, [key]: message }));
  };

  const closeModal = () => {
    gsap.to(modalRef.current, {
      opacity: 0,
      y: 16,
      scale: 0.97,
      duration: 0.25,
      onComplete: onClose,
    });
    gsap.to(".auth-backdrop", { opacity: 0, duration: 0.25 });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const emailError = validateField("email", trimmedEmail);
    const passwordError = validateField("password", trimmedPassword);

    if (emailError || passwordError) {
      setFieldErrors({ email: emailError, password: passwordError });
      return;
    }

    setIsLoading(true);

    try {
      const submitAuth = isLogin ? loginUser : registerUser;
      const data = await submitAuth({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      login(data);
      setSuccess(isLogin ? "Welcome back! Signing you in..." : "Account created! Signing you in...");
      setFieldErrors({});
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = window.setTimeout(onClose, 700);

      gsap.to(formRef.current, {
        opacity: 0,
        y: -12,
        duration: 0.3,
        delay: 0.05,
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    gsap.to(formRef.current, {
      opacity: 0,
      x: isLogin ? 18 : -18,
      duration: 0.18,
      onComplete: () => {
        setIsLogin((value) => !value);
        setEmail("");
        setPassword("");
        setShowPassword(false);
        setError("");
        setSuccess("");
        setFieldErrors({});

        // Reset form opacity to visible after state updates
        gsap.to(formRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.3,
          delay: 0.05,
          ease: "power2.out"
        });
      },
    });
  };

  const handleBackdropClick = (event) => {
    if (event.target !== event.currentTarget) return;
    closeModal();
  };

  return (
    <div className="auth-backdrop" onClick={handleBackdropClick}>
      <div className="auth-modal" ref={modalRef}>
        <div className="auth-bg-gradient" />

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon-badge">
              {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            </div>
            <h2 className="auth-title">{isLogin ? "Welcome Back" : "Create Account"}</h2>
            <p className="auth-subtitle">
              {isLogin ? "Sign in to access your sales pipeline" : "Join us to manage your leads"}
            </p>
          </div>

          {error && (
            <div className="auth-alert auth-alert--error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-alert auth-alert--success">
              <CheckCircle2 size={15} />
              <span>{success}</span>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="auth-form" noValidate>
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
                onChange={(event) => {
                  const value = event.target.value;
                  setEmail(value);
                  setError("");
                  setFieldErrors((prev) => ({
                    ...prev,
                    email: prev.email ? validateField("email", value) : "",
                  }));
                }}
                onBlur={(event) => handleBlur("email", event.target.value)}
                className="form-input"
                required
                autoComplete="email"
              />
              <div className="form-underline" />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>

            <div className={`form-group ${fieldErrors.password ? "form-group--error" : ""}`}>
              <label htmlFor="password" className="form-label">
                <Lock size={15} className="form-label-icon" />
                Password
              </label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPassword(value);
                    setError("");
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: prev.password ? validateField("password", value) : "",
                    }));
                  }}
                  onBlur={(event) => handleBlur("password", event.target.value)}
                  className="form-input"
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  tabIndex="-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="form-underline" />
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </div>

            <button type="submit" disabled={isLoading || Boolean(success)} className="auth-submit-btn">
              <span className="btn-text">
                {isLoading
                  ? isLogin
                    ? "Signing in..."
                    : "Creating account..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}
              </span>
              {!isLoading && !success && <ArrowRight size={16} className="btn-icon" />}
              {isLoading && <div className="spinner" />}
              {success && <CheckCircle2 size={16} />}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button type="button" onClick={toggleMode} className="auth-toggle-btn">
            <span className="toggle-text">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <span className="toggle-action">{isLogin ? "Sign Up" : "Sign In"}</span>
          </button>

          <div className="auth-footer">
            <button type="button" onClick={closeModal} className="close-btn" aria-label="Close modal">
              x
            </button>
          </div>
        </div>

        <div className="sparkle">
          <Sparkles size={16} />
        </div>
      </div>
    </div>
  );
}
