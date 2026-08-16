"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Bot, User, CornerDownLeft, ShieldCheck, Zap } from "lucide-react";
import { sendChatMessage } from "@/lib/api";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  sources?: { title: string; snippet: string }[];
  suggestions?: string[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "bot",
      text: "Namaste! I am **DhanMITR**, your AI Personal Finance Companion. How can I assist you with your investments, taxes, emergency fund, or budgeting goals today?",
      timestamp: "Just now",
      suggestions: [
        "How much emergency fund do I need for 6 months?",
        "Should I choose Old or New Tax Regime for 12 LPA?",
        "How to allocate ₹25,000 monthly SIP?",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-4.5rem)] flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">DhanMITR AI Assistant</h2>
            <p className="text-xs text-emerald-600 font-medium">● Grounded in Indian & Global Financial Rules</p>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "bot" && (
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-1">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.sender === "user"
                  ? "bg-emerald-600 text-white rounded-tr-none shadow-sm"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none shadow-sm"
              }`}
            >
              <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Sources:</span>
                  {msg.sources.map((s, idx) => (
                    <p key={idx} className="italic">"{s.title}" — {s.snippet}</p>
                  ))}
                </div>
              )}

              {msg.suggestions && (
                <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {msg.suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(sug)}
                      className="text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 rounded-lg px-2.5 py-1 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === "user" && (
              <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 flex-shrink-0 mt-1">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start items-center text-slate-500 text-xs">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <span>DhanMITR is analyzing financial benchmarks...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about taxes, budgeting, mutual funds..."
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !input.trim()} className="gap-1.5">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
