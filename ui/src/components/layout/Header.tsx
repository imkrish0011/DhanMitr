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
import { BloomMenu } from '@/components/ui/BloomMenu';
import { ThemeToggle } from '@/components/motion/theme-toggle';
import { useLanguage } from '@/context/LanguageContext';

interface HeaderProps {
  onOpenAddModal: (type?: string) => void;
  onNavigateToTab?: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal, onNavigateToTab }) => {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
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
    { id: 'overview', label: t.tabs.overview },
    { id: 'goals', label: t.tabs.goals(activeGoalsCount), badge: activeGoalsCount > 0 ? activeGoalsCount : undefined },
    { id: 'tax_calculator', label: t.tabs.tax },
    { id: 'subscriptions', label: t.tabs.subs(activeSubscriptionsCount), badge: activeSubscriptionsCount > 0 ? activeSubscriptionsCount : undefined },
    { id: 'insurances', label: t.tabs.ins(activeInsurancesCount), badge: activeInsurancesCount > 0 ? activeInsurancesCount : undefined },
    { id: 'budget', label: t.tabs.budget },
  ];

  return (
    <header className="pt-4 pb-3 px-6 sm:px-10 bg-white/80 dark:bg-[#070B14]/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/[0.06] transition-colors duration-200 sticky top-0 z-30">
      {/* Top Row: Title, Status, and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand / Title */}
        <div className="min-w-0 shrink">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t.appTitle}</span>
              <SparkleSmallIcon className="w-4 h-4 text-emerald-500 fill-emerald-400" />
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{language === 'hi' ? 'लाइव हिसाब' : 'Live Sync'}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate max-w-sm sm:max-w-md lg:max-w-lg">
            {isAuthenticated
              ? (language === 'hi'
                  ? `नमस्ते, ${profile?.name || 'उपयोगकर्ता'} • दैनिक कमाई, खर्च और बचत का पूरा हिसाब`
                  : `Welcome back, ${profile?.name || 'User'} • Personal cashflow & savings summary`)
              : t.appSub}
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
            <span className="text-slate-500 dark:text-slate-400 text-xs">{language === 'hi' ? 'खाता खोजें...' : 'Search ledger...'}</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 shadow-2xs">⌘K</kbd>
          </button>

          {isAuthenticated ? (
            <>
              {/* Executive Primary Action: BloomMenu for Add Record */}
              <BloomMenu
                triggerLabel={language === 'hi' ? 'नया हिसाब' : 'Add Record'}
                onSelect={(id) => onOpenAddModal(id)}
              />

              {/* Utility Cluster: Language Switch, Sync, Theme Toggle, Notification Bell, User Avatar */}
              <div className="flex items-center gap-1 h-10 p-1 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10">
                {/* Language Switcher Pill */}
                <button
                  onClick={toggleLanguage}
                  className="h-8 px-2 rounded-xl flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer"
                  title={language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
                >
                  <span className="text-xs">🌐</span>
                  <span className="font-mono text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                    {language === 'hi' ? 'हि' : 'EN'}
                  </span>
                </button>

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
                <ThemeToggle
                  variant="circle"
                  start="top-right"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                  iconClassName="w-4 h-4"
                  title="Toggle theme"
                />

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
                        <span>{language === 'hi' ? 'लॉग आउट' : 'Sign Out'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* Language Switcher for Guests */}
              <button
                onClick={toggleLanguage}
                className="h-8 px-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-all cursor-pointer"
                title={language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
              >
                <span className="text-xs">🌐</span>
                <span className="font-mono text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                  {language === 'hi' ? 'हि' : 'EN'}
                </span>
              </button>

              {/* Theme Toggle Button for Guests */}
              <ThemeToggle
                variant="circle"
                start="top-right"
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-all cursor-pointer"
                iconClassName="w-4 h-4"
                title="Toggle theme"
              />

              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                {language === 'hi' ? 'साइन इन' : 'Sign In'}
              </button>
              <button
                onClick={() => openAuthModal('signup', 'Sign up to unlock the complete Finance Hub and sync your data to Supabase.')}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
              >
                {language === 'hi' ? 'खाता बनाएं' : 'Create Account'}
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
