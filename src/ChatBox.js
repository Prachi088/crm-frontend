import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { MessageCircle, X, Send, Bot, Zap } from "lucide-react";
import "./ChatBox.css";

const API = process.env.REACT_APP_API_URL;

function ChatBox({ leads }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your CRM assistant. Ask me anything about your leads, pipeline, or sales strategy.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fabRef = useRef(null);
  const windowRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    if (!fabRef.current || open) return;
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(".chat-fab-pulse", { scale: 1.6, opacity: 0, duration: 1.5, ease: "power1.out" });
  }, [open]);

  useEffect(() => {
    if (!fabRef.current || !windowRef.current) return;
    if (open) {
      gsap.timeline()
        .to(fabRef.current, { scale: 0.9, duration: 0.2 })
        .to(fabRef.current, { scale: 1, duration: 0.1 }, 0.05)
        .to(windowRef.current, {
          opacity: 1, scale: 1, y: 0, pointerEvents: "all",
          duration: 0.3, ease: "back.out(1.2)",
        }, 0);
    } else {
      gsap.to(windowRef.current, {
        opacity: 0, scale: 0.95, y: 20, pointerEvents: "none",
        duration: 0.25, ease: "power2.in",
      });
    }
  }, [open]);

  const buildContextMessage = useCallback(() => {
    const total = leads.length;
    const won = leads.filter((l) => l.status === "CLOSED WON").length;
    const lost = leads.filter((l) => l.status === "CLOSED LOST").length;
    const pipeline = leads.reduce((s, l) => s + (Number(l.dealValue) || 0), 0);
    const convRate = total ? Math.round((won / total) * 100) : 0;
    const statusCounts = ["PROSPECT", "QUALIFIED", "PROPOSAL", "CLOSED WON", "CLOSED LOST"]
      .map((s) => `${s}: ${leads.filter((l) => l.status === s).length}`)
      .join(", ");
    const recentLeads = leads
      .slice(0, 5)
      .map((l) => `${l.name} at ${l.company || "N/A"} (${l.status}, ₹${Number(l.dealValue || 0).toLocaleString()})`)
      .join("; ");
    return `[CRM Data] Total: ${total} | Won: ${won} | Lost: ${lost} | Pipeline: ₹${pipeline.toLocaleString()} | Conversion: ${convRate}% | ${statusCounts} | Recent leads: ${recentLeads}`;
  }, [leads]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const messagesWithContext = [
        { role: "user", content: buildContextMessage() },
        { role: "assistant", content: "Got it! I have your pipeline data. How can I help?" },
        ...updatedMessages,
      ];
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: messagesWithContext }),
      });
      if (!res.ok) throw new Error("Backend error");
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, buildContextMessage]);

  const handleKey = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }, [sendMessage]);

  const handleSuggestionClick = useCallback((suggestion) => {
    setInput(suggestion);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  return (
    <>
      {/* FAB Button */}
      <button
        ref={fabRef}
        className={`chat-fab ${open ? "chat-fab-open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle chat"
        title="Chat with AI Assistant"
      >
        {open
          ? <X size={18} strokeWidth={2.5} color="#fff" />
          : <MessageCircle size={20} strokeWidth={2} color="#fff" />
        }
        {!open && <span className="chat-fab-pulse" />}
      </button>

      {/* Chat Window */}
      <div
        ref={windowRef}
        className={`chatbox-window ${open ? "chatbox-visible" : ""}`}
        style={{ opacity: 0, scale: 0.95, y: 20, pointerEvents: "none" }}
      >
        {/* Header */}
        <div className="chatbox-header">
          <div className="chatbox-header-left">
            <div className="chatbox-avatar">
              <Bot size={16} strokeWidth={2} color="#fff" />
            </div>
            <div>
              <div className="chatbox-name">CRM Assistant</div>
              <div className="chatbox-status">
                <span className="status-dot" />
                <Zap size={10} strokeWidth={2.5} />
                Powered by Groq · Llama 3
              </div>
            </div>
          </div>
          <button className="chatbox-close" onClick={() => setOpen(false)} aria-label="Close chat">
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Messages */}
        <div className="chatbox-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-msg ${msg.role === "user" ? "chat-msg-user" : "chat-msg-ai"}`}
              style={{ animation: `slideInUp 0.3s ease-out forwards`, animationDelay: `${i * 50}ms` }}
            >
              {msg.role === "assistant" && (
                <div className="msg-avatar">
                  <Bot size={11} strokeWidth={2} color="#fff" />
                </div>
              )}
              <div className="msg-bubble">{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="chat-msg chat-msg-ai">
              <div className="msg-avatar">
                <Bot size={11} strokeWidth={2} color="#fff" />
              </div>
              <div className="msg-bubble typing-bubble">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="chat-suggestions">
            {["How's my pipeline?", "Which leads need attention?", "What's my conversion rate?"].map((s) => (
              <button key={s} className="suggestion-pill" onClick={() => handleSuggestionClick(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chatbox-input-row">
          <input
            ref={inputRef}
            className="chatbox-input"
            placeholder="Ask about your pipeline..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            aria-label="Chat message input"
          />
          <button
            className="chatbox-send"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            title="Send message (Enter)"
          >
            <Send size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );
}

export default ChatBox;