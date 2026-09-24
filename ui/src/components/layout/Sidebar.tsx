'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
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

import { Calculator, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

const sidebarCollapsedStore = {
  subscribe(callback: () => void) {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'dhanmitr_sidebar_collapsed') {
        callback();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('dhanmitr_sidebar_toggle', callback);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('dhanmitr_sidebar_toggle', callback);
    };
  },
  getSnapshot(): boolean {
    try {
      return localStorage.getItem('dhanmitr_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  },
  getServerSnapshot(): boolean {
    return false;
  },
  toggle() {
    try {
      const current = localStorage.getItem('dhanmitr_sidebar_collapsed') === 'true';
      localStorage.setItem('dhanmitr_sidebar_collapsed', String(!current));
      window.dispatchEvent(new Event('dhanmitr_sidebar_toggle'));
    } catch {
      // Ignore localStorage write errors
    }
  },
};

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { netSurplus, savingsRate } = useFinance();
  const isCollapsed = useSyncExternalStore(
    sidebarCollapsedStore.subscribe,
    sidebarCollapsedStore.getSnapshot,
    sidebarCollapsedStore.getServerSnapshot
  );

  const toggleCollapsed = sidebarCollapsedStore.toggle;

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCollapsed]);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'finance_hub', label: 'Finance Hub', icon: <ShieldCheckIcon className="w-5 h-5" /> },
    { id: 'ai_companion', label: 'AI Companion', icon: <SparklesIcon className="w-5 h-5" /> },
    { id: 'msme_tools', label: 'MSME & Loans', icon: <Calculator className="w-5 h-5" /> },
    { id: 'transactions', label: 'Transactions', icon: <TransactionsIcon className="w-5 h-5" /> },
  ];

  return (
    <aside
      className={`h-screen shrink-0 sticky top-0 bg-white/70 dark:bg-[#070B14]/80 backdrop-blur-xl border-r border-slate-200/70 dark:border-white/5 flex flex-col justify-between select-none transition-all duration-300 ease-in-out z-20 ${
        isCollapsed ? 'w-20 p-3' : 'w-64 p-5'
      }`}
    >
      {/* Top: Brand & Navigation */}
      <div>
        {/* Brand Header */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-2 py-3 mb-6">
            <div
              className="flex items-center gap-3 cursor-pointer group min-w-0"
              onClick={() => onSelectTab('finance_hub')}
              title="Go to Finance Hub"
            >
              <DhanMitrLogo className="w-10 h-8 shrink-0 group-hover:scale-105 transition-transform" />
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1 font-display">
                  धन<span className="text-emerald-500 font-bold">Mitr</span>
                </span>
                <span className="text-[8px] font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase truncate">
                  Your Financial Friend
                </span>
              </div>
            </div>

            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Collapse sidebar (Ctrl+B)"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-3 mb-6">
            <div
              className="cursor-pointer group flex justify-center"
              onClick={() => onSelectTab('finance_hub')}
              title="Go to Finance Hub"
            >
              <DhanMitrLogo className="w-10 h-8 shrink-0 group-hover:scale-110 transition-transform" />
            </div>

            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Expand sidebar (Ctrl+B)"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer relative group ${
                  isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5 text-left'
                } ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 border border-transparent'
                }`}
                title={isCollapsed ? undefined : item.label}
              >
                <span
                  className={`transition-colors shrink-0 ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <span className="tracking-tight font-medium text-xs truncate">{item.label}</span>
                )}

                {/* Floating Tooltip for Collapsed Mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900/95 dark:bg-slate-800/95 text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Insights Widget & Settings */}
      <div className="space-y-2.5 pt-4 border-t border-slate-200/70 dark:border-white/5">
        {/* Telemetry Card: Expanded vs Collapsed */}
        {!isCollapsed ? (
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
        ) : (
          <div className="relative group p-2.5 rounded-xl fintech-card flex flex-col items-center justify-center cursor-default">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="absolute w-4 h-4 rounded-full bg-emerald-500/30 animate-ping" />
            </div>

            {/* Collapsed Telemetry Floating Tooltip */}
            <div className="absolute left-full ml-3 px-3 py-2 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-white text-xs whitespace-nowrap shadow-xl border border-slate-700/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-0.5">
                <SparkleSmallIcon className="w-3.5 h-3.5 fill-current" />
                <span>Smart Telemetry (Live)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {netSurplus > 0
                  ? `Surplus: ₹${netSurplus.toLocaleString('en-IN')} (${savingsRate}% rate)`
                  : 'Log finances to track cash flow.'}
              </p>
            </div>
          </div>
        )}

        {/* Settings button */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer relative group ${
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
          } ${
            currentTab === 'settings'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 border border-transparent'
          }`}
          title={isCollapsed ? undefined : 'Settings'}
        >
          <SettingsIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          {!isCollapsed && <span className="tracking-tight font-medium text-xs truncate">Settings</span>}

          {/* Floating Tooltip for Collapsed Settings */}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900/95 dark:bg-slate-800/95 text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
              Settings
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
