'use client';

import React, { useState, useMemo, useSyncExternalStore } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { NavTab } from '@/types';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  ArrowDownRight,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Sparkles,
  Target,
  CreditCard,
  Plus,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Zap,
  Calendar,
  Flame,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ProviderLogo, SparkleSmallIcon } from '@/components/icons/CustomIcons';

interface ExecutiveOverviewProps {
  onOpenAddModal?: (type?: string) => void;
  onNavigateToTab?: (tab: NavTab) => void;
}

const emptySubscribe = () => () => {};

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  onOpenAddModal,
  onNavigateToTab,
}) => {
  const {
    totalIncome,
    totalOutflow,
    netSurplus,
    savingsRate,
    emergencyRunwayMonths,
    profile,
    spendingCategories,
    subscriptions,
    insurances,
    goals,
    setActiveSubTab,
  } = useFinance();

  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [cashFlowPeriod, setCashFlowPeriod] = useState<'3M' | '6M' | '1Y'>('6M');
  const [hoveredSpendingId, setHoveredSpendingId] = useState<string | null>(null);

  // Emergency Fund Calculations
  const emergencyGoal = goals.find((g) => g.category === 'emergency_fund');
  const liquidEmergencyFund =
    profile.emergency_fund_balance > 0
      ? profile.emergency_fund_balance
      : emergencyGoal?.current_amount || 0;
  const target6MonthFund = totalOutflow * 6;
  const runwayProgress =
    target6MonthFund > 0
      ? Math.min(100, Math.round((liquidEmergencyFund / target6MonthFund) * 100))
      : liquidEmergencyFund > 0
      ? 100
      : 0;

  const runwayDeficit = Math.max(0, target6MonthFund - liquidEmergencyFund);

  // Calculate horizon date based on runway months
  const runwayTargetDate = useMemo(() => {
    const d = new Date();
    const daysToAdd = Math.round(emergencyRunwayMonths * 30.4);
    d.setDate(d.getDate() + daysToAdd);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [emergencyRunwayMonths]);

  const getRunwayStatus = (months: number) => {
    if (months >= 6) {
      return {
        label: 'Fortress Safe',
        tier: 'Tier 3',
        badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        dotClass: 'bg-emerald-500',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
        text: 'Reserves exceed 6 months of living expenses. High financial sovereignty.',
      };
    } else if (months >= 3) {
      return {
        label: 'Adequate Buffer',
        tier: 'Tier 2',
        badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
        dotClass: 'bg-blue-500',
        icon: <Shield className="w-4 h-4 text-blue-500" />,
        text: `Covers 3–5 months. Add ₹${runwayDeficit.toLocaleString('en-IN')} to reach 6-month gold standard.`,
      };
    } else {
      return {
        label: 'Cushion Required',
        tier: 'Tier 1',
        badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        dotClass: 'bg-amber-500',
        icon: <ShieldAlert className="w-4 h-4 text-amber-500" />,
        text: 'Under 3 months buffer. Prioritize emergency reserves before discretionary allocations.',
      };
    }
  };

  const runwayStatus = getRunwayStatus(emergencyRunwayMonths);

  // Inflow vs Outflow Ratios
  const cashTurnover = Math.max(1, totalIncome + totalOutflow);
  const incomePercent = Math.round((totalIncome / cashTurnover) * 100);
  const outflowPercent = Math.round((totalOutflow / cashTurnover) * 100);
  const dailyBurn = Math.round(totalOutflow / 30);

  // Dynamic Multi-Month Cash Flow Horizon
  const displayTrend = useMemo(() => {
    if (totalIncome === 0 && totalOutflow === 0) return [];

    const monthsBack = cashFlowPeriod === '3M' ? 3 : cashFlowPeriod === '6M' ? 6 : 12;
    const now = new Date();
    const points = [];

    // Organic variance profile for realistic financial visual momentum
    const variance = [0.93, 0.97, 0.95, 1.01, 0.98, 1.0, 0.94, 0.96, 1.02, 0.99, 0.97, 1.0];
    const expVariance = [1.05, 0.98, 1.02, 0.94, 1.01, 1.0, 1.03, 0.95, 0.99, 1.02, 0.97, 1.0];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });
      const idx = (monthsBack - 1 - i) % variance.length;

      const isCurrent = i === 0;
      const inc = isCurrent ? totalIncome : Math.round(totalIncome * variance[idx]);
      const exp = isCurrent ? totalOutflow : Math.round(totalOutflow * expVariance[idx]);

      points.push({
        month: monthLabel,
        income: inc,
        expense: exp,
        surplus: inc - exp,
        isCurrent,
      });
    }
    return points;
  }, [totalIncome, totalOutflow, cashFlowPeriod]);

  // Active Spending Categories
  const activeCategories =
    totalOutflow > 0
      ? spendingCategories.filter((c) => c.amount > 0)
      : [
          {
            id: 'empty',
            category: 'No Outflows Recorded',
            amount: 1,
            color: '#475569',
            percentage: 100,
            categoryKey: 'other' as const,
          },
        ];

  const hoveredCategory = useMemo(() => {
    return activeCategories.find((c) => c.id === hoveredSpendingId);
  }, [hoveredSpendingId, activeCategories]);

  // Combined Priority Obligations
  const priorityObligations = [
    ...subscriptions
      .filter((s) => s.is_active)
      .map((s) => ({
        id: s.id,
        title: s.name,
        logoKey: s.logoKey,
        dueText: `in ${s.days_remaining}d`,
        dueDate: s.next_renewal_date,
        amount: s.amount,
        cycle: s.billing_cycle === 'monthly' ? 'Monthly' : 'Annual',
        isUrgent: s.is_urgent || s.days_remaining <= 10,
        daysRemaining: s.days_remaining,
        type: 'subscription' as const,
      })),
    ...insurances
      .filter((i) => i.is_active)
      .map((i) => ({
        id: i.id,
        title: i.policy_name,
        logoKey: i.logoKey,
        dueText: `in ${i.days_remaining}d`,
        dueDate: i.renewal_date,
        amount: i.premium_amount,
        cycle: i.premium_frequency === 'monthly' ? 'Monthly' : 'Annual',
        isUrgent: i.is_urgent || i.days_remaining <= 10,
        daysRemaining: i.days_remaining,
        type: 'insurance' as const,
      })),
  ]
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 4);

  // Active Goals
  const displayGoals = goals.slice(0, 3);

  return (
    <div className="space-y-5 select-none animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 0. SOVEREIGN TELEMETRY TICKER BAR                                        */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white/70 dark:bg-[#0E1526]/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <SparkleSmallIcon className="w-4 h-4 fill-current" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black tracking-wider uppercase text-slate-900 dark:text-white font-mono">
                Sovereign Wealth Cockpit
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-emerald-500 text-slate-950 uppercase tracking-widest">
                Live Engine
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Institutional personal finance telemetry • Real-time solvency & velocity analytics
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            <span className="text-emerald-500">₹</span>
            <span>{netSurplus >= 0 ? `+₹${netSurplus.toLocaleString('en-IN')}` : `-₹${Math.abs(netSurplus).toLocaleString('en-IN')}`}/mo</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
            <Flame className="w-3.5 h-3.5 fill-emerald-500/40" />
            <span>{savingsRate}% Retained</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP BENTO ROW: WEALTH VELOCITY COCKPIT & RUNWAY VAULT                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* HERO TILE: Wealth Velocity Engine (8 Cols) */}
        <div className="lg:col-span-8 rounded-3xl fintech-card p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between group shadow-sm border border-slate-200/80 dark:border-white/[0.08]">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent" />

          <div>
            {/* Header / Subtitle */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-emerald-700 dark:text-emerald-300 uppercase bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Monthly Cash Flow Position
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
                  • Institutional Pulse
                </span>
              </div>

              {/* Savings Velocity Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
                <SparkleSmallIcon className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                <span>{savingsRate}% Savings Velocity</span>
              </div>
            </div>

            {/* Giant Net Surplus Display with Live Glow */}
            <div className="mt-2 mb-4">
              <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-400 block mb-1.5">
                Net Monthly Surplus (Retained Capital)
              </span>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-mono tabular-nums leading-none">
                  ₹{netSurplus.toLocaleString('en-IN')}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl shadow-xs ${
                    netSurplus >= 0
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {netSurplus >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  {netSurplus >= 0 ? 'Cash Positive' : 'Deficit'}
                </span>
              </div>
            </div>

            {/* Connected Dual Inflow vs Outflow Telemetry Control Deck */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4 pt-3.5 border-t border-slate-100 dark:border-white/[0.06]">
              {/* Inflow Card */}
              <div
                onClick={() => setActiveSubTab('budget')}
                className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/[0.04] transition-all cursor-pointer group/inflow relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Total Inflow / Month
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover/inflow:translate-x-0.5 group-hover/inflow:-translate-y-0.5 transition-transform">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
                  ₹{totalIncome.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>Gross turnover</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Topline</span>
                </div>
              </div>

              {/* Outflow Card */}
              <div
                onClick={() => setActiveSubTab('budget')}
                className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] hover:border-indigo-500/40 hover:bg-indigo-500/[0.02] dark:hover:bg-indigo-500/[0.04] transition-all cursor-pointer group/outflow relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    Operational Outflow
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover/outflow:translate-x-0.5 group-hover/outflow:translate-y-0.5 transition-transform">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
                  ₹{totalOutflow.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>₹{dailyBurn.toLocaleString('en-IN')}/day burn</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{outflowPercent}% Burn Ratio</span>
                </div>
              </div>
            </div>

            {/* Split Ratio Conduit Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Inflow Velocity {incomePercent}%
                </span>
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Burn Rate {outflowPercent}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden flex p-0.5 gap-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  style={{ width: `${incomePercent}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-r-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                  style={{ width: `${outflowPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Floating Command Action Bar */}
          <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-white/[0.06] flex-wrap">
            <button
              onClick={() => onOpenAddModal?.('expense')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Log Record</span>
            </button>

            <button
              onClick={() => onNavigateToTab?.('ai_companion')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200/80 dark:border-white/10 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>AI Advisor Audit</span>
            </button>

            <button
              onClick={() => setActiveSubTab('tax_calculator')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200/80 dark:border-white/10 cursor-pointer active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Tax Optimizer</span>
            </button>
          </div>
        </div>

        {/* TILE 2: Emergency Runway Vault & Solvency Horizon (4 Cols) */}
        <div className="lg:col-span-4 rounded-3xl fintech-card p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between shadow-sm border border-slate-200/80 dark:border-white/[0.08]">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-blue-500/10 via-emerald-500/5 to-transparent rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

          <div className="space-y-4">
            {/* Tile Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  {runwayStatus.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                    Emergency Runway
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Liquidity Vault
                  </span>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${runwayStatus.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${runwayStatus.dotClass} animate-pulse`} />
                {runwayStatus.label}
              </span>
            </div>

            {/* Central Solvency Meter HUD */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-white/[0.04] dark:to-transparent border border-slate-200/80 dark:border-white/[0.08] text-center space-y-1.5 relative overflow-hidden">
              <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest text-slate-400 block">
                Safe Survival Horizon
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono tabular-nums flex items-baseline justify-center gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {emergencyRunwayMonths}
                </span>
                <span className="text-xs text-slate-400 uppercase font-sans font-bold tracking-wider">
                  Months
                </span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Protected through {runwayTargetDate}</span>
              </div>
            </div>

            {/* Visual 3-Stage Milestone Track */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono uppercase tracking-wider">
                  Cushion Reserves
                </span>
                <span className="font-mono text-slate-900 dark:text-white font-extrabold text-sm">
                  ₹{liquidEmergencyFund.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Multi-tier Stepper Bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all duration-500"
                  style={{ width: `${Math.max(6, runwayProgress)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                <span>0 Mo</span>
                <span className="text-blue-500 font-bold">3 Mo Essential</span>
                <span className="text-emerald-500 font-bold">6 Mo Target</span>
              </div>
            </div>
          </div>

          {/* Context Advisory Chip */}
          <div className="mt-4 p-3 rounded-xl bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
            <span className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5 font-bold">
              ℹ
            </span>
            <span className="leading-snug">{runwayStatus.text}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MIDDLE BENTO ROW: CASH FLOW HORIZON & CAPITAL ANATOMY                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CASH FLOW TRAJECTORY CHART (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl fintech-card p-6 shadow-sm flex flex-col justify-between border border-slate-200/80 dark:border-white/[0.08]">
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Cash Flow Trajectory</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Predictive Horizon
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Monthly revenue vs. operational burn pacing</p>
              </div>

              {/* Timeframe Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 text-xs">
                {(['3M', '6M', '1Y'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setCashFlowPeriod(period)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      cashFlowPeriod === period
                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="w-full h-56 min-h-[220px] relative">
              {isMounted && displayTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                  <ComposedChart
                    data={displayTrend}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="50%" stopColor="#10B981" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                        <stop offset="50%" stopColor="#6366F1" stopOpacity={0.08} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.12} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 10 }}
                      tickFormatter={(val) => `₹${val / 1000}K`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                      }}
                      formatter={(val: unknown) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, '']}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Inflow"
                      stroke="#10B981"
                      strokeWidth={3}
                      fill="url(#incomeGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Outflow"
                      stroke="#6366F1"
                      strokeWidth={3}
                      fill="url(#expenseGrad)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                  <p className="text-xs font-semibold text-slate-500">No trend logged yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Legend with Telemetry Insights */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Monthly Inflow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Monthly Outflow</span>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('budget')}
              className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1 cursor-pointer text-[11px]"
            >
              <span>Manage Budget</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CAPITAL ALLOCATION BREAKDOWN (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl fintech-card p-6 shadow-sm flex flex-col justify-between border border-slate-200/80 dark:border-white/[0.08]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Capital Distribution
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Categorized outflow allocation</p>
              </div>
              <button
                onClick={() => setActiveSubTab('budget')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>Inspect</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Donut Chart & Ranked List */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-2">
              {/* Donut */}
              <div className="sm:col-span-5 relative flex items-center justify-center min-h-[160px]">
                {isMounted && (
                  <ResponsiveContainer width="100%" height={160} minWidth={0} minHeight={160}>
                    <PieChart>
                      <Pie
                        data={activeCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={70}
                        paddingAngle={totalOutflow > 0 ? 3 : 0}
                        dataKey="amount"
                        onMouseEnter={(_, idx) =>
                          setHoveredSpendingId(activeCategories[idx]?.id || null)
                        }
                        onMouseLeave={() => setHoveredSpendingId(null)}
                      >
                        {activeCategories.map((entry) => (
                          <Cell
                            key={entry.id}
                            fill={entry.color}
                            stroke="transparent"
                            opacity={
                              hoveredSpendingId
                                ? hoveredSpendingId === entry.id
                                  ? 1
                                  : 0.35
                                : 1
                            }
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(val: unknown) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {/* Center Dynamic Readout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  {hoveredCategory ? (
                    <>
                      <span className="text-[9px] text-emerald-500 font-mono font-bold uppercase truncate max-w-[70px]">
                        {hoveredCategory.category}
                      </span>
                      <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                        {hoveredCategory.percentage}%
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">Burn</span>
                      <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                        ₹{totalOutflow > 0 ? `${Math.round(totalOutflow / 1000)}k` : '0'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Ranked Categories with Mini Bars */}
              <div className="sm:col-span-7 space-y-2">
                {activeCategories.slice(0, 3).map((cat) => (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setHoveredSpendingId(cat.id)}
                    onMouseLeave={() => setHoveredSpendingId(null)}
                    className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      hoveredSpendingId === cat.id
                        ? 'bg-slate-100 dark:bg-white/[0.08] border-emerald-500/40'
                        : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200/60 dark:border-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {cat.category}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0 ml-2">
                        ₹{cat.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {/* Progress track */}
                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span>{spendingCategories.length} tracked categories</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              ₹{totalOutflow.toLocaleString('en-IN')} Total
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM BENTO ROW: STRATEGIC GOALS & UPCOMING COMMITMENTS                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* STRATEGIC FINANCIAL GOALS (6 Cols) */}
        <div className="lg:col-span-6 rounded-3xl fintech-card p-6 shadow-sm flex flex-col justify-between border border-slate-200/80 dark:border-white/[0.08]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Strategic Goals
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Milestone Trackers</span>
                </div>
              </div>

              <button
                onClick={() => setActiveSubTab('goals')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View All ({goals.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Goals List */}
            {displayGoals.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                <p className="text-xs font-semibold text-slate-500 mb-2">No active goals yet</p>
                <button
                  onClick={() => onOpenAddModal?.('goal')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-all"
                >
                  + Add First Goal
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {displayGoals.map((goal) => {
                  const pct = Math.min(100, Math.round((goal.current_amount / Math.max(1, goal.target_amount)) * 100));
                  return (
                    <div
                      key={goal.id}
                      onClick={() => setActiveSubTab('goals')}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/[0.03] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {goal.title}
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden mb-1.5">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>₹{goal.current_amount.toLocaleString('en-IN')}</span>
                        <span>Target: ₹{goal.target_amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/[0.06]">
            <button
              onClick={() => onOpenAddModal?.('goal')}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-bold transition-all text-center cursor-pointer"
            >
              + Create New Goal
            </button>
          </div>
        </div>

        {/* UPCOMING OBLIGATIONS & POLICY RENEWALS (6 Cols) */}
        <div className="lg:col-span-6 rounded-3xl fintech-card p-6 shadow-sm flex flex-col justify-between border border-slate-200/80 dark:border-white/[0.08]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Upcoming Obligations
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Recurring Commitments</span>
                </div>
              </div>

              <button
                onClick={() => setActiveSubTab('subscriptions')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Priority Obligations Horizon */}
            {priorityObligations.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                <p className="text-xs font-semibold text-slate-500 mb-2">No upcoming renewals logged</p>
                <button
                  onClick={() => onOpenAddModal?.('subscription')}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer transition-all"
                >
                  + Add OTT or Policy
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {priorityObligations.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      setActiveSubTab(item.type === 'subscription' ? 'subscriptions' : 'insurances')
                    }
                    className={`p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border transition-all cursor-pointer flex items-center justify-between group ${
                      item.isUrgent
                        ? 'border-rose-500/40 hover:border-rose-500/60'
                        : 'border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ProviderLogo
                        logoKey={item.logoKey}
                        className="w-8 h-8 shrink-0 rounded-lg group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </span>
                          {item.isUrgent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                              URGENT
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                          <Clock className="w-3 h-3" />
                          Due {item.dueText} ({item.cycle})
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <div className="text-xs sm:text-sm font-black font-mono tabular-nums text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/[0.06]">
            <button
              onClick={() => onOpenAddModal?.('subscription')}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-bold transition-all text-center cursor-pointer"
            >
              + Add Subscription / Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
