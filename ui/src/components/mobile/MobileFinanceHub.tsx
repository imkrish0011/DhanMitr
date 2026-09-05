'use client';

import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
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
import { SpendingOverviewChart } from '@/components/finance/SpendingOverviewChart';
import { CashFlowTrendChart } from '@/components/finance/CashFlowTrendChart';
import { SubscriptionsTab } from '@/components/finance/SubscriptionsTab';
import { InsurancesTab } from '@/components/finance/InsurancesTab';
import { BudgetIncomeTab } from '@/components/finance/BudgetIncomeTab';
import { EmergencyRunwayGauge } from '@/components/finance/EmergencyRunwayGauge';
import { GoalsTab } from '@/components/finance/GoalsTab';
import { TaxRegimeComparator } from '@/components/finance/TaxRegimeComparator';

interface MobileFinanceHubProps {
  onOpenVoice: () => void;
  onOpenChat: () => void;
  onOpenAddModal: () => void;
  onOpenTransactions?: () => void;
}

export const MobileFinanceHub: React.FC<MobileFinanceHubProps> = ({
  onOpenVoice,
  onOpenChat,
  onOpenAddModal,
  onOpenTransactions,
}) => {
  const { theme, toggleTheme } = useTheme();
  const {
    activeSubTab,
    setActiveSubTab,
    totalIncome,
    totalOutflow,
    netSurplus,
    savingsRate,
    activeSubscriptionsCount,
    activeInsurancesCount,
    activeGoalsCount,
    subscriptions,
    insurances,
  } = useFinance();

  const [showNotifications, setShowNotifications] = React.useState(false);

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
    { id: 'goals' as const, label: `Goals (${activeGoalsCount})`, shortLabel: `Goals (${activeGoalsCount})` },
    { id: 'tax_calculator' as const, label: 'Tax', shortLabel: 'Tax Optimizer' },
    { id: 'subscriptions' as const, label: `Subs (${activeSubscriptionsCount})`, shortLabel: `Subs (${activeSubscriptionsCount})` },
    { id: 'insurances' as const, label: `Ins (${activeInsurancesCount})`, shortLabel: `Ins (${activeInsurancesCount})` },
    { id: 'budget' as const, label: 'Budget', shortLabel: 'Budget & Income' },
  ];

  return (
    <div className="w-full min-h-screen bg-transparent pb-24 text-slate-900 dark:text-white transition-colors duration-200">
      {/* Top Mobile App Bar */}
      <div className="sticky top-0 z-30 px-4 py-3 bg-white/80 dark:bg-[#070B14]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <DhanMitrLogo className="w-8 h-6 shrink-0" />
          <span className="font-display font-extrabold tracking-tight text-base text-slate-900 dark:text-white">
            Dhan<span className="text-emerald-500 font-bold">Mitr</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 cursor-pointer shadow-2xs"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <button
            onClick={onOpenAddModal}
            className="p-2 bg-emerald-600 active:scale-95 text-white rounded-xl shadow-xs cursor-pointer"
            title="Add Record"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 dark:text-slate-300 cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shadow-2xs"
            >
              <BellIcon className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#0B101B]" />
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

      {/* Title & Subtitle */}
      <div className="px-4 pt-3 pb-1">
        <h1 className="text-lg font-extrabold flex items-center gap-1.5 text-slate-900 dark:text-white">
          Finance Hub
          <SparkleSmallIcon className="w-4 h-4 text-emerald-500 fill-emerald-400" />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Institutional personal wealth overview
        </p>
      </div>

      {/* Smooth Horizontally Scrollable Sub-Tabs */}
      <div className="px-4 py-2 select-none">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-[#0E1526]/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-white/5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 shadow-xs border border-emerald-500/30'
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
        <div className="px-4 space-y-4 pt-1">
          {/* Hero Surplus Card (Luxury Emerald Gradient Card) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-800 via-[#064E3B] to-[#022D22] text-white shadow-xl relative overflow-hidden border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-200/80 uppercase tracking-wider">Net Monthly Surplus</span>
                <h2 className="text-3xl font-black text-white mt-1 tracking-tight font-mono tabular-nums">
                  ₹{netSurplus.toLocaleString('en-IN')}
                </h2>
                <div className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
                  <span>▲ {savingsRate}%</span>
                  <span className="text-emerald-400 font-normal">savings rate</span>
                </div>
              </div>

              <button
                onClick={onOpenAddModal}
                className="text-emerald-300 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ···
              </button>
            </div>

            {/* Glowing Wavy Line Chart */}
            <div className="mt-4 pt-1">
              <svg className="w-full h-14 overflow-visible" viewBox="0 0 300 60" fill="none">
                <path
                  d="M 0 45 C 50 45 70 20 120 35 C 170 50 200 15 250 22 C 280 26 290 8 300 5"
                  stroke="#34D399"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="drop-shadow(0 0 8px rgba(52, 211, 153, 0.8))"
                />
              </svg>
            </div>
          </div>

          {/* 2x2 Grid KPI Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 fintech-card fintech-card-hover rounded-2xl shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center mb-2">
                <WalletIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Monthly Income</p>
              <h4 className="text-base font-black text-slate-900 dark:text-white font-mono tabular-nums">
                ₹{totalIncome.toLocaleString('en-IN')}
              </h4>
              <span className="text-[10px] text-slate-500">Take-home salary</span>
            </div>

            <div className="p-4 fintech-card fintech-card-hover rounded-2xl shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-500/20 flex items-center justify-center mb-2">
                <ArrowDownOutflowIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Outflow</p>
              <h4 className="text-base font-black text-slate-900 dark:text-white font-mono tabular-nums">
                ₹{totalOutflow.toLocaleString('en-IN')}
              </h4>
              <span className="text-[10px] text-slate-500">Living + Bills + Ins.</span>
            </div>

            <div
              onClick={() => setActiveSubTab('subscriptions')}
              className="p-4 fintech-card fintech-card-hover rounded-2xl shadow-2xs cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-500/20 flex items-center justify-center mb-2">
                <ShieldCheckIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Active Services</p>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {activeSubscriptionsCount} OTT • {activeInsurancesCount} Ins.
              </h4>
              <span className="text-[10px] text-slate-500">Monitored by AI</span>
            </div>

            <div className="p-4 fintech-card fintech-card-hover rounded-2xl shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-500/20 flex items-center justify-center mb-2">
                <TrendingUpIcon className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Savings Rate</p>
              <h4 className="text-base font-black text-slate-900 dark:text-white">{savingsRate}%</h4>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                Good job! <RocketIcon className="w-3 h-3 text-amber-500 inline" />
              </span>
            </div>
          </div>

          {/* Emergency Fund Runway Gauge */}
          <EmergencyRunwayGauge />

          {/* Spending Overview Donut Chart */}
          <SpendingOverviewChart />

          {/* Cash Flow Trend Line Chart */}
          <CashFlowTrendChart />

          {/* AI Insight Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-200/70 dark:border-emerald-900/50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <SparkleSmallIcon className="w-3.5 h-3.5 text-emerald-500" />
                AI Insight
              </span>
              <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-md">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {netSurplus > 0
                ? `You have a healthy ₹${netSurplus.toLocaleString('en-IN')} net monthly surplus (${savingsRate}% savings rate).`
                : 'Add your income streams and budget caps to track your monthly surplus in real-time.'}
            </p>
          </div>

          {/* Upcoming Renewals */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
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
                <div className="p-4 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-2xs">
                  <p className="text-xs text-slate-400">No active renewals found</p>
                </div>
              ) : (
                subscriptions.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <ProviderLogo logoKey={s.logoKey} className="w-10 h-10 shrink-0" />
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
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        ₹{s.amount}
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
          <SubscriptionsTab onOpenAddModal={onOpenAddModal} />
        </div>
      )}

      {activeSubTab === 'insurances' && (
        <div className="px-4 pt-2">
          <InsurancesTab onOpenAddModal={onOpenAddModal} />
        </div>
      )}

      {activeSubTab === 'budget' && (
        <div className="px-4 pt-2">
          <BudgetIncomeTab onOpenAddModal={onOpenAddModal} />
        </div>
      )}
    </div>
  );
};

