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

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { netSurplus, savingsRate } = useFinance();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'finance_hub', label: 'Finance Hub', icon: <ShieldCheckIcon className="w-5 h-5" /> },
    { id: 'ai_companion', label: 'AI Companion', icon: <SparklesIcon className="w-5 h-5" /> },
    { id: 'transactions', label: 'Transactions', icon: <TransactionsIcon className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 h-screen shrink-0 sticky top-0 bg-[#080C14] border-r border-slate-800/80 flex flex-col justify-between p-5 select-none transition-colors duration-200">
      {/* Top: Brand & Navigation */}
      <div>
        {/* Brand Header */}
        <div
          className="flex items-center gap-3 px-3 py-3 mb-6 cursor-pointer group"
          onClick={() => onSelectTab('finance_hub')}
        >
          <div className="w-10 h-10 rounded-2xl bg-[#0B101D] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.08),3px_3px_8px_rgba(0,0,0,0.6)] border border-slate-800/80 flex items-center justify-center transition-transform group-hover:scale-105">
            <DhanMitrLogo className="w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Dhan<span className="text-emerald-500">MITR</span>
          </span>
        </div>

        {/* Neumorphic Navigation Links */}
        <nav className="space-y-2.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#060910] text-emerald-400 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.8),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border-l-2 border-emerald-500'
                    : 'bg-[#0B101D]/40 text-slate-400 hover:text-white hover:bg-[#0B101D] hover:shadow-[2px_2px_6px_rgba(0,0,0,0.4),-1px_-1px_3px_rgba(255,255,255,0.02)]'
                }`}
              >
                <span
                  className={`transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Neumorphic Insights Widget & Settings */}
      <div className="space-y-3 pt-4 border-t border-slate-800/60">
        {/* Neumorphic Telemetry Card */}
        <div className="p-4 bg-[#060910] shadow-[inset_2px_2px_6px_rgba(0,0,0,0.8),inset_-1px_-1px_3px_rgba(255,255,255,0.03)] border border-slate-800/80 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              Smart Insights
              <SparkleSmallIcon className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            {netSurplus > 0
              ? `Net surplus: ₹${netSurplus.toLocaleString('en-IN')} (${savingsRate}% savings rate).`
              : 'Log your income & expenses to calculate monthly surplus.'}
          </p>

          <div className="flex items-end justify-between">
            <svg className="w-24 h-7 text-emerald-500 overflow-visible" viewBox="0 0 100 30" fill="none">
              <path
                d="M 0 25 Q 20 28 35 18 T 70 14 T 100 5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="100" cy="5" r="3" fill="#10B981" />
            </svg>

            <span className="px-2 py-0.5 text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 rounded-md border border-emerald-800/50">
              Active
            </span>
          </div>
        </div>

        {/* Neumorphic Settings button */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-[#060910] text-emerald-400 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.8),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border-l-2 border-emerald-500'
              : 'bg-[#0B101D]/40 text-slate-400 hover:text-white hover:bg-[#0B101D] hover:shadow-[2px_2px_6px_rgba(0,0,0,0.4),-1px_-1px_3px_rgba(255,255,255,0.02)]'
          }`}
        >
          <SettingsIcon className="w-4.5 h-4.5 text-slate-500" />
          <span className="tracking-wide">Settings</span>
        </button>
      </div>
    </aside>
  );
};
