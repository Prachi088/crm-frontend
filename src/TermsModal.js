import React, { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { Scale, X, CheckCircle, XCircle } from "lucide-react";

const TERMS_CONTENT = `
# Terms & Conditions

## 1. Introduction
Welcome to CRM Lite. These terms and conditions govern your use of our service and represent the entire agreement between you and CRM Lite regarding your use of the Service.

## 2. License to Use
CRM Lite grants you a limited, non-exclusive, non-transferable, revocable license to use the Service in accordance with these Terms & Conditions.

## 3. User Responsibilities
You agree to:
- Provide accurate information during registration
- Maintain the confidentiality of your login credentials
- Use the Service only for lawful purposes
- Not interfere with or disrupt the Service or servers
- Not attempt to gain unauthorized access to the Service

## 4. Intellectual Property Rights
All content on the Service, including text, graphics, logos, and software, is the property of CRM Lite or its suppliers and is protected by international copyright laws.

## 5. Limitation of Liability
In no event shall CRM Lite be liable for any indirect, incidental, special, or consequential damages arising out of or related to your use of the Service.

## 6. Data Privacy
Your use of CRM Lite is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.

## 7. Termination
CRM Lite may terminate or suspend your account immediately, without prior notice or liability, if you violate these Terms & Conditions.

## 8. Modifications to Terms
CRM Lite reserves the right to modify these Terms & Conditions at any time. Your continued use of the Service constitutes your acceptance of the modified terms.

## 9. Governing Law
These Terms & Conditions shall be governed by and construed in accordance with applicable laws, and you irrevocably submit to the exclusive jurisdiction of the courts.

## 10. Contact Us
If you have any questions about these Terms & Conditions, please contact us at support@crmlite.dev
`;

function TermsModal({ isOpen, onClose }) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const scrollRef = useRef(null);

  const handleAnimateOpen = useCallback(() => {
    if (!isOpen || !overlayRef.current || !modalRef.current) return;
    const tl = gsap.timeline();
    tl.to(overlayRef.current, { opacity: 1, pointerEvents: "all", duration: 0.3 })
      .to(modalRef.current, { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.2)" }, 0.1)
      .fromTo(
        scrollRef.current?.querySelectorAll("h1, h2, p"),
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" },
        0.3
      );
  }, [isOpen]);

  const handleAnimateClose = useCallback(() => {
    if (!overlayRef.current || !modalRef.current) return;
    const tl = gsap.timeline();
    tl.to(modalRef.current, { scale: 0.95, y: 20, opacity: 0, duration: 0.3, ease: "power2.in" })
      .to(overlayRef.current, { opacity: 0, pointerEvents: "none", duration: 0.2 }, 0)
      .call(() => onClose(), [], 0);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) handleAnimateOpen();
  }, [isOpen, handleAnimateOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleAnimateClose();
  };

  const handleEscapeKey = useCallback((e) => {
    if (e.key === "Escape" && isOpen) handleAnimateClose();
  }, [isOpen, handleAnimateClose]);

  React.useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleEscapeKey);
      return () => window.removeEventListener("keydown", handleEscapeKey);
    }
  }, [isOpen, handleEscapeKey]);

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{ opacity: 0, pointerEvents: "none" }}
    >
      <div
        className="modal-content"
        ref={modalRef}
        style={{ transform: "scale(0.95) translateY(20px)", opacity: 0 }}
      >
        <div className="modal-header">
          <div className="modal-header-left">
            <Scale size={18} strokeWidth={2} color="var(--accent)" />
            <h2 className="modal-title">Terms & Conditions</h2>
          </div>
          <button className="modal-close" onClick={handleAnimateClose} aria-label="Close modal">
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        <div className="modal-body terms-content" ref={scrollRef}>
          {TERMS_CONTENT.split("\n").map((line, i) => {
            if (line.startsWith("# ")) {
              return (
                <h1 key={i} style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px", marginTop: "20px", color: "var(--text-primary)" }}>
                  {line.substring(2)}
                </h1>
              );
            }
            if (line.startsWith("## ")) {
              return (
                <h2 key={i} style={{ fontSize: "15px", fontWeight: 600, marginBottom: "10px", marginTop: "18px", color: "var(--text-primary)" }}>
                  {line.substring(3)}
                </h2>
              );
            }
            if (line.startsWith("- ")) {
              return (
                <li key={i} style={{ marginLeft: "22px", marginBottom: "7px", color: "var(--text-secondary)", lineHeight: "1.65", fontSize: "13.5px" }}>
                  {line.substring(2)}
                </li>
              );
            }
            if (line.trim() === "") return <div key={i} style={{ height: "6px" }} />;
            return (
              <p key={i} style={{ marginBottom: "10px", color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "13.5px" }}>
                {line}
              </p>
            );
          })}
        </div>

        <div className="modal-footer">
          <button className="btn-modal-close" onClick={handleAnimateClose}>
            <XCircle size={14} strokeWidth={2} />
            Close
          </button>
          <button className="btn-modal-accept" onClick={handleAnimateClose}>
            <CheckCircle size={14} strokeWidth={2} />
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default TermsModal;