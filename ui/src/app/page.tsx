"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { ChatAssistant } from "@/components/ChatAssistant";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Mic, MessageSquare, User, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { LanguageCode } from "@/lib/languages";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"voice" | "chat">("voice");
  const [language, setLanguage] = useState<LanguageCode>("hi");

  return (
    <div className="min-h-[100dvh] bg-white text-slate-900 flex flex-col selection:bg-slate-100 selection:text-slate-900 overflow-x-hidden pb-[68px] sm:pb-[68px]">
      {/* ─── NAVBAR ─── Minimal, centered, no clutter */}
      <header className="w-full bg-white sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Logo size={28} showText={false} />
            <span className="text-base font-extrabold tracking-tight text-slate-900">DhanMITR</span>
          </Link>

          {/* Right: Language + Sign in */}
          <div className="flex items-center gap-2.5">
            <LanguageSelector currentLang={language} onSelectLang={setLanguage} />
            <Link
              href="/login"
              className="h-8 px-3 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 transition-all hover:bg-slate-800 active:scale-95 touch-manipulation"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          </div>
        </div>
        {/* Thin accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-3 sm:px-6 py-2 sm:py-4 flex flex-col justify-start">
        <motion.div
          key={activeTab + language}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full"
        >
          {activeTab === "voice" ? (
            <VoiceAssistant language={language} />
          ) : (
            <ChatAssistant language={language} />
          )}
        </motion.div>
      </main>

      {/* ─── BOTTOM DOCK ─── Fixed thumb-friendly mode switcher */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 safe-area-bottom">
        <div className="max-w-md mx-auto flex items-center p-1.5 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("voice")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 touch-manipulation ${
              activeTab === "voice"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-50 text-slate-600"
            }`}
          >
            <Mic className={`w-4 h-4 ${activeTab === "voice" ? "text-emerald-400" : "text-slate-400"}`} />
            <span>{language === "hi" ? "🎙️ बोलकर पूछें" : "🎙️ Voice"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 touch-manipulation ${
              activeTab === "chat"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-50 text-slate-600"
            }`}
          >
            <MessageSquare className={`w-4 h-4 ${activeTab === "chat" ? "text-emerald-400" : "text-slate-400"}`} />
            <span>{language === "hi" ? "💬 लिखकर पूछें" : "💬 Chat"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
