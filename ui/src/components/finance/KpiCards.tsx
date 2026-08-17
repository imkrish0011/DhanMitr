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
    setActiveSubTab,
  } = useFinance();

  const cards = [
    {
      id: 'income',
      label: 'Monthly Income',
      value: `₹${totalIncome.toLocaleString('en-IN')}`,
      subtext: 'Take-home salary',
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={card.action}
          className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs hover:shadow-sm hover:border-emerald-500/20 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center gap-3.5 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg} transition-transform`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {card.label}
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">
                {card.value}
              </h3>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            {card.subtext && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {card.subtext}
              </span>
            )}
            {card.badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {card.badge}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
