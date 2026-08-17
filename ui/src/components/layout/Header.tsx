'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { FinanceSubTab } from '@/types';
import {
  RefreshIcon,
  BellIcon,
  SparkleSmallIcon,
} from '@/components/icons/CustomIcons';

import { BloomMenu } from '@/components/ui/BloomMenu';

interface HeaderProps {
  onOpenAddModal: (type?: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal }) => {
  const {
    activeSubTab,
    setActiveSubTab,
    isSyncing,
    syncData,
    activeSubscriptionsCount,
    activeInsurancesCount,
    subscriptions,
    netSurplus,
  } = useFinance();

  const { isAuthenticated, profile, openAuthModal, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const tabs: { id: FinanceSubTab; label: string; badge?: number | string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'subscriptions', label: 'OTT & Subscriptions', badge: activeSubscriptionsCount },
    { id: 'insurances', label: 'Insurances', badge: activeInsurancesCount },
    { id: 'budget', label: 'Budget & Income' },
  ];

  // Dynamic alerts from user's actual database
  const activeAlerts = [
    ...subscriptions.filter((s) => s.is_active && (s.is_urgent || s.days_remaining <= 10)).map((s) => ({
      id: s.id,
      title: `${s.name} Renewal`,
      sub: `₹${s.amount} due (${s.next_renewal_date})`,
      type: 'warning' as const,
    })),
    ...(netSurplus > 0 ? [{
      id: 'surplus_active',
      title: 'Net Surplus Positive',
      sub: `₹${netSurplus.toLocaleString('en-IN')} net savings recorded`,
      type: 'success' as const,
    }] : []),
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
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs hover:shadow-xs transition-colors cursor-pointer"
                >
                  <BellIcon className="w-4 h-4" />
                  {activeAlerts.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">Alerts & Reminders</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {activeAlerts.length} Active
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      {activeAlerts.length === 0 ? (
                        <p className="text-slate-400 text-center py-2">No pending alerts</p>
                      ) : (
                        activeAlerts.map((alt) => (
                          <div
                            key={alt.id}
                            className={`p-2.5 rounded-xl border ${
                              alt.type === 'warning'
                                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50'
                            }`}
                          >
                            <p
                              className={`font-bold ${
                                alt.type === 'warning'
                                  ? 'text-amber-900 dark:text-amber-300'
                                  : 'text-emerald-900 dark:text-emerald-300'
                              }`}
                            >
                              {alt.title}
                            </p>
                            <p
                              className={`text-[11px] ${
                                alt.type === 'warning'
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-emerald-700 dark:text-emerald-400'
                              }`}
                            >
                              {alt.sub}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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
