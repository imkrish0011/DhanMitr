"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { ChatAssistant } from "@/components/ChatAssistant";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Mic, MessageSquare, ShieldCheck, User } from "lucide-react";
import { motion } from "framer-motion";
import { LanguageCode } from "@/lib/languages";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"voice" | "chat">("voice");
  const [language, setLanguage] = useState<LanguageCode>("hi");

  return (
    <div className="min-h-[100dvh] bg-white text-slate-900 flex flex-col justify-between selection:bg-slate-100 selection:text-slate-900 overflow-x-hidden pb-16 sm:pb-0">
      {/* Top Header: Brand, 1-Tap Language Switcher, Sign In */}
      <header className="w-full border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo size={32} showText={true} />
          </Link>

          {/* Top Controls: Language Switcher + User Profile */}
          <div className="flex items-center gap-2">
            <LanguageSelector currentLang={language} onSelectLang={setLanguage} />
            <Link
              href="/login"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95 touch-manipulation"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-2.5 sm:px-6 py-2 sm:py-6 flex flex-col justify-center">
        <motion.div
          key={activeTab + language}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
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

      {/* Bottom Floating Ergonomic Dock for Mobile & Desktop Mode Switcher */}
      <div className="fixed sm:static bottom-0 inset-x-0 z-40 bg-white/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t sm:border-t-0 border-slate-200/80 p-2 sm:py-4">
        <div className="max-w-xs mx-auto flex items-center justify-center p-1 rounded-2xl bg-slate-100 border border-slate-200/80 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("voice")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 active:scale-95 touch-manipulation ${
              activeTab === "voice"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Mic className="w-4 h-4 text-emerald-400" />
            <span>{language === "hi" ? "बोलकर पूछें" : "Voice Mode"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 active:scale-95 touch-manipulation ${
              activeTab === "chat"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span>{language === "hi" ? "लिखकर पूछें" : "Chat Mode"}</span>
          </button>
        </div>
      </div>

      {/* Minimal Footer (Desktop) */}
      <footer className="hidden sm:block w-full border-t border-slate-100 py-3 text-center text-xs text-slate-400">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% सुरक्षित और निःशुल्क (Safe & Free)</span>
          </div>
          <span>DhanMITR AI</span>
        </div>
      </footer>
    </div>
  );
}
