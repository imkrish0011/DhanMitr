'use client';

import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  Mic,
  Plus,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Wallet,
  Activity,
  ArrowRight,
  CreditCard,
  Clock,
  Layers,
  Store,
  Briefcase,
  PieChart,
} from 'lucide-react';
import {
  DhanMitrLogo,
  BellIcon,
  WalletIcon,
  ArrowDownOutflowIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  SparkleSmallIcon,
  ProviderLogo,
  RocketIcon,
} from '@/components/icons/CustomIcons';
import { SubscriptionsTab } from '@/components/finance/SubscriptionsTab';
import { InsurancesTab } from '@/components/finance/InsurancesTab';
import { BudgetIncomeTab } from '@/components/finance/BudgetIncomeTab';
import { GoalsTab } from '@/components/finance/GoalsTab';
import { TaxRegimeComparator } from '@/components/finance/TaxRegimeComparator';
import { ProjectLoanSuite } from '@/components/calculator/ProjectLoanSuite';
import { BloomMenu } from '@/components/ui/BloomMenu';
import { ThemeToggle } from '@/components/motion/theme-toggle';

interface MobileFinanceHubProps {
  onOpenVoice: () => void;
  onOpenChat: () => void;
  onOpenAddModal: (type?: string) => void;
  onOpenTransactions?: () => void;
}

