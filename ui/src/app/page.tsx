"use client";

import React, { useState } from "react";
import { Logo } from "@/components/Logo";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { ChatAssistant } from "@/components/ChatAssistant";
import { Mic, MessageSquare, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"voice" | "chat">("voice");

  return (
    <div className="min-h-[100dvh] bg-white text-slate-900 flex flex-col justify-between selection:bg-slate-100 selection:text-slate-900 overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-slate-100/90 bg-white/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-3.5 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
          {/* Custom SVG Logo */}
          <Logo size={36} showText={true} />

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/60 shadow-inner">
            <button
              onClick={() => setActiveTab("voice")}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === "voice"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice Mode</span>
              <span className="sm:hidden">Voice</span>
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === "chat"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chat Mode</span>
              <span className="sm:hidden">Chat</span>
            </button>
          </div>

          {/* Status Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI Online
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-8 flex flex-col justify-center">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          {activeTab === "voice" ? <VoiceAssistant /> : <ChatAssistant />}
        </motion.div>
      </main>

      {/* Minimalist Footer */}
      <footer className="w-full border-t border-slate-100 py-4 sm:py-6 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <span>Bank-Grade Encryption & AI Privacy</span>
          </div>
          <span>DhanMITR — Intelligent Personal Finance Assistant</span>
        </div>
      </footer>
    </div>
  );
}
