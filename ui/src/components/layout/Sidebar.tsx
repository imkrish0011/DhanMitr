'use client';

import React from 'react';
import { NavTab } from '@/types';
import {
  DhanMitrLogo,
  ShieldCheckIcon,
  SparklesIcon,
  TransactionsIcon,
  SettingsIcon,
  SparkleSmallIcon,
} from '@/components/icons/CustomIcons';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'finance_hub', label: 'Finance Hub', icon: <ShieldCheckIcon className="w-5 h-5" /> },
    { id: 'ai_companion', label: 'AI Companion', icon: <SparklesIcon className="w-5 h-5" /> },
    { id: 'transactions', label: 'Transactions', icon: <TransactionsIcon className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 h-screen shrink-0 sticky top-0 bg-white dark:bg-[#0B101B] border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between p-5 select-none transition-colors duration-200">
      {/* Top: Brand & Navigation */}
      <div>
        {/* Brand Header */}
        <div
          className="flex items-center gap-2.5 px-3 py-3 mb-6 cursor-pointer group"
          onClick={() => onSelectTab('finance_hub')}
        >
          <DhanMitrLogo className="w-8 h-8 transition-transform" />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dhan<span className="text-emerald-500 font-extrabold">MITR</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                }`}
              >
                <span className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Premium Insights Widget & Settings */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
        {/* Premium Insights Card */}
        <div className="p-3.5 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl relative overflow-hidden transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              Premium Insights
              <SparkleSmallIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-2.5">
            You're saving ₹6,500 more than last month. Keep it up!
          </p>

          <div className="flex items-end justify-between">
            {/* Mini Sparkline Chart */}
            <svg className="w-24 h-7 text-emerald-500 overflow-visible" viewBox="0 0 100 30" fill="none">
              <path
                d="M 0 25 Q 20 28 35 18 T 70 14 T 100 5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="100" cy="5" r="3" fill="#10B981" />
            </svg>

            <span className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 rounded-md">
              +18%
            </span>
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            currentTab === 'settings'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/40'
          }`}
        >
          <SettingsIcon className="w-4.5 h-4.5 text-slate-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
