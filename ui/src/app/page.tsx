"use client";

import React, { useState } from "react";
import { Logo } from "@/components/Logo";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { ChatAssistant } from "@/components/ChatAssistant";
import { Mic, MessageSquare, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"voice" | "chat">("voice");

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Premium Minimalist Navigation Bar */}
      <header className="w-full border-b border-slate-100/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Custom SVG Logo */}
          <Logo size={40} />

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200/60 shadow-inner">
            <button
              onClick={() => setActiveTab("voice")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === "voice"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              Voice Mode
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === "chat"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat Mode
            </button>
          </div>

          {/* Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI Ready
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col justify-center">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full"
        >
          {activeTab === "voice" ? <VoiceAssistant /> : <ChatAssistant />}
        </motion.div>
      </main>

      {/* Minimalist Footer */}
      <footer className="w-full border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Bank-Grade Encryption & AI Privacy</span>
          </div>
          <span>DhanMITR — Intelligent Personal Finance Advisory</span>
        </div>
      </footer>
    </div>
  );
}
