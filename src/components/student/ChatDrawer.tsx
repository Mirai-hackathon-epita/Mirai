"use client";

import * as React from "react";
import { C, FONT } from "@/lib/ui/theme";
import { MiraiMark, Icon } from "@/components/ui";
import { api } from "@/lib/ui/api";

interface ChatMessage {
  id: string;
  role: "mira" | "student";
  text: string;
  ts: number;
}

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: "seed-1",
    role: "mira",
    text: "Hi Maya! Looking at your work, I can see you're adding fractions. What part are you finding tricky — finding the common denominator, or something else?",
    ts: Date.now() - 1000 * 60 * 2,
  },
];

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
  exerciseContext?: string;
}

export function ChatDrawer({ open, onClose, studentId, exerciseContext }: ChatDrawerProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(SEED_MESSAGES);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const hintSentRef = React.useRef(false);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset hintSentRef when the exercise changes so each new exercise gets a fresh hint
  React.useEffect(() => {
    hintSentRef.current = false;
  }, [exerciseContext]);

  // Auto-send hint when drawer opens with an exercise context
  React.useEffect(() => {
    if (!open || !exerciseContext || hintSentRef.current) return;

    hintSentRef.current = true;
    setSending(true);

    api
      .chat(studentId, { message: `I need a hint for this problem: ${exerciseContext}` })
      .then((res) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `m-${Date.now()}`,
            role: "mira",
            text: res.reply,
            ts: Date.now(),
          },
        ]);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `m-${Date.now()}`,
            role: "mira",
            text: "Try finding what number both denominators divide into evenly — that's your common denominator.",
            ts: Date.now(),
          },
        ]);
      })
      .finally(() => {
        setSending(false);
      });
  }, [open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "student",
      text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await api.chat(studentId, { message: text });
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: "mira",
          text: res.reply,
          ts: Date.now(),
        },
      ]);
    } catch {
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: "mira",
          text: "Try finding what number both denominators (4 and 6) divide into evenly — that's your common denominator.",
          ts: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(22,26,34,0.18)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
          zIndex: 40,
        }}
      />

      {/* Drawer panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 400,
          height: "100vh",
          background: C.paper2,
          boxShadow: "-8px 0 40px rgba(60,40,20,0.14)",
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 50,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: `1px solid ${C.line}`,
            flex: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MiraiMark size={28} />
            <div>
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 15,
                  fontWeight: 600,
                  color: C.ink,
                }}
              >
                Ask Mirai
              </div>
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 11,
                  color: C.mono,
                  letterSpacing: "0.03em",
                }}
              >
                Your AI tutor
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${C.line2}`,
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.muted,
            }}
          >
            <Icon name="arrow-right" size={16} />
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {sending && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MiraiMark size={22} />
              <span
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  color: C.faint,
                  fontStyle: "italic",
                }}
              >
                Mirai is thinking…
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div
          style={{
            padding: "14px 16px",
            borderTop: `1px solid ${C.line}`,
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Mirai a question…"
            rows={2}
            style={{
              flex: 1,
              resize: "none",
              border: `1px solid ${C.line2}`,
              borderRadius: 10,
              padding: "10px 14px",
              fontFamily: FONT.sans,
              fontSize: 14,
              color: C.ink,
              background: C.paper,
              outline: "none",
              lineHeight: 1.45,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: C.terracotta,
              border: "none",
              color: C.cream,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: !input.trim() || sending ? "not-allowed" : "pointer",
              opacity: !input.trim() || sending ? 0.55 : 1,
              flexShrink: 0,
              transition: "opacity 0.15s ease",
            }}
          >
            <Icon name="send" size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isMirai = message.role === "mira";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        flexDirection: isMirai ? "row" : "row-reverse",
      }}
    >
      {isMirai && <MiraiMark size={26} />}

      <div
        style={{
          maxWidth: "82%",
          background: isMirai ? C.paper3 : C.terracotta,
          color: isMirai ? C.ink2 : C.cream,
          borderRadius: isMirai ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
          padding: "10px 14px",
          fontSize: 14,
          lineHeight: 1.5,
          fontFamily: FONT.sans,
        }}
      >
        {message.text}
      </div>
    </div>
  );
}
