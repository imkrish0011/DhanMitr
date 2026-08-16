"use client";

import React from "react";
import { Bell, Calendar, AlertCircle, CheckCircle, ArrowRight, Film, Shield, Sparkles } from "lucide-react";
import { UserFinancialProfile, calculateFinancialSummary, generatePersonalizedInsights } from "@/lib/userProfile";

interface RenewalAlertsProps {
  profile: UserFinancialProfile;
  onOpenSetup?: () => void;
}

export function RenewalAlerts({ profile, onOpenSetup }: RenewalAlertsProps) {
  const summary = calculateFinancialSummary(profile);
  const insights = generatePersonalizedInsights(profile);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              Upcoming Renewals & Expiry Alerts
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
              Next 30 days scheduled payments & policies
            </p>
          </div>
        </div>
        {onOpenSetup && (
          <button
            type="button"
            onClick={onOpenSetup}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors p-1"
          >
            Manage
          </button>
        )}
      </div>

      {/* Renewal Items */}
      <div className="space-y-2">
        {summary.upcomingRenewals.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400">
            No payments due in the next 30 days. All policies up to date.
          </div>
        ) : (
          summary.upcomingRenewals.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                item.urgent
                  ? "bg-amber-50/40 border-amber-200/80"
                  : "bg-slate-50/60 border-slate-200/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.type === "insurance"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {item.type === "insurance" ? (
                    <Shield className="w-3.5 h-3.5" />
                  ) : (
                    <Film className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {item.urgent && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Due Soon
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>
                      {item.type === "insurance" ? "Policy renewal on" : "Renews on"}{" "}
                      <strong className="text-slate-700">{item.date}</strong> ({item.daysLeft} days left)
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0 pl-2">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                  ₹{item.cost.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-semibold">
                  {item.billingCycle}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Smart Advisory Tip */}
      {insights.length > 0 && (
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950 font-medium leading-relaxed">
            <span className="font-bold text-emerald-900 block text-[11px] uppercase tracking-wider mb-0.5">
              DhanMITR AI Recommendation
            </span>
            {insights[0]}
          </div>
        </div>
      )}
    </div>
  );
}

export default RenewalAlerts;
