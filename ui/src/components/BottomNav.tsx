"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Lightbulb, 
  Receipt, 
  User, 
  Sparkles,
  ShieldCheck
} from "lucide-react";

interface BottomNavProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  const pathname = usePathname();
  const isFinanceHub = pathname === "/admin";

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] lg:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5 h-16 relative">
        {/* 1. Home / AI Companion */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[10px] font-bold transition-colors ${
            !isFinanceHub ? "text-emerald-600" : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        {/* 2. Insights */}
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[10px] font-bold transition-colors ${
            isFinanceHub && activeTab === "insights" ? "text-emerald-600" : "text-slate-400 hover:text-slate-700"
          }`}
          onClick={() => onSelectTab && onSelectTab("overview")}
        >
          <Lightbulb className="w-5 h-5" />
          <span>Insights</span>
        </Link>

        {/* 3. Center Dark Floating AI Sparkle Button (Matching User Image 1) */}
        <div className="-mt-6 flex flex-col items-center">
          <Link
            href="/"
            prefetch={true}
            className="w-13 h-13 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg border-4 border-white transition-transform active:scale-90 touch-manipulation group"
            title="DhanMITR AI Assistant"
          >
            <Sparkles className="w-6 h-6 text-emerald-400 group-hover:rotate-12 transition-transform" />
          </Link>
        </div>

        {/* 4. Transactions */}
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[10px] font-bold transition-colors ${
            isFinanceHub && activeTab === "subscriptions" ? "text-emerald-600" : "text-slate-400 hover:text-slate-700"
          }`}
          onClick={() => onSelectTab && onSelectTab("subscriptions")}
        >
          <Receipt className="w-5 h-5" />
          <span>Transactions</span>
        </Link>

        {/* 5. Profile / Finance Hub */}
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-[10px] font-bold transition-colors ${
            isFinanceHub && activeTab === "budget" ? "text-emerald-600" : "text-slate-400 hover:text-slate-700"
          }`}
          onClick={() => onSelectTab && onSelectTab("budget")}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}

export default BottomNav;
