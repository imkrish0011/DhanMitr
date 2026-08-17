'use client';

import React from 'react';
import { useFinance } from '@/context/FinanceContext';
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
  const {
    activeSubTab,
    setActiveSubTab,
    totalIncome,
    totalOutflow,
    netSurplus,
    savingsRate,
    activeSubscriptionsCount,
    activeInsurancesCount,
    subscriptions,
  } = useFinance();

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'subscriptions' as const, label: `OTT & Subs (${activeSubscriptionsCount})` },
    { id: 'insurances' as const, label: `Insurances (${activeInsurancesCount})` },
    { id: 'budget' as const, label: 'Budget' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] pb-28 text-slate-900 dark:text-white transition-colors duration-200">
      {/* Top Mobile App Bar */}
      <div className="sticky top-0 z-30 px-4 py-3 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-2xs">
        <button
          onClick={() => alert('Menu opened')}
          className="p-1.5 text-slate-600 dark:text-slate-300 active:scale-95 transition-transform"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <DhanMitrLogo className="w-6 h-6" />
          <span className="font-extrabold tracking-tight text-base">
            Dhan<span className="text-emerald-500">MITR</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="p-1.5 bg-emerald-600 active:scale-95 text-white rounded-lg shadow-xs"
            title="Add Record"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          <button
            onClick={() => alert('Notifications: Netflix renewal due in 8 days!')}
            className="relative p-1.5 text-slate-600 dark:text-slate-300"
          >
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="px-4 pt-4 pb-1">
        <h1 className="text-xl font-extrabold flex items-center gap-1.5 text-slate-900 dark:text-white">
          Finance Hub
          <SparkleSmallIcon className="w-4 h-4 text-emerald-500 fill-emerald-400" />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Your complete financial overview
        </p>
      </div>

      {/* Navigation Segment Tabs */}
      <div className="px-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeSubTab === 'overview' && (
        <div className="px-4 space-y-4 pt-1">
          {/* Hero Surplus Card (Forest Green Gradient Card) */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#043328] to-[#02221B] text-white shadow-xl relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium text-emerald-200/80">Net Monthly Surplus</span>
                <h2 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
                  ₹{netSurplus.toLocaleString('en-IN')}
                </h2>
                <div className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-[11px] font-bold text-emerald-300">
                  <span>▲ {savingsRate}%</span>
                  <span className="text-emerald-400 font-normal">vs last month</span>
                </div>
              </div>

              <button
                onClick={onOpenAddModal}
                className="text-emerald-300 hover:text-white text-lg font-bold"
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
            <div className="p-4 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-2">
                <WalletIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400">Monthly Income</p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                ₹{totalIncome.toLocaleString('en-IN')}
              </h4>
              <span className="text-[10px] text-slate-500">Take-home salary</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-2">
                <ArrowDownOutflowIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-[11px] text-slate-400">Total Outflow / Mo</p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                ₹{totalOutflow.toLocaleString('en-IN')}
              </h4>
              <span className="text-[10px] text-slate-500">Living + Bills + Ins.</span>
            </div>

            <div
              onClick={() => setActiveSubTab('subscriptions')}
              className="p-4 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center mb-2">
                <ShieldCheckIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-[11px] text-slate-400">Active Services</p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {activeSubscriptionsCount} OTT • {activeInsurancesCount} Ins.
              </h4>
              <span className="text-[10px] text-slate-500">Monitored by AI</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center mb-2">
                <TrendingUpIcon className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-[11px] text-slate-400">Savings Rate</p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">{savingsRate}%</h4>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                Good job! <RocketIcon className="w-3 h-3 text-amber-500 inline" />
              </span>
            </div>
          </div>

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
                +18%
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Great job! You saved <strong>₹6,500</strong> more than last month. Keep it up!
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
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {subscriptions.slice(0, 4).map((s) => (
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
              ))}
            </div>
          </div>
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

      {/* Bottom 5-Tab Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B101B]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-6 py-2 flex items-center justify-between shadow-lg">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex flex-col items-center gap-1 ${
            activeSubTab === 'overview'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActiveSubTab('budget')}
          className={`flex flex-col items-center gap-1 ${
            activeSubTab === 'budget'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M18 20V10M12 20V4M6 20v-6" />
          </svg>
          <span className="text-[10px]">Insights</span>
        </button>

        {/* Center Elevated Glowing AI Companion FAB */}
        <button
          onClick={onOpenVoice}
          className="relative -top-5 w-13 h-13 rounded-full bg-[#064E3B] text-emerald-300 border-2 border-emerald-400/80 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.55)] active:scale-90 transition-transform"
          title="Open AI Companion"
        >
          <SparkleSmallIcon className="w-7 h-7 text-emerald-300 fill-emerald-300" />
        </button>

        <button
          onClick={onOpenTransactions || (() => setActiveSubTab('subscriptions'))}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
          </svg>
          <span className="text-[10px]">Transactions</span>
        </button>

        <button
          onClick={onOpenChat}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </div>
  );
};
