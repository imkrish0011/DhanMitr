'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { FinanceSubTab, NavTab } from '@/types';
import {
  RefreshIcon,
  SparkleSmallIcon,
} from '@/components/icons/CustomIcons';
import {
  Sun,
  Moon,
  Search,
  Plus,
  ChevronDown,
  CreditCard,
  Tv,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
  LogOut,
} from 'lucide-react';

import { NotificationBell } from '@/components/notifications/NotificationBell';

interface HeaderProps {
  onOpenAddModal: (type?: string) => void;
  onNavigateToTab?: (tab: NavTab) => void;
}

const QUICK_ADD_OPTIONS = [
  { id: 'expense', label: 'Expense / Outflow', icon: CreditCard },
  { id: 'income', label: 'Income Source', icon: Wallet },
  { id: 'subscription', label: 'OTT & Subscription', icon: Tv },
  { id: 'insurance', label: 'Insurance Policy', icon: ShieldCheck },
  { id: 'goal', label: 'Financial Goal', icon: Target },
  { id: 'investment', label: 'Investment (SIP)', icon: TrendingUp },
];

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal, onNavigateToTab }) => {
  const { theme, toggleTheme } = useTheme();
  const {
    activeSubTab,
    setActiveSubTab,
    isSyncing,
    syncData,
    activeSubscriptionsCount,
    activeInsurancesCount,
    activeGoalsCount,
  } = useFinance();

  const { isAuthenticated, profile, openAuthModal, signOut } = useAuth();

  // Dropdown state and refs for reliable outside-click dismissal
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click or Escape
  useEffect(() => {
    if (!showUserMenu) return;
    const handleOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showUserMenu]);

  // Close add menu on outside click or Escape
  useEffect(() => {
    if (!showAddMenu) return;
    const handleOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddMenu(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showAddMenu]);

  // Global Ctrl+K / ⌘K shortcut to switch to search / transactions ledger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onNavigateToTab?.('transactions');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigateToTab]);

  const tabs: { id: FinanceSubTab; label: string; badge?: number | string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'goals', label: 'Goals & Milestones', badge: activeGoalsCount > 0 ? activeGoalsCount : undefined },
    { id: 'tax_calculator', label: 'Tax Optimizer' },
    { id: 'subscriptions', label: 'OTT & Subscriptions', badge: activeSubscriptionsCount > 0 ? activeSubscriptionsCount : undefined },
    { id: 'insurances', label: 'Insurances', badge: activeInsurancesCount > 0 ? activeInsurancesCount : undefined },
    { id: 'budget', label: 'Budget & Income' },
  ];

  return (
    <header className="pt-4 pb-3 px-6 sm:px-10 bg-white/80 dark:bg-[#070B14]/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/[0.06] transition-colors duration-200 sticky top-0 z-30">
      {/* Top Row: Title, Status, and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand / Title */}
        <div className="min-w-0 shrink">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Finance Hub</span>
              <SparkleSmallIcon className="w-4 h-4 text-emerald-500 fill-emerald-400" />
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Telemetry</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate max-w-sm sm:max-w-md lg:max-w-lg">
            {isAuthenticated
              ? `Welcome back, ${profile?.name || 'User'} • Institutional personal wealth tracking`
              : 'Institutional personal finance & wealth intelligence'}
          </p>
        </div>

        {/* Right: Actions Tray */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Quick Search Pill */}
          <button
            onClick={() => onNavigateToTab?.('transactions')}
            className="hidden md:flex items-center gap-2 h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-emerald-500/40 transition-all shadow-2xs cursor-pointer"
            title="Search ledger records (Ctrl+K or ⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400 text-xs">Search ledger...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 shadow-2xs">⌘K</kbd>
          </button>

          {isAuthenticated ? (
            <>
              {/* Executive Primary Action: Add Record Split Button */}
              <div className="relative" ref={addMenuRef}>
                <div className="inline-flex items-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all">
                  <button
                    onClick={() => {
                      setShowAddMenu(false);
                      onOpenAddModal();
                    }}
                    className="flex items-center gap-1.5 h-10 px-3.5 text-xs font-bold cursor-pointer rounded-l-xl active:scale-95 transition-transform"
                    title="Add Financial Record"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Record</span>
                  </button>
                  <button
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="h-10 px-2 border-l border-emerald-500/40 hover:bg-emerald-700/40 rounded-r-xl cursor-pointer flex items-center justify-center transition-colors"
                    title="Quick Category Picker"
                    aria-label="Open record category menu"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAddMenu ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Quick Add Dropdown: Anchored neatly below the button */}
                {showAddMenu && (
                  <div className="!absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-56 fintech-card rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl text-xs">
                    <div className="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/[0.06] mb-1">
                      Quick Add Category
                    </div>
                    <div className="space-y-0.5">
                      {QUICK_ADD_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setShowAddMenu(false);
                            onOpenAddModal(opt.id);
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 text-left font-medium transition-colors cursor-pointer group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.05] group-hover:bg-emerald-500/20 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 transition-colors">
                            <opt.icon className="w-3.5 h-3.5" />
                          </div>
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Utility Cluster: Sync, Theme Toggle, Notification Bell, User Avatar */}
              <div className="flex items-center gap-1 h-10 p-1 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10">
                {/* Sync Button (Compact Icon) */}
                <button
                  onClick={syncData}
                  disabled={isSyncing}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                  title={isSyncing ? 'Syncing data...' : 'Sync Data'}
                  aria-label="Sync Data"
                >
                  <RefreshIcon className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`} />
                </button>

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                  title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? (
                    <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                  )}
                </button>

                {/* Notification Bell */}
                <NotificationBell />

                {/* User Avatar Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-mono font-bold text-xs flex items-center justify-center border border-emerald-400/30 cursor-pointer shadow-xs active:scale-95 transition-transform"
                    title={profile?.name || 'User Profile'}
                  >
                    {profile?.avatar_initial || 'U'}
                  </button>

                  {showUserMenu && (
                    <div className="!absolute right-0 top-full mt-2 w-56 fintech-card rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.06] mb-1">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{profile?.name || 'User'}</p>
                        <p className="text-[10px] text-slate-400 truncate font-mono">{profile?.email || ''}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-semibold transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* Theme Toggle Button for Guests */}
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-all cursor-pointer"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>

              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup', 'Sign up to unlock the complete Finance Hub and sync your data to Supabase.')}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Segment Tabs: Spacious, Uncongested Luxury Pills */}
      <div className="flex items-center gap-1 sm:gap-2 mt-4 pt-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs sm:text-xs font-medium rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-md ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-black/15 dark:text-slate-950'
                      : 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
