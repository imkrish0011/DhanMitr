'use client';

import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { EditRecordModal, EditableItem } from '@/components/finance/Modals/EditRecordModal';
import {
  Wallet,
  ArrowDownRight,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  PieChart,
  Sparkles,
  Briefcase,
  Laptop,
  Building,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Utensils,
  Home,
  ShoppingCart,
  Zap,
  Car,
  HeartPulse,
  Scale,
  Calendar,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  Target,
  Flame,
  Info,
  ChevronRight,
  CreditCard,
  Percent,
} from 'lucide-react';

interface BudgetIncomeTabProps {
  onOpenAddModal: (type?: any) => void;
}

export const BudgetIncomeTab: React.FC<BudgetIncomeTabProps> = ({ onOpenAddModal }) => {
  const {
    incomeSources,
    budgetItems,
    spendingCategories,
    totalIncome,
    totalOutflow,
    netSurplus,
    savingsRate,
    emergencyRunwayMonths,
    deleteIncomeSource,
    deleteBudgetItem,
  } = useFinance();

  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
  const [mobileSection, setMobileSection] = useState<'caps' | 'income'>('caps');

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const annualSurplus = Math.max(0, netSurplus * 12);
  const threeYearWealth = Math.round(annualSurplus * 3.35); // 8% CAGR compounding estimate

  // 1. Calculate Financial Health Score (0 - 100)
  const healthAssessment = useMemo(() => {
    let score = 0;
    // Savings Rate (up to 40 pts)
    if (savingsRate >= 25) score += 40;
    else if (savingsRate >= 15) score += 30;
    else if (savingsRate >= 5) score += 18;
    else score += 8;

    // Runway cushion (up to 30 pts)
    if (emergencyRunwayMonths >= 6) score += 30;
    else if (emergencyRunwayMonths >= 3) score += 20;
    else if (emergencyRunwayMonths >= 1) score += 12;
    else score += 5;

    // Burn velocity (up to 30 pts)
    const burnRatio = totalIncome > 0 ? totalOutflow / totalIncome : 1;
    if (burnRatio <= 0.6) score += 30;
    else if (burnRatio <= 0.8) score += 20;
    else if (burnRatio <= 0.95) score += 10;
    else score += 5;

    score = Math.min(100, Math.max(25, score));

    if (score >= 80) {
      return {
        score,
        tier: 'Sovereign Tier',
        status: 'Excellent Health',
        color: 'emerald',
        summary: `You save ${savingsRate}% of income and have ${emergencyRunwayMonths} months of protected runway cushion.`,
      };
    } else if (score >= 60) {
      return {
        score,
        tier: 'Growth Tier',
        status: 'Healthy Trajectory',
        color: 'teal',
        summary: `Your cash flow is steady with a monthly surplus of ${formatCurrency(netSurplus)}.`,
      };
    } else if (score >= 40) {
      return {
        score,
        tier: 'Balanced Tier',
        status: 'Watch Discretionary',
        color: 'amber',
        summary: 'Outflows are high relative to income. Setting spend caps on dining and shopping will optimize surplus.',
      };
    } else {
      return {
        score,
        tier: 'Action Required',
        status: 'High Burn Velocity',
        color: 'rose',
        summary: 'Total monthly outflows exceed or closely match your income. Immediate budgeting recommended.',
      };
    }
  }, [savingsRate, emergencyRunwayMonths, totalIncome, totalOutflow, netSurplus]);

  // 2. Compute 50/30/20 Rule Breakdown (Needs, Wants, Savings)
  const rule503020 = useMemo(() => {
    const safeIncome = totalIncome > 0 ? totalIncome : (totalOutflow + Math.max(0, netSurplus)) || 50000;
    const needsKeywords = ['house', 'rent', 'grocer', 'util', 'bill', 'elect', 'health', 'med', 'insur', 'living'];

    let needsSpent = 0;
    let wantsSpent = 0;

    spendingCategories.forEach((cat) => {
      const name = cat.category.toLowerCase();
      const isNeed = needsKeywords.some((k) => name.includes(k));
      if (isNeed) {
        needsSpent += cat.amount;
      } else {
        wantsSpent += cat.amount;
      }
    });

    if (needsSpent === 0 && wantsSpent === 0 && totalOutflow > 0) {
      needsSpent = Math.round(totalOutflow * 0.62);
      wantsSpent = Math.round(totalOutflow * 0.38);
    }

    const needsTarget = Math.round(safeIncome * 0.50);
    const wantsTarget = Math.round(safeIncome * 0.30);
    const savingsTarget = Math.round(safeIncome * 0.20);

    const needsPercent = Math.round((needsSpent / safeIncome) * 100);
    const wantsPercent = Math.round((wantsSpent / safeIncome) * 100);
    const savingsPercent = Math.max(0, Math.round((netSurplus / safeIncome) * 100));

    return {
      safeIncome,
      needs: {
        spent: needsSpent,
        target: needsTarget,
        percent: needsPercent,
        isSafe: needsPercent <= 50,
      },
      wants: {
        spent: wantsSpent,
        target: wantsTarget,
        percent: wantsPercent,
        isSafe: wantsPercent <= 30,
      },
      savings: {
        saved: Math.max(0, netSurplus),
        target: savingsTarget,
        percent: savingsPercent,
        isSafe: savingsPercent >= 20,
      },
    };
  }, [spendingCategories, totalIncome, totalOutflow, netSurplus]);

  // Top expense category
  const topCategory = useMemo(() => {
    if (!spendingCategories || spendingCategories.length === 0) return null;
    const sorted = [...spendingCategories].filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);
    return sorted[0] || null;
  }, [spendingCategories]);

  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('food') || c.includes('dine') || c.includes('grocer'))
      return <Utensils className="w-4 h-4 text-amber-500" />;
    if (c.includes('house') || c.includes('rent') || c.includes('home'))
      return <Home className="w-4 h-4 text-blue-500" />;
    if (c.includes('shop') || c.includes('cloth') || c.includes('e-comm'))
      return <ShoppingCart className="w-4 h-4 text-purple-500" />;
    if (c.includes('util') || c.includes('bill') || c.includes('elect'))
      return <Zap className="w-4 h-4 text-yellow-500" />;
    if (c.includes('travel') || c.includes('fuel') || c.includes('transport'))
      return <Car className="w-4 h-4 text-indigo-500" />;
    if (c.includes('health') || c.includes('med') || c.includes('insur'))
      return <HeartPulse className="w-4 h-4 text-rose-500" />;
    return <PieChart className="w-4 h-4 text-emerald-500" />;
  };

  const getIncomeIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('salary') || t.includes('job') || t.includes('corp'))
      return <Briefcase className="w-4 h-4 text-blue-500" />;
    if (t.includes('free') || t.includes('client') || t.includes('consult'))
      return <Laptop className="w-4 h-4 text-purple-500" />;
    if (t.includes('rent') || t.includes('property') || t.includes('asset'))
      return <Building className="w-4 h-4 text-amber-500" />;
    return <Coins className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="space-y-5 pb-2">
      {/* 1. Header Banner & Financial Health Pulse (Titanium Obsidian-Emerald Card) */}
      <div className="relative p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#06241a] via-[#041a12] to-[#010e0a] text-white shadow-[0_20px_45px_-12px_rgba(5,150,105,0.25)] border border-emerald-500/25 overflow-hidden">
        {/* Ambient halo glow */}
        <div className="absolute top-0 right-0 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Health Pulse
              </span>
              <span className="text-[11px] font-semibold text-emerald-200/80">
                {healthAssessment.tier}
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono tabular-nums">
                {healthAssessment.score}
                <span className="text-lg sm:text-xl font-normal text-emerald-400/80">/100</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-xs font-bold text-emerald-300">
                {healthAssessment.status}
              </span>
            </div>

            <p className="text-xs text-emerald-100/80 max-w-lg leading-relaxed pt-0.5">
              {healthAssessment.summary}
            </p>
          </div>

          {/* Quick Metrics Capsule Bar */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md shrink-0">
            <div className="px-3 py-1.5 text-center">
              <span className="text-[9px] font-mono uppercase text-emerald-200/70 block">Savings</span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-400 block mt-0.5">
                {savingsRate}%
              </span>
              <span className="text-[8px] text-emerald-300/60 block">Target 20%+</span>
            </div>
            <div className="px-3 py-1.5 text-center border-x border-white/10">
              <span className="text-[9px] font-mono uppercase text-emerald-200/70 block">Burn Ratio</span>
              <span className="text-sm sm:text-base font-black font-mono text-white block mt-0.5">
                {totalIncome > 0 ? Math.round((totalOutflow / totalIncome) * 100) : 0}%
              </span>
              <span className="text-[8px] text-emerald-300/60 block">Ideal &lt;70%</span>
            </div>
            <div className="px-3 py-1.5 text-center">
              <span className="text-[9px] font-mono uppercase text-emerald-200/70 block">Runway</span>
              <span className="text-sm sm:text-base font-black font-mono text-teal-300 block mt-0.5">
                {emergencyRunwayMonths}m
              </span>
              <span className="text-[8px] text-emerald-300/60 block">Safety Net</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. The 50 / 30 / 20 Golden Rule Framework (Crystal Clear Understandability) */}
      <div className="fintech-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                The 50 / 30 / 20 Golden Rule
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Standard
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Optimal split for living expenses, lifestyle, and wealth building
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Income Basis: {formatCurrency(rule503020.safeIncome)}</span>
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Pillar 1: Needs (Max 50%) */}
          <div className="p-3.5 rounded-2xl bg-slate-500/[0.03] dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-blue-500" />
                Needs (Max 50%)
              </span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                rule503020.needs.isSafe
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              }`}>
                {rule503020.needs.percent}% of income
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="font-black text-slate-900 dark:text-white text-sm">
                {formatCurrency(rule503020.needs.spent)}
              </span>
              <span className="text-[10px] text-slate-400">
                Cap: {formatCurrency(rule503020.needs.target)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  rule503020.needs.isSafe ? 'bg-blue-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, (rule503020.needs.percent / 50) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Rent, groceries, utilities, and insurance essentials.
            </p>
          </div>

          {/* Pillar 2: Wants (Max 30%) */}
          <div className="p-3.5 rounded-2xl bg-slate-500/[0.03] dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-500" />
                Wants (Max 30%)
              </span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                rule503020.wants.isSafe
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              }`}>
                {rule503020.wants.percent}% of income
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="font-black text-slate-900 dark:text-white text-sm">
                {formatCurrency(rule503020.wants.spent)}
              </span>
              <span className="text-[10px] text-slate-400">
                Cap: {formatCurrency(rule503020.wants.target)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  rule503020.wants.isSafe ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, (rule503020.wants.percent / 30) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Dining, entertainment, OTT subscriptions, shopping.
            </p>
          </div>

          {/* Pillar 3: Savings (Min 20%) */}
          <div className="p-3.5 rounded-2xl bg-slate-500/[0.03] dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                Savings (Min 20%)
              </span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                rule503020.savings.isSafe
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              }`}>
                {rule503020.savings.percent}% achieved
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs font-mono">
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                +{formatCurrency(rule503020.savings.saved)}
              </span>
              <span className="text-[10px] text-slate-400">
                Target: {formatCurrency(rule503020.savings.target)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                style={{ width: `${Math.min(100, (rule503020.savings.percent / 20) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Net monthly surplus compounding into your future.
            </p>
          </div>
        </div>
      </div>

      {/* 3. High-Impact Actionable Insights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Insight 1: 3-Year Compounding Potential */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-transparent border border-emerald-500/20 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Compounding Power
            </span>
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded">
              3-Yr Horizon
            </span>
          </div>
          <h4 className="text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white">
            {formatCurrency(threeYearWealth)}
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Accumulated wealth if current ₹{netSurplus.toLocaleString('en-IN')}/mo surplus is consistently invested at 8% CAGR.
          </p>
        </div>

        {/* Insight 2: Runway Defense */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent dark:from-teal-950/40 dark:via-teal-950/20 dark:to-transparent border border-teal-500/20 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Runway Defense
            </span>
            <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 bg-teal-500/15 px-1.5 py-0.2 rounded">
              Safe
            </span>
          </div>
          <h4 className="text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white">
            {emergencyRunwayMonths} Months
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Zero-income survival duration covering your essential fixed living obligations.
          </p>
        </div>

        {/* Insight 3: Top Spend Driver */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-950/40 dark:via-blue-950/20 dark:to-transparent border border-blue-500/20 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              Primary Outflow
            </span>
            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/15 px-1.5 py-0.2 rounded">
              {topCategory?.percentage || 0}% Share
            </span>
          </div>
          <h4 className="text-lg font-black font-mono tabular-nums text-slate-900 dark:text-white truncate">
            {topCategory?.category || 'Living Expenses'}
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Consumes {formatCurrency(topCategory?.amount || 0)} monthly. Keeping this capped protects your surplus.
          </p>
        </div>
      </div>

      {/* 4. Proportional Spending Distribution Multi-Bar */}
      {spendingCategories.length > 0 && totalOutflow > 0 && (
        <div className="fintech-card rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-emerald-500" />
              Category Outflow Distribution
            </h4>
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
              Total: {formatCurrency(totalOutflow)}
            </span>
          </div>

          {/* Stacked Proportional Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
            {spendingCategories
              .filter((c) => c.amount > 0)
              .map((c) => (
                <div
                  key={c.id}
                  style={{
                    width: `${c.percentage}%`,
                    backgroundColor: c.color || '#10B981',
                  }}
                  title={`${c.category}: ${c.percentage}% (${formatCurrency(c.amount)})`}
                  className="h-full transition-all hover:opacity-80"
                />
              ))}
          </div>

          {/* Category Chips Grid */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {spendingCategories
              .filter((c) => c.amount > 0)
              .map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-500/[0.04] dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] text-[10px]"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: c.color || '#10B981' }}
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{c.category}</span>
                  <span className="font-mono text-slate-400">{c.percentage}%</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 5. Interactive Section: Spend Caps & Income Channels */}
      <div className="space-y-4">
        {/* Mobile Section Toggle Pills */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-[#0c1220]/90 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-inner">
            <button
              onClick={() => setMobileSection('caps')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mobileSection === 'caps'
                  ? 'bg-white dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 shadow-xs border border-slate-200/60 dark:border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Spending Caps ({budgetItems.length})
            </button>
            <button
              onClick={() => setMobileSection('income')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mobileSection === 'income'
                  ? 'bg-white dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 shadow-xs border border-slate-200/60 dark:border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Income Streams ({incomeSources.length})
            </button>
          </div>

          <button
            onClick={() => onOpenAddModal(mobileSection === 'caps' ? 'budget_cap' : 'income')}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{mobileSection === 'caps' ? 'Set Cap' : 'Add Stream'}</span>
          </button>
        </div>

        {/* SECTION: Spending Caps List */}
        {mobileSection === 'caps' && (
          <div className="space-y-2.5">
            {budgetItems.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-3 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center mx-auto">
                  <PieChart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    No Category Spend Caps Active
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto mt-1">
                    Set spend thresholds on Housing, Dining, Shopping, and Utilities to automatically guard your surplus.
                  </p>
                </div>
                <button
                  onClick={() => onOpenAddModal('budget_cap')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Set First Spend Cap</span>
                </button>
              </div>
            ) : (
              budgetItems.map((item) => {
                const percentUsed = Math.min(100, Math.round((item.spent / (item.allocated || 1)) * 100));
                const isExceeded = item.spent > item.allocated;
                const remaining = Math.max(0, (item.allocated || 0) - (item.spent || 0));

                return (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 rounded-2xl space-y-2.5 shadow-2xs hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate block">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono truncate">
                            {isExceeded ? (
                              <>
                                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                <span className="text-rose-500 font-bold">Cap exceeded by {formatCurrency(item.spent - item.allocated)}</span>
                              </>
                            ) : (
                              <span>{formatCurrency(remaining)} headroom remaining</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right font-mono">
                          <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm block tabular-nums">
                            {formatCurrency(item.spent)}
                          </span>
                          <span className="text-slate-400 text-[10px] block tabular-nums">
                            of {formatCurrency(item.allocated)}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                            isExceeded
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                              : percentUsed > 80
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {percentUsed}%
                        </span>

                        <div className="flex items-center gap-0.5 pl-1 border-l border-slate-100 dark:border-white/10">
                          <button
                            onClick={() => setEditingItem({ type: 'budget', data: item })}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                            title="Edit Cap"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteBudgetItem(item.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Delete Cap"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExceeded
                            ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                            : percentUsed > 80
                            ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                            : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                        }`}
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* SECTION: Income Channels List */}
        {mobileSection === 'income' && (
          <div className="space-y-2.5">
            {incomeSources.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-3 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    No Income Streams Added
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto mt-1">
                    Log your salary, freelance client payments, or dividends to track your cash inflows.
                  </p>
                </div>
                <button
                  onClick={() => onOpenAddModal('income')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Inflow</span>
                </button>
              </div>
            ) : (
              incomeSources.map((inc) => {
                const percentOfTotal = totalIncome > 0 ? Math.round((inc.amount / totalIncome) * 100) : 100;

                return (
                  <div
                    key={inc.id}
                    className="p-3.5 sm:p-4 bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 rounded-2xl flex items-center justify-between shadow-2xs hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0">
                        {getIncomeIcon(inc.title)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {inc.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-slate-400" />
                            {inc.date || 'Monthly'}
                          </span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                            {percentOfTotal}% of total
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs sm:text-sm font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(inc.amount)}
                      </span>
                      <div className="flex items-center gap-0.5 pl-1 border-l border-slate-100 dark:border-white/10">
                        <button
                          onClick={() => setEditingItem({ type: 'income', data: inc })}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteIncomeSource(inc.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Edit Record Modal Trigger */}
      {editingItem && (
        <EditRecordModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          item={editingItem}
        />
      )}
    </div>
  );
};
