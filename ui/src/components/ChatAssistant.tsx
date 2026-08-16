"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Mic, Bot, CornerDownLeft, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { sendChatMessage } from "@/lib/api";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  sources?: { title: string; snippet: string }[];
  suggestions?: string[];
}

export function ChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "Hello! I am **DhanMITR**, your AI Personal Finance Companion. Ask me anything about investments, mutual funds, tax optimization, budgeting, or emergency reserves.",
      timestamp: "Just now",
      suggestions: [
        "How do I allocate ₹25,000 monthly SIP?",
        "Explain the New Tax Regime vs Old Tax Regime for 12 LPA",
        "How to calculate my financial emergency fund?",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChatMessage({ message: query });
      const botMsg: ChatMessage = {
        id: response.message_id || "b-" + Date.now(),
        sender: "bot",
        text: response.reply,
        timestamp: "Just now",
        sources: response.sources,
        suggestions: response.suggested_actions,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome-1",
        sender: "bot",
        text: "Hello! I am **DhanMITR**, your AI Personal Finance Companion. Ask me anything about investments, mutual funds, tax optimization, budgeting, or emergency reserves.",
        timestamp: "Just now",
        suggestions: [
          "How do I allocate ₹25,000 monthly SIP?",
          "Explain the New Tax Regime vs Old Tax Regime for 12 LPA",
          "How to calculate my financial emergency fund?",
        ],
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[640px] max-w-3xl mx-auto w-full bg-white rounded-2xl border border-slate-200/90 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Chat Sub-header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700">Conversational AI Engine</span>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
          title="Clear conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear Chat
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "bot" && (
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-slate-900 text-white rounded-tr-none shadow-sm"
                  : "bg-slate-50/80 border border-slate-200/70 text-slate-800 rounded-tl-none shadow-sm"
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Source citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-xs text-slate-500 space-y-1">
                  <span className="font-semibold text-slate-700">Financial Sources:</span>
                  {msg.sources.map((s, idx) => (
                    <p key={idx} className="italic text-[11px]">
                      "{s.title}" — {s.snippet}
                    </p>
                  ))}
                </div>
              )}

              {/* Suggested Follow-up Pills */}
              {msg.suggestions && (
                <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                  {msg.suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(sug)}
                      className="text-xs bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-emerald-700 rounded-lg px-2.5 py-1 transition-all flex items-center gap-1 shadow-2xs"
                    >
                      {sug} <ArrowRight className="w-3 h-3 text-emerald-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === "user" && (
              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5 text-xs text-slate-500 py-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <span>DhanMITR is generating financial guidance...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 border-t border-slate-100 bg-white flex items-center gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about mutual funds, tax slabs, loans..."
          className="flex-1 bg-slate-50 border-slate-200 focus-visible:bg-white text-sm"
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-4 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