export const MobileFinanceHub: React.FC<MobileFinanceHubProps> = ({
  onOpenVoice,
  onOpenChat,
  onOpenAddModal,
  onOpenTransactions,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { profile, user } = useAuth();
  const {
    activeSubTab,
    setActiveSubTab,
    totalIncome,
    totalOutflow,
    netSurplus,
    savingsRate,
    emergencyRunwayMonths,
    spendingCategories,
    activeSubscriptionsCount,
    activeInsurancesCount,
    activeGoalsCount,
    subscriptions,
    insurances,
  } = useFinance();

  const [showNotifications, setShowNotifications] = React.useState(false);

  // Dynamic user greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = profile?.name?.trim() || user?.user_metadata?.full_name?.trim() || 'Partner';
  const firstName = userName.split(' ')[0];

  // Dynamic alerts strictly from user's actual database
  const activeAlerts = [
    ...subscriptions
      .filter((s) => s.is_active && (s.is_urgent || (s.days_remaining !== undefined && s.days_remaining <= 10)))
      .map((s) => ({
        id: s.id,
        title: `${s.name} Renewal`,
        sub: `₹${s.amount.toLocaleString('en-IN')} due (${s.next_renewal_date})`,
        type: 'warning' as const,
      })),
    ...insurances
      .filter((i) => i.is_active && (i.is_urgent || (i.days_remaining !== undefined && i.days_remaining <= 10)))
      .map((i) => ({
        id: i.id,
        title: `${i.policy_name} Due`,
        sub: `₹${i.premium_amount.toLocaleString('en-IN')} due (${i.renewal_date})`,
        type: 'warning' as const,
      })),
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Overview', shortLabel: 'Overview' },
    { id: 'msme_tools' as const, label: 'MSME & Loans', shortLabel: 'MSME & Loans' },
    { id: 'budget' as const, label: 'Insights & Budget', shortLabel: 'Insights' },
    { id: 'goals' as const, label: `Goals (${activeGoalsCount})`, shortLabel: `Goals (${activeGoalsCount})` },
    { id: 'tax_calculator' as const, label: 'Tax', shortLabel: 'Tax Optimizer' },
    { id: 'subscriptions' as const, label: `Subs (${activeSubscriptionsCount})`, shortLabel: `Subs (${activeSubscriptionsCount})` },
    { id: 'insurances' as const, label: `Ins (${activeInsurancesCount})`, shortLabel: `Ins (${activeInsurancesCount})` },
  ];

  return (
    <div className="w-full min-h-screen bg-transparent pb-20 text-slate-900 dark:text-white transition-colors duration-200">
      {/* Top Mobile App Bar */}
      <div className="sticky top-0 z-30 px-4 py-3 bg-white/85 dark:bg-[#070B14]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <DhanMitrLogo className="w-8 h-8 shrink-0" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold tracking-tight text-sm text-slate-900 dark:text-white">
                धन<span className="text-emerald-500 font-bold">Mitr</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
              {getGreeting()}, <span className="font-semibold text-slate-700 dark:text-slate-200">{firstName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Theme Toggle */}
          <ThemeToggle
            variant="rectangle"
            start="bottom-up"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 cursor-pointer shadow-2xs"
            iconClassName="w-4 h-4"
            title="Toggle theme"
          />

          {/* Mobile BloomMenu for Adding Records */}
          <BloomMenu
            compact
            triggerLabel="Add"
            onSelect={(id) => onOpenAddModal(id)}
          />

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 dark:text-slate-300 cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shadow-2xs"
            >
              <BellIcon className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#0B101B] animate-pulse" />
              )}
            </button>

            {/* Mobile Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-white">Alerts & Reminders</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {activeAlerts.length} Active
                  </span>
                </div>
                <div className="space-y-2">
                  {activeAlerts.length === 0 ? (
                    <p className="text-slate-400 text-center py-2 text-[11px]">No pending alerts</p>
                  ) : (
                    activeAlerts.map((alt) => (
                      <div
                        key={alt.id}
                        className="p-2.5 rounded-xl border bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50"
                      >
                        <p className="font-bold text-amber-900 dark:text-amber-300 text-xs">{alt.title}</p>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400">{alt.sub}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sovereign Security Badge & Section Title */}
      <div className="px-4 pt-2.5 pb-1 flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            Sovereign Wealth Hub
            <SparkleSmallIcon className="w-3.5 h-3.5 text-emerald-500 fill-emerald-400" />
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Realtime private intelligence & enterprise runway
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sovereign Guard</span>
        </div>
      </div>

      {/* Smooth Horizontally Scrollable Sub-Tabs */}
      <div className="px-4 py-2 select-none">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-[#0c1220]/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-white/5 overflow-x-auto no-scrollbar shadow-inner">
          {tabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all text-center whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold shadow-xs border border-slate-200/50 dark:border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      {activeSubTab === 'overview' && (
        <div className="px-4 space-y-3.5 pt-1">
          {/* Hero Surplus Card (Luxury Obsidian-Emerald Mesh Gradient Card) */}
          <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#062319] via-[#041a12] to-[#010e0a] text-white shadow-[0_20px_45px_-12px_rgba(5,150,105,0.3)] overflow-hidden border border-emerald-500/25">
            {/* Ambient diffuse decorative glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">
                    Net Monthly Surplus
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>

                <h2 className="text-3xl font-black text-white mt-1.5 tracking-tight font-mono tabular-nums">
                  ₹{netSurplus.toLocaleString('en-IN')}
                </h2>

                <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
                  <span>▲ {savingsRate}%</span>
                  <span className="text-emerald-400/90 font-normal">savings rate</span>
                </div>
              </div>

              <button
                onClick={() => onOpenAddModal()}
                className="text-emerald-300 hover:text-white p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 cursor-pointer"
                title="Quick Add"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Glowing Wavy Line Chart with Ambient Area Gradient */}
            <div className="relative mt-4 pt-1">
              <svg className="w-full h-16 overflow-visible" viewBox="0 0 300 60" fill="none">
                <defs>
                  <linearGradient id="emeraldAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#34D399" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 45 C 50 45 70 20 120 35 C 170 50 200 15 250 22 C 280 26 290 8 300 5 L 300 60 L 0 60 Z"
                  fill="url(#emeraldAreaGradient)"
                />
                <path
                  d="M 0 45 C 50 45 70 20 120 35 C 170 50 200 15 250 22 C 280 26 290 8 300 5"
                  stroke="#34D399"
                  strokeWidth="3"
                  strokeLinecap="round"
                  filter="drop-shadow(0 0 10px rgba(52, 211, 153, 0.7))"
                />
              </svg>
            </div>

            {/* Card Micro Breakdown Footer */}
            <div className="relative z-10 mt-3 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-200/80">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">In:</span>
                <span className="font-mono font-bold text-white">₹{totalIncome.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-3 w-px bg-emerald-500/30" />
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">Out:</span>
                <span className="font-mono font-bold text-white">₹{totalOutflow.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-3 w-px bg-emerald-500/30" />
              <div className="flex items-center gap-1">
                <span className="text-teal-300 font-bold">{emergencyRunwayMonths}m Runway</span>
              </div>
            </div>
          </div>

          {/* 1-Tap Quick Action Dock for Mobile */}
          <div className="grid grid-cols-4 gap-2 py-0.5">
            <button
              onClick={onOpenVoice}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-emerald-500/40 active:scale-95 transition-all text-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Voice Log</span>
              <span className="text-[9px] text-slate-400">Speak flow</span>
            </button>

            <button
              onClick={() => onOpenAddModal()}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-emerald-500/40 active:scale-95 transition-all text-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Add Entry</span>
              <span className="text-[9px] text-slate-400">Quick Log</span>
            </button>

            <button
              onClick={() => setActiveSubTab('msme_tools')}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-teal-500/40 active:scale-95 transition-all text-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">MSME Hub</span>
              <span className="text-[9px] text-slate-400">Loans & Feas.</span>
            </button>

            <button
              onClick={() => {
                if (onOpenTransactions) onOpenTransactions();
              }}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-blue-500/40 active:scale-95 transition-all text-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Passbook</span>
              <span className="text-[9px] text-slate-400">Live Ledger</span>
            </button>
          </div>

          {/* 2x2 Bento KPI Tiles */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Monthly Inflow */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center">
                  <WalletIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="inline-flex items-center text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                  ▲ Inflow
                </span>
              </div>
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Monthly Income</p>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
                ₹{totalIncome.toLocaleString('en-IN')}
              </h4>
              <span className="text-[9px] text-slate-500 block mt-0.5">Take-home earnings</span>
            </div>

            {/* Total Outflow */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-amber-500/30 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-500/20 flex items-center justify-center">
                  <ArrowDownOutflowIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="inline-flex items-center text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                  ▼ Outflow
                </span>
              </div>
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Total Outflow</p>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
                ₹{totalOutflow.toLocaleString('en-IN')}
              </h4>
              <span className="text-[9px] text-slate-500 block mt-0.5">Living + Bills + Ins.</span>
            </div>

            {/* Active Commitments (Tap to switch) */}
            <div
              onClick={() => setActiveSubTab('subscriptions')}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-purple-500/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-purple-400 transition-colors" />
              </div>
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Active Commitments</p>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                {activeSubscriptionsCount} Subs • {activeInsurancesCount} Ins
              </h4>
              <span className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold block mt-0.5">
                Tap to inspect
              </span>
            </div>

            {/* Emergency Runway Cushion */}
            <div
              onClick={() => setActiveSubTab('budget')}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-teal-500/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                </div>
                <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded-full">
                  Guarded
                </span>
              </div>
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Runway Cushion</p>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                {emergencyRunwayMonths} Months
              </h4>
              <span className="text-[9px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1 mt-0.5">
                Zero-income safety <ChevronRight className="w-2.5 h-2.5 inline" />
              </span>
            </div>
          </div>

          {/* Streamlined Spending Snapshot Card (Clean & Compact) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <PieChart className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Spending Snapshot
                </span>
              </div>
              <button
                onClick={() => setActiveSubTab('budget')}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Full Insights</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Proportional Multi-color Bar */}
            <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
              {spendingCategories
                .filter((c) => c.amount > 0)
                .map((c) => (
                  <div
                    key={c.id}
                    style={{
                      width: `${c.percentage}%`,
                      backgroundColor: c.color || '#10B981',
                    }}
                    title={`${c.category}: ${c.percentage}%`}
                    className="h-full transition-all"
                  />
                ))}
            </div>

            {/* Top Categories Pills */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5 text-[11px]">
              {spendingCategories
                .filter((c) => c.amount > 0)
                .slice(0, 3)
                .map((c) => (
                  <div key={c.id} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color || '#10B981' }} />
                    <span className="font-medium truncate max-w-[90px]">{c.category}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">₹{c.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* AI Sovereign Insight Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-transparent border border-emerald-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 fill-emerald-500/30" />
                </div>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  धनMitr Sovereign Copilot
                </span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {netSurplus > 0
                ? `You have a healthy ₹${netSurplus.toLocaleString('en-IN')} net monthly surplus (${savingsRate}% savings rate). Your runway cushion covers ${emergencyRunwayMonths} months.`
                : 'Add your income streams and budget caps to track your monthly surplus and automated sovereign alerts.'}
            </p>
            <button
              onClick={onOpenChat}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/20"
            >
              <span>Ask धनMitr AI to optimize surplus</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Upcoming Renewals */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Upcoming Renewals & Alerts
              </h3>
              <button
                onClick={() => setActiveSubTab('subscriptions')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {subscriptions.length === 0 ? (
                <div className="p-4 bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200/80 dark:border-white/5 text-center shadow-2xs">
                  <p className="text-xs text-slate-400">No active renewals found</p>
                </div>
              ) : (
                subscriptions.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200/80 dark:border-white/5 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <ProviderLogo logoKey={s.logoKey} className="w-9 h-9 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</h4>
                          {s.is_urgent && (
                            <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 rounded">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Due: {s.next_renewal_date} (in {s.days_remaining}d)
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block font-mono">
                        ₹{s.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] text-slate-400 capitalize">{s.billing_cycle}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'msme_tools' && (
        <div className="px-3 pt-2">
          <ProjectLoanSuite />
        </div>
      )}

      {activeSubTab === 'goals' && (
        <div className="px-4 pt-2">
          <GoalsTab />
        </div>
      )}

      {activeSubTab === 'tax_calculator' && (
        <div className="px-4 pt-2">
          <TaxRegimeComparator />
        </div>
      )}

      {activeSubTab === 'subscriptions' && (
        <div className="px-4 pt-2">
          <SubscriptionsTab onOpenAddModal={() => onOpenAddModal('subscription')} />
        </div>
      )}

      {activeSubTab === 'insurances' && (
        <div className="px-4 pt-2">
          <InsurancesTab onOpenAddModal={() => onOpenAddModal('insurance')} />
        </div>
      )}

      {activeSubTab === 'budget' && (
        <div className="px-4 pt-2">
          <BudgetIncomeTab onOpenAddModal={() => onOpenAddModal('income')} />
        </div>
      )}
    </div>
  );
};
