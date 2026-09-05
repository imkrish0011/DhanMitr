'use client';

import React from 'react';
import { NavTab } from '@/types';
import { useFinance } from '@/context/FinanceContext';
import {
  DhanMitrLogo,
  ShieldCheckIcon,
  SparklesIcon,
  TransactionsIcon,
  SettingsIcon,
  SparkleSmallIcon,
} from '@/components/icons/CustomIcons';

import { Calculator } from 'lucide-react';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { netSurplus, savingsRate } = useFinance();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'finance_hub', label: 'Finance Hub', icon: <ShieldCheckIcon className="w-5 h-5" /> },
    { id: 'msme_tools', label: 'MSME & Loans', icon: <Calculator className="w-5 h-5" /> },
    { id: 'ai_companion', label: 'AI Companion', icon: <SparklesIcon className="w-5 h-5" /> },
    { id: 'transactions', label: 'Transactions', icon: <TransactionsIcon className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 h-screen shrink-0 sticky top-0 bg-white/70 dark:bg-[#070B14]/80 backdrop-blur-xl border-r border-slate-200/70 dark:border-white/5 flex flex-col justify-between p-5 select-none transition-colors duration-200 z-20">
      {/* Top: Brand & Navigation */}
      <div>
        {/* Brand Header */}
        <div
          className="flex items-center gap-3 px-3 py-3 mb-6 cursor-pointer group"
          onClick={() => onSelectTab('finance_hub')}
        >
          <DhanMitrLogo className="w-11 h-9 shrink-0 group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1 font-display">
              Dhan<span className="text-emerald-500 font-bold">Mitr</span>
            </span>
            <span className="text-[8px] font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase">Your Financial Friend</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                <span
                  className={`transition-colors ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="tracking-tight font-medium text-xs">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Insights Widget & Settings */}
      <div className="space-y-2.5 pt-4 border-t border-slate-200/70 dark:border-white/5">
        {/* Telemetry Card */}
        <div className="p-3.5 fintech-card rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              Smart Telemetry
              <SparkleSmallIcon className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase">Live</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mb-2.5">
            {netSurplus > 0
              ? `Surplus: ₹${netSurplus.toLocaleString('en-IN')} (${savingsRate}% rate)`
              : 'Log finances to track cash flow.'}
          </p>

          <div className="flex items-end justify-between">
            <svg className="w-24 h-6 text-emerald-500 overflow-visible" viewBox="0 0 100 30" fill="none">
              <path
                d="M 0 25 Q 20 28 35 18 T 70 14 T 100 5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="100" cy="5" r="3" fill="#10B981" />
            </svg>

            <span className="px-2 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 rounded-md border border-emerald-500/20">
              Synced
            </span>
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
          }`}
        >
          <SettingsIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="tracking-tight font-medium text-xs">Settings</span>
        </button>
      </div>
    </aside>
  );
};
