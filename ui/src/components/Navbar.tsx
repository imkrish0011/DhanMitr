"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LanguageSelector } from "@/components/LanguageSelector";
import { LanguageCode } from "@/lib/languages";
import { 
  ShieldCheck, 
  MessageSquare, 
  Bell, 
  RotateCcw, 
  Sparkles,
  ArrowLeft
} from "lucide-react";

interface NavbarProps {
  language?: LanguageCode;
  onSelectLang?: (lang: LanguageCode) => void;
  onSync?: () => void;
  userName?: string;
  showBack?: boolean;
}

export function Navbar({
  language = "hi",
  onSelectLang,
  onSync,
  userName = "Rahul Sharma",
  showBack = false,
}: NavbarProps) {
  const pathname = usePathname();
  const isFinanceHub = pathname === "/admin";

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
        {/* Left: Back button (if mobile) + Brand Logo */}
        <div className="flex items-center gap-3">
          {showBack && (
            <Link
              href="/"
              prefetch={true}
              className="lg:hidden p-1 -ml-1 text-slate-700 hover:text-slate-900 transition-colors"
              title="Back to AI Companion"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}

          <Link href="/" prefetch={true} className="flex items-center gap-2.5 flex-shrink-0 group">
            <Logo size={28} showText={false} />
            <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
              DhanMITR
            </span>
          </Link>
        </div>

        {/* Right: Uniform Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          {onSelectLang && (
            <LanguageSelector currentLang={language} onSelectLang={onSelectLang} />
          )}

          {/* Sync / Refresh Button */}
          {onSync && (
            <button
              type="button"
              onClick={onSync}
              className="h-8 px-2.5 sm:px-3 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
              title="Sync & Reset Demo Data"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">Sync</span>
            </button>
          )}

          {/* Direct Route Switcher (AI Companion vs Finance Hub) */}
          {isFinanceHub ? (
            <Link
              href="/"
              prefetch={true}
              className="h-8 px-3 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
              title="Open AI Companion"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">AI Companion</span>
            </Link>
          ) : (
            <Link
              href="/admin"
              prefetch={true}
              className="h-8 px-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
              title="Open Finance Hub"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Finance Hub</span>
            </Link>
          )}

          {/* Notification Bell */}
          <button
            type="button"
            className="relative w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* User Profile Avatar Pill */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-extrabold shadow-2xs">
              {userName ? userName.charAt(0) : "R"}
            </div>
            <span className="text-xs font-bold text-slate-900 hidden md:inline">
              {userName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
