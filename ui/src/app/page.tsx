"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { ChatAssistant } from "@/components/ChatAssistant";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Mic, MessageSquare, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { LanguageCode } from "@/lib/languages";
import { UserFinancialProfile } from "@/types";
import { DEFAULT_DEMO_PROFILE, loadUserProfile } from "@/lib/userProfile";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"voice" | "chat">("voice");
  const [language, setLanguage] = useState<LanguageCode>("hi");
  const [profile, setProfile] = useState<UserFinancialProfile>(DEFAULT_DEMO_PROFILE);

  useEffect(() => {
    const saved = loadUserProfile();
    setProfile(saved);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#FFFFFF] text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-950 overflow-x-hidden pb-[72px] sm:pb-[74px]">
      {/* Top Header Navigation (Matching Mockup) */}
      <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Logo size={28} showText={false} />
            <span className="text-base font-extrabold tracking-tight text-slate-900">DhanMITR</span>
          </Link>

          {/* Right: Language Toggle + Finance Hub */}
          <div className="flex items-center gap-2">
            <LanguageSelector currentLang={language} onSelectLang={setLanguage} />

            <Link
              href="/admin"
              prefetch={true}
              className="h-8 px-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation shadow-2xs"
              title="Open Personal Finance Admin Hub"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Finance Hub</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="flex-1 max-w-xl mx-auto w-full px-3 sm:px-4 py-3 flex flex-col justify-start">
        <motion.div
          key={activeTab + language}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full"
        >
          {activeTab === "voice" ? (
            <VoiceAssistant
              language={language}
              profile={profile}
              onSendQuery={() => setActiveTab("chat")}
            />
          ) : (
            <ChatAssistant language={language} profile={profile} />
          )}
        </motion.div>
      </main>

      {/* Bottom Floating Navigation Dock [ Talk | Type ] (Matching Mockup) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80">
        <div className="max-w-md mx-auto flex items-center p-2 gap-2">
          {/* Talk Button */}
          <button
            type="button"
            onClick={() => setActiveTab("voice")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 touch-manipulation ${
              activeTab === "voice"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 hover:text-slate-900"
            }`}
          >
            <Mic className={`w-4 h-4 ${activeTab === "voice" ? "text-emerald-400" : "text-slate-500"}`} />
            <span>{language === "hi" ? "बोलें (Talk)" : "Talk"}</span>
          </button>

          {/* Type Button */}
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 touch-manipulation ${
              activeTab === "chat"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className={`w-4 h-4 ${activeTab === "chat" ? "text-emerald-400" : "text-slate-500"}`} />
            <span>{language === "hi" ? "लिखें (Type)" : "Type"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
