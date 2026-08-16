"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function InsightsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">AI Financial Insights</h1>
        <p className="text-sm text-slate-500">Actionable intelligence generated from your transactions, goals, and tax profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Insight 1: Tax Optimization */}
        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Zap className="h-4 w-4" /> Tax Optimization
            </span>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full font-semibold">High Impact</span>
          </CardHeader>
          <CardContent className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">Switch to New Tax Regime saves ₹14,200</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Given your current ₹12.5 LPA salary and minimal 80C deductions, opting for the revised New Tax Regime saves you ₹14,200 annually.
            </p>
            <Link href="/chat">
              <Button size="sm" variant="outline" className="w-full text-xs gap-1">
                Ask DhanMITR to breakdown deductions <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Insight 2: High Dining Outlays */}
        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Discretionary Spending
            </span>
            <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full font-semibold">Spending Alert</span>
          </CardHeader>
          <CardContent className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">Dining & Delivery increased +22%</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              You spent ₹6,200 on restaurants and food delivery apps this month. Trimming this by ₹2,000 can boost your SIP corpus by ₹3.8L over 5 years.
            </p>
            <Link href="/chat">
              <Button size="sm" variant="outline" className="w-full text-xs gap-1">
                Explore Budgeting Rules <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Insight 3: Emergency Fund */}
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Safety Cushion
            </span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full font-semibold">Goal Met</span>
          </CardHeader>
          <CardContent className="space-y-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">6-Month Emergency Fund Achieved</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Your liquid reserve of ₹3,60,000 covers 6.2 months of fixed expenses. You can now aggressively allocate surplus to long-term equity goals.
            </p>
            <Link href="/chat">
              <Button size="sm" variant="outline" className="w-full text-xs gap-1">
                Plan Equity Allocation <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
