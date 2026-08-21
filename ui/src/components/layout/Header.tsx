'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { FinanceSubTab } from '@/types';
import {
  RefreshIcon,
  SparkleSmallIcon,
} from '@/components/icons/CustomIcons';

import { BloomMenu } from '@/components/ui/BloomMenu';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface HeaderProps {
  onOpenAddModal: (type?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal }) => {
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
  const [showUserMenu, setShowUserMenu] = useState(false);

  const tabs: { id: FinanceSubTab; label: string; badge?: number | string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'goals', label: 'Goals & Milestones', badge: activeGoalsCount > 0 ? activeGoalsCount : undefined },
    { id: 'tax_calculator', label: 'Tax Optimizer' },
    { id: 'subscriptions', label: 'OTT & Subscriptions', badge: activeSubscriptionsCount },
    { id: 'insurances', label: 'Insurances', badge: activeInsurancesCount },
    { id: 'budget', label: 'Budget & Income' },
  ];

  return (
    <header className="pt-8 pb-3 px-6 sm:px-10 bg-transparent transition-colors duration-200">
      {/* Top Row: Title, Subtitle, and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Finance Hub
              <SparkleSmallIcon className="w-5 h-5 text-emerald-500 fill-emerald-400" />
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAuthenticated
              ? `Welcome back, ${profile?.name || 'User'} • Real-time overview of your finances`
              : 'Complete overview of your financial life'}
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Bloom Menu to Add Record */}
              <BloomMenu
                triggerLabel="Add Record"
                onSelect={(id) => onOpenAddModal(id)}
              />

              {/* Sync Button */}
              <button
                onClick={syncData}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <RefreshIcon className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${isSyncing ? 'animate-spin text-emerald-500' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
              </button>

              {/* Notification Bell */}
              <NotificationBell />

              {/* User Avatar Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold text-xs flex items-center justify-center border border-emerald-300 dark:border-emerald-700 cursor-pointer shadow-xs"
                >
                  {profile?.avatar_initial || 'U'}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{profile?.name || 'User'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{profile?.email || ''}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl font-semibold transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup', 'Sign up to unlock the complete Finance Hub and sync your data to Supabase.')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Segment Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-0 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`relative px-4 py-2.5 text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}

              {/* Active Underline indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full shadow-xs" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
