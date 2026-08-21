'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Tv,
  DollarSign,
  FileText,
  Settings,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

import { AdminDashboardView } from '@/components/admin/AdminDashboardView';
import { AdminUsersView } from '@/components/admin/AdminUsersView';
import { AdminProfilesView } from '@/components/admin/AdminProfilesView';
import { AdminSubscriptionsInsurancesView } from '@/components/admin/AdminSubscriptionsInsurancesView';
import { AdminTransactionsView } from '@/components/admin/AdminTransactionsView';
import { AdminLogsView } from '@/components/admin/AdminLogsView';
import { AdminSettingsView } from '@/components/admin/AdminSettingsView';

export type AdminTab = 'overview' | 'users' | 'profiles' | 'recurring' | 'transactions' | 'logs' | 'settings';

const NAV_SECTIONS: Array<{
  title: string;
  items: Array<{ id: AdminTab; label: string; icon: React.ElementType }>;
}> = [
  {
    title: 'Administration',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'users', label: 'Users & RBAC', icon: Users },
      { id: 'profiles', label: 'Wealth Demographics', icon: CreditCard },
    ],
  },
  {
    title: 'Financial Data',
    items: [
      { id: 'recurring', label: 'OTT & Insurances', icon: Tv },
      { id: 'transactions', label: 'Global Transactions', icon: DollarSign },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'logs', label: 'Audit Trail', icon: FileText },
      { id: 'settings', label: 'Diagnostics & Telemetry', icon: Settings },
    ],
  },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const { adminRole } = useAdminAuth();

  const renderNavButton = (item: { id: AdminTab; label: string; icon: React.ElementType }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
          isActive
            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
        }`}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
        <span>{item.label}</span>
        {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
      </button>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {/* Sidebar Header */}
        <div className="px-4 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Admin Control Panel
            </span>
          </div>
          <p className="text-[10px] text-slate-600 mt-1 font-mono">DhanMITR · v1.0.0</p>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 pb-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(renderNavButton)}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-500" /> System Online
            </span>
            <span className="px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {adminRole || 'admin'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Mobile Navigation (horizontal scroll) */}
        <div className="lg:hidden flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto">
          {NAV_SECTIONS.flatMap((s) => s.items).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        <div className="min-h-[500px]">
          {activeTab === 'overview' && (
            <AdminDashboardView onNavigateTab={(tab) => setActiveTab(tab as AdminTab)} />
          )}
          {activeTab === 'users' && <AdminUsersView />}
          {activeTab === 'profiles' && <AdminProfilesView />}
          {activeTab === 'recurring' && <AdminSubscriptionsInsurancesView />}
          {activeTab === 'transactions' && <AdminTransactionsView />}
          {activeTab === 'logs' && <AdminLogsView />}
          {activeTab === 'settings' && <AdminSettingsView />}
        </div>
      </div>
    </div>
  );
}
