'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Tv,
  DollarSign,
  FileText, 
  Settings 
} from 'lucide-react';

import { AdminDashboardView } from '@/components/admin/AdminDashboardView';
import { AdminUsersView } from '@/components/admin/AdminUsersView';
import { AdminProfilesView } from '@/components/admin/AdminProfilesView';
import { AdminSubscriptionsInsurancesView } from '@/components/admin/AdminSubscriptionsInsurancesView';
import { AdminTransactionsView } from '@/components/admin/AdminTransactionsView';
import { AdminLogsView } from '@/components/admin/AdminLogsView';
import { AdminSettingsView } from '@/components/admin/AdminSettingsView';

export type AdminTab = 'overview' | 'users' | 'profiles' | 'recurring' | 'transactions' | 'logs' | 'settings';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users & RBAC', icon: Users },
    { id: 'profiles', label: 'Wealth Demographics', icon: CreditCard },
    { id: 'recurring', label: 'OTT & Insurances', icon: Tv },
    { id: 'transactions', label: 'Global Transactions', icon: DollarSign },
    { id: 'logs', label: 'Audit Trail', icon: FileText },
    { id: 'settings', label: 'Diagnostics & Telemetry', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
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
  );
}
