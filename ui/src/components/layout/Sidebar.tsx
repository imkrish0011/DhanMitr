'use client';

import React from 'react';
import { NavTab } from '@/types';
import { useAuth } from '@/context/AuthContext';
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
  const { isAuthenticated, openAuthModal } = useAuth();
  const { netSurplus, savingsRate } = useFinance();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; requiresAuth?: boolean }[] = [
    { id: 'ai_companion', label: 'AI Companion', icon: <SparklesIcon className="w-5 h-5" /> },
    { id: 'finance_hub', label: 'Finance Hub', icon: <ShieldCheckIcon className="w-5 h-5" />, requiresAuth: true },
    { id: 'transactions', label: 'Transactions', icon: <TransactionsIcon className="w-5 h-5" />, requiresAuth: true },
  ];

  const handleNavClick = (item: { id: NavTab; requiresAuth?: boolean }) => {
    if (item.requiresAuth && !isAuthenticated) {
      openAuthModal('signup', 'Sign in or create an account to unlock your personalized Finance Hub and Transactions.');
      return;
    }
    onSelectTab(item.id);
  };

  return (
    <aside className="w-64 h-screen shrink-0 sticky top-0 bg-white dark:bg-[#0B101B] border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between p-5 select-none transition-colors duration-200">
      {/* Top: Brand & Navigation */}
      <div>
        {/* Brand Header */}
        <div
          className="flex items-center gap-2.5 px-3 py-3 mb-6 cursor-pointer group"
          onClick={() => onSelectTab(isAuthenticated ? 'finance_hub' : 'ai_companion')}
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
            const isLocked = item.requiresAuth && !isAuthenticated;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {isLocked && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500" title="Sign in to unlock">
                    🔒
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Premium Insights Widget & Settings */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
        {/* Insights Card */}
        {isAuthenticated ? (
          <div className="p-3.5 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl relative overflow-hidden transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                Smart Insights
                <SparkleSmallIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-2.5">
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

              <span className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 rounded-md">
                Active
              </span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => openAuthModal('signup', 'Sign up to unlock Smart Insights & cloud synchronization.')}
            className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-emerald-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                Unlock Hub
                <SparkleSmallIcon className="w-3.5 h-3.5 text-emerald-500 fill-emerald-400" />
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Free</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Sign in to unlock real-time budget tracking & cloud sync.
            </p>
          </div>
        )}

        {/* Settings button */}
        <button
          onClick={() => {
            if (!isAuthenticated) {
              openAuthModal('login', 'Sign in to access your Account Settings.');
              return;
            }
            onSelectTab('settings');
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-4.5 h-4.5 text-slate-400" />
            <span>Settings</span>
          </div>
          {!isAuthenticated && <span className="text-xs text-slate-400">🔒</span>}
        </button>
      </div>
    </aside>
  );
};
