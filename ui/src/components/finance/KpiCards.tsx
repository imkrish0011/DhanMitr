'use client';

import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import {
  WalletIcon,
  ArrowDownOutflowIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
} from '@/components/icons/CustomIcons';

export const KpiCards: React.FC = () => {
  const {
    totalIncome,
    totalOutflow,
    netSurplus,
    savingsRate,
    activeSubscriptionsCount,
    activeInsurancesCount,
    incomeSources,
    setActiveSubTab,
  } = useFinance();

  const cards = [
    {
      id: 'income',
      label: 'Monthly Income',
      value: `₹${totalIncome.toLocaleString('en-IN')}`,
      subtext: incomeSources.length > 0 ? `${incomeSources.length} streams logged` : 'Monthly earnings',
      icon: <WalletIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50',
      action: () => setActiveSubTab('budget'),
    },
    {
      id: 'outflow',
      label: 'Total Outflow / Mo',
      value: `₹${totalOutflow.toLocaleString('en-IN')}`,
      subtext: 'Living + Bills + Insurance',
      icon: <ArrowDownOutflowIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50',
      action: () => setActiveSubTab('budget'),
    },
    {
      id: 'surplus',
      label: 'Net Monthly Surplus',
      value: `₹${netSurplus.toLocaleString('en-IN')}`,
      badge: `${savingsRate}% Savings Rate`,
      icon: <TrendingUpIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50',
      action: () => setActiveSubTab('budget'),
    },
    {
      id: 'services',
      label: 'Active Services',
      value: `${activeSubscriptionsCount} OTT • ${activeInsurancesCount} Ins.`,
      subtext: 'Monitored by AI',
      icon: <ShieldCheckIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/50',
      action: () => setActiveSubTab('subscriptions'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={card.action}
          className="fintech-card fintech-card-hover rounded-2xl p-5 sm:p-6 cursor-pointer flex flex-col justify-between group overflow-hidden"
        >
          {/* Subtle Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                {card.label}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg} transition-transform group-hover:scale-105 shadow-2xs`}>
                {card.icon}
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono tabular-nums">
              {card.value}
            </h3>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            {card.subtext && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {card.subtext}
              </span>
            )}
            {card.badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {card.badge}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
