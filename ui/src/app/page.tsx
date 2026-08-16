"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { ChatAssistant } from "@/components/ChatAssistant";
import { BottomNav } from "@/components/BottomNav";
import { Mic, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { LanguageCode } from "@/lib/languages";
import { UserFinancialProfile } from "@/types";
import { DEFAULT_DEMO_PROFILE, loadUserProfile, saveUserProfile } from "@/lib/userProfile";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"voice" | "chat">("voice");
  const [language, setLanguage] = useState<LanguageCode>("hi");
  const [profile, setProfile] = useState<UserFinancialProfile>(DEFAULT_DEMO_PROFILE);

  useEffect(() => {
    const saved = loadUserProfile();
    setProfile(saved);
  }, []);

  const handleSyncReset = () => {
    saveUserProfile(DEFAULT_DEMO_PROFILE);
    setProfile(DEFAULT_DEMO_PROFILE);
  };

  return (
    <div className="min-h-[100dvh] bg-[#FFFFFF] text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-950 overflow-x-hidden pb-20 sm:pb-22">
      {/* Universal Top Header (Identical across Home and Finance Hub) */}
      <Navbar
        language={language}
        onSelectLang={setLanguage}
        onSync={handleSyncReset}
        userName={profile.name}
        showBack={false}
      />

      {/* Main Screen Content */}
      <main className="flex-1 max-w-xl mx-auto w-full px-3 sm:px-4 py-4 flex flex-col justify-start">
        {/* Top Talk / Type Mode Switcher Pill */}
        <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-100 border border-slate-200/80 mb-3 max-w-xs mx-auto w-full">
          <button
            type="button"
            onClick={() => setActiveTab("voice")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "voice"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Mic className={`w-3.5 h-3.5 ${activeTab === "voice" ? "text-emerald-600" : "text-slate-400"}`} />
            <span>{language === "hi" ? "बोलें (Talk)" : "Talk Mode"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "chat"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <MessageSquare className={`w-3.5 h-3.5 ${activeTab === "chat" ? "text-emerald-600" : "text-slate-400"}`} />
            <span>{language === "hi" ? "लिखें (Type)" : "Type Mode"}</span>
          </button>
        </div>

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

      {/* Universal Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab="home"
        onSelectTab={(tab) => {
          if (tab === "home") setActiveTab("voice");
        }}
      />
    </div>
  );
}
