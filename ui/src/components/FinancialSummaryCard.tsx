"use client";

import React from "react";
import { TrendingUp, ShieldCheck, Film, Wallet, Settings2, Sparkles } from "lucide-react";
import { UserFinancialProfile, calculateFinancialSummary } from "@/lib/userProfile";

interface FinancialSummaryCardProps {
  profile: UserFinancialProfile;
  onEditProfile: () => void;
}

export function FinancialSummaryCard({ profile, onEditProfile }: FinancialSummaryCardProps) {
  const summary = calculateFinancialSummary(profile);

  return (
    <div className="w-full bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-4 transition-all">
      <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-extrabold text-slate-900">
            {profile.name}&apos;s Cashflow Overview
          </span>
        </div>
        <button
          type="button"
          onClick={onEditProfile}
          className="text-[11px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors p-1"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Income */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Income / mo
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900">
            ₹{profile.monthlyIncome.toLocaleString()}
          </span>
        </div>

        {/* Total Outflow */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Outflow / mo
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900">
            ₹{summary.totalOutflow.toLocaleString()}
          </span>
        </div>

        {/* Net Savings */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
            Surplus Savings
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs sm:text-sm font-extrabold text-emerald-700">
              ₹{summary.netSurplus.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-emerald-600">({summary.savingsRate}%)</span>
          </div>
        </div>

        {/* Subscriptions & Policies */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Tracked Items
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900">
            {profile.subscriptions.length} OTT • {profile.insurances.length} Ins.
          </span>
        </div>
      </div>
    </div>
  );
}

export default FinancialSummaryCard;
