import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MessageCircle, X, Send, Bot, Zap } from "lucide-react";
import { sendChatMessage } from "./api/client";
import "./ChatBox.css";

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
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    if (!fabRef.current || open) return;
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(".chat-fab-pulse", { scale: 1.6, opacity: 0, duration: 1.5, ease: "power1.out" });
  }, [open]);

  useEffect(() => {
    if (!fabRef.current || !windowRef.current) return;

    if (open) {
      gsap
        .timeline()
        .to(fabRef.current, { scale: 0.9, duration: 0.2 })
        .to(fabRef.current, { scale: 1, duration: 0.1 }, 0.05)
        .to(
          windowRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            pointerEvents: "all",
            duration: 0.3,
            ease: "back.out(1.2)",
          },
          0
        );
    } else {
      gsap.to(windowRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 20,
        pointerEvents: "none",
        duration: 0.25,
        ease: "power2.in",
      });
    }
  }, [open]);

  const buildContextMessage = useCallback(() => {
    const total = leads.length;
    const won = leads.filter((lead) => lead.status === "CLOSED WON").length;
    const lost = leads.filter((lead) => lead.status === "CLOSED LOST").length;
    const pipeline = leads.reduce((sum, lead) => sum + (Number(lead.dealValue) || 0), 0);
    const convRate = total ? Math.round((won / total) * 100) : 0;
    const statusCounts = ["PROSPECT", "QUALIFIED", "PROPOSAL", "CLOSED WON", "CLOSED LOST"]
      .map((status) => `${status}: ${leads.filter((lead) => lead.status === status).length}`)
      .join(", ");
    const recentLeads = leads
      .slice(0, 5)
      .map(
        (lead) =>
          `${lead.name} at ${lead.company || "N/A"} (${lead.status}, INR ${Number(
            lead.dealValue || 0
          ).toLocaleString()})`
      )
      .join("; ");

    return `[CRM Data] Total: ${total} | Won: ${won} | Lost: ${lost} | Pipeline: INR ${pipeline.toLocaleString()} | Conversion: ${convRate}% | ${statusCounts} | Recent leads: ${recentLeads}`;
  }, [leads]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const messagesWithContext = [
        { role: "user", content: buildContextMessage() },
        { role: "assistant", content: "Got it! I have your pipeline data. How can I help?" },
        ...updatedMessages,
      ];
      const data = await sendChatMessage({ messages: messagesWithContext });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [buildContextMessage, input, loading, messages]);

  const handleKey = useCallback(
    (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const handleSuggestionClick = useCallback((suggestion) => {
    setInput(suggestion);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  return (
    <>
      <button
        ref={fabRef}
        className={`chat-fab ${open ? "chat-fab-open" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-label="Toggle chat"
        title="Chat with AI Assistant"
      >
        {open ? (
          <X size={18} strokeWidth={2.5} color="#fff" />
        ) : (
          <MessageCircle size={20} strokeWidth={2} color="#fff" />
        )}
        {!open && <span className="chat-fab-pulse" />}
      </button>

      <div
        ref={windowRef}
        className={`chatbox-window ${open ? "chatbox-visible" : ""}`}
        style={{ opacity: 0, scale: 0.95, y: 20, pointerEvents: "none" }}
      >
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

        <div className="chatbox-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-msg ${message.role === "user" ? "chat-msg-user" : "chat-msg-ai"}`}
              style={{ animation: `slideInUp 0.3s ease-out forwards`, animationDelay: `${index * 50}ms` }}
            >
              {message.role === "assistant" && (
                <div className="msg-avatar">
                  <Bot size={11} strokeWidth={2} color="#fff" />
                </div>
              )}
              <div className="msg-bubble">{message.content}</div>
            </div>
          ))}

          {loading && (
            <div className="chat-msg chat-msg-ai">
              <div className="msg-avatar">
                <Bot size={11} strokeWidth={2} color="#fff" />
              </div>
              <div className="msg-bubble typing-bubble">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="chat-suggestions">
            {["How's my pipeline?", "Which leads need attention?", "What's my conversion rate?"].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  className="suggestion-pill"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        )}

        <div className="chatbox-input-row">
          <input
            ref={inputRef}
            className="chatbox-input"
            placeholder="Ask about your pipeline..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
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
