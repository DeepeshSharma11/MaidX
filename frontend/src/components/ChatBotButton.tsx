"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Loader2, Bot, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function ChatBotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hi! I'm MaidX AI 👋\nAsk me to find helpers, check bookings, or book directly!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Lock body scroll when chat is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({ role: m.role, text: m.text }));
      const { data } = await api.post("/chat", {
        message: userMessage,
        history: historyPayload,
      });
      setMessages((prev) => [...prev, { role: "model", text: data.response }]);
      if (data.booking_created) {
        window.dispatchEvent(new Event("bookings:updated"));
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── FAB Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Assistant"
        className="fixed bottom-20 right-4 md:bottom-8 md:right-6 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Bot className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop — mobile only */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/*
              Mobile: full-height bottom sheet sitting above the nav bar (bottom-16)
              Desktop: floating panel anchored bottom-right
            */}
            <motion.div
              key="chat-panel"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={[
                // Base
                "fixed z-50 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800",
                // Mobile: bottom sheet above nav bar
                "bottom-16 left-0 right-0 rounded-t-3xl max-h-[72vh]",
                // Desktop: floating panel
                "md:bottom-24 md:left-auto md:right-6 md:w-[380px] md:h-[500px] md:rounded-3xl md:max-h-none",
              ].join(" ")}
            >
              {/* Drag handle (mobile only) */}
              <div className="flex justify-center pt-2.5 pb-1 md:hidden">
                <div className="w-10 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              </div>

              {/* Header */}
              <div className="bg-indigo-600 text-white px-5 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight">MaidX AI</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] text-indigo-200 font-medium">Online</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50 dark:bg-zinc-950/40 overscroll-contain">
                {messages.map((m, idx) => {
                  const isUser = m.role === "user";
                  return (
                    <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isUser
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-200 rounded-bl-none shadow-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      </div>
                    </div>
                  );
                })}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                      <span className="text-xs text-zinc-500">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me to book or check status..."
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-zinc-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
