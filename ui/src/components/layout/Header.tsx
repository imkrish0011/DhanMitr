'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
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
  } = useFinance();

  const [showNotifications, setShowNotifications] = useState(false);

  const tabs: { id: FinanceSubTab; label: string; badge?: number | string }[] = [
    { id: 'overview', label: 'Overview' },
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
            Complete overview of your financial life
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Bloom Menu to Add Record */}
          <BloomMenu
            triggerLabel="Add Record"
            onSelect={(id) => onOpenAddModal(id)}
          />

          {/* Sync Button */}
          <button
            onClick={syncData}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs hover:shadow-xs transition-all"
          >
            <RefreshIcon className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${isSyncing ? 'animate-spin text-emerald-500' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs hover:shadow-xs transition-colors"
            >
              <BellIcon className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3.5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Alerts & Reminders</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">2 Urgent</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/50">
                    <p className="font-bold text-amber-900 dark:text-amber-300">Netflix Renewal Due</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">₹499 due on 24 Aug (in 8 days)</p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                    <p className="font-bold text-emerald-900 dark:text-emerald-300">Surplus Goal Met!</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">₹24,007 net savings this month.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
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
