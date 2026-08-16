"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { ChatAssistant } from "@/components/ChatAssistant";
import { RenewalAlerts } from "@/components/RenewalAlerts";
import { FinancialSummaryCard } from "@/components/FinancialSummaryCard";
import { FinancialOnboarding } from "@/components/FinancialOnboarding";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Mic, MessageSquare, Bell, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageCode } from "@/lib/languages";
import { UserFinancialProfile } from "@/types";
import { DEFAULT_DEMO_PROFILE, loadUserProfile, saveUserProfile, calculateFinancialSummary } from "@/lib/userProfile";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"voice" | "chat" | "renewals">("voice");
  const [language, setLanguage] = useState<LanguageCode>("hi");
  const [profile, setProfile] = useState<UserFinancialProfile>(DEFAULT_DEMO_PROFILE);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const saved = loadUserProfile();
    setProfile(saved);
    setIsLoaded(true);
  }, []);

  const handleProfileComplete = (updated: UserFinancialProfile) => {
    setProfile(updated);
    saveUserProfile(updated);
    setIsEditingProfile(false);
  };

  const summary = isLoaded ? calculateFinancialSummary(profile) : null;
  const urgentCount = summary?.upcomingRenewals.filter((r) => r.urgent).length || 0;

  return (
    <div className="min-h-[100dvh] bg-white text-slate-900 flex flex-col selection:bg-slate-100 selection:text-slate-900 overflow-x-hidden pb-[74px] sm:pb-[74px]">
      {/* Top Navbar */}
      <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Logo size={28} showText={false} />
            <span className="text-base font-extrabold tracking-tight text-slate-900">DhanMITR</span>
          </Link>

          {/* Right: Language Segmented Switcher + Profile / Sign In */}
          <div className="flex items-center gap-2">
            <LanguageSelector currentLang={language} onSelectLang={setLanguage} />
            
            <button
              type="button"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation"
              title="Manage Financial Profile"
            >
              <User className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline font-semibold">{profile.name.split(" ")[0]}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-3 sm:px-6 py-2.5 sm:py-4 flex flex-col justify-start space-y-3">
        <AnimatePresence mode="wait">
          {isEditingProfile ? (
            /* Onboarding / Profile Setup Form */
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              <FinancialOnboarding
                initialProfile={profile}
                onComplete={handleProfileComplete}
                onCancel={() => setIsEditingProfile(false)}
              />
            </motion.div>
          ) : (
            /* Standard AI Finance Dashboard */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-3"
            >
              {/* Financial Cashflow Metric Strip */}
              <FinancialSummaryCard
                profile={profile}
                onEditProfile={() => setIsEditingProfile(true)}
              />

              {/* Dynamic View Tab */}
              <div className="w-full">
                {activeTab === "voice" && (
                  <VoiceAssistant language={language} profile={profile} />
                )}

                {activeTab === "chat" && (
                  <ChatAssistant language={language} profile={profile} />
                )}

                {activeTab === "renewals" && (
                  <RenewalAlerts
                    profile={profile}
                    onOpenSetup={() => setIsEditingProfile(true)}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Floating Thumb Dock */}
      {!isEditingProfile && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80">
          <div className="max-w-md mx-auto flex items-center p-1.5 gap-1.5">
            {/* Voice Mode */}
            <button
              type="button"
              onClick={() => setActiveTab("voice")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 touch-manipulation ${
                activeTab === "voice"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mic className={`w-4 h-4 ${activeTab === "voice" ? "text-emerald-400" : "text-slate-500"}`} />
              <span>{language === "hi" ? "बोलकर पूछें" : "Voice"}</span>
            </button>

            {/* Chat Mode */}
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 touch-manipulation ${
                activeTab === "chat"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900"
              }`}
            >
              <MessageSquare className={`w-4 h-4 ${activeTab === "chat" ? "text-emerald-400" : "text-slate-500"}`} />
              <span>{language === "hi" ? "चैट" : "Chat"}</span>
            </button>

            {/* Alerts & Renewals Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("renewals")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 touch-manipulation relative ${
                activeTab === "renewals"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900"
              }`}
            >
              <Bell className={`w-4 h-4 ${activeTab === "renewals" ? "text-emerald-400" : "text-slate-500"}`} />
              <span>{language === "hi" ? "अलर्ट" : "Alerts"}</span>
              {urgentCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-2.5 right-4 ring-2 ring-white" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
