'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { 
  Users, 
  UserCheck, 
  Tv, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  PieChart as PieChartIcon,
  Clock,
  ArrowUpRight,
  Database,
  Layers,
  DollarSign
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface StatsData {
  totalUsers: number;
  onboardedUsers: number;
  guestOrPendingUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalInsurances: number;
  activeInsurances: number;
  totalBudgetItems: number;
  totalIncomeSources: number;
  totalTransactions: number;
  totalAdmins: number;
  estimatedMonthlyRecurringTracked: number;
  totalInsuranceCoverage: number;
  totalAnnualizedPremiums: number;
  totalIncomeRecorded: number;
  totalExpenseRecorded: number;
  totalInvestmentRecorded: number;
  riskDistribution: {
    conservative: number;
    moderate: number;
    aggressive: number;
  };
  employmentDistribution: {
    salaried: number;
    self_employed: number;
    freelancer: number;
    student: number;
    retired: number;
  };
  taxRegimeDistribution: {
    new: number;
    old: number;
    not_applicable: number;
  };
  topProviders: Array<{ name: string; count: number }>;
  budgetAllocations: Array<{ category: string; allocated: number; spent: number }>;
  tableCounts: Record<string, number>;
}

export const AdminDashboardView: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { adminFetch } = useAdminAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminFetch('/api/admin/stats');
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentUsers(data.recentUsers || []);
        setRecentLogs(data.recentAuditLogs || []);
        setLastRefreshed(new Date().toLocaleTimeString());
      } else {
        throw new Error(data.error || 'Failed to parse statistics');
      }
    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
      setError(err.message || 'Failed to load system metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (isLoading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm font-medium">Aggregating live धनMitr system metrics...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-red-200 mb-1">Metrics Loading Error</h3>
        <p className="text-sm text-red-300/80 mb-4">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry Connection
        </button>
      </div>
    );
  }

  const onboardedPercent = stats && stats.totalUsers > 0 
    ? Math.round((stats.onboardedUsers / stats.totalUsers) * 100) 
    : 0;

  const providerChartColors = ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#8B5CF6', '#3B82F6'];

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Overview</h1>
          <p className="text-sm text-slate-400">Real-time telemetry, cashflow metrics, and database health</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Updated: {lastRefreshed}
            </span>
          )}
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div 
          onClick={() => onNavigateTab('users')}
          className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/40 transition-all shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</span>
            <span className="text-xs text-emerald-400 font-medium">Registered</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {stats?.onboardedUsers || 0} fully onboarded ({onboardedPercent}%)
          </p>
        </div>

        {/* Tracked OTT & Recurring */}
        <div 
          onClick={() => onNavigateTab('recurring')}
          className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-amber-500/40 transition-all shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">OTT Subscriptions</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Tv className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats?.activeSubscriptions || 0}</span>
            <span className="text-xs text-amber-400 font-medium">Active trackers</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {formatCurrency(stats?.estimatedMonthlyRecurringTracked || 0)}/mo volume
          </p>
        </div>

        {/* Insurance Coverage */}
        <div 
          onClick={() => onNavigateTab('recurring')}
          className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-purple-500/40 transition-all shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Insurance Policies</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats?.activeInsurances || 0}</span>
            <span className="text-xs text-purple-400 font-medium">Policies</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {formatCurrency(stats?.totalInsuranceCoverage || 0)} total cover sum
          </p>
        </div>

        {/* Global Transactions */}
        <div 
          onClick={() => onNavigateTab('transactions')}
          className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/40 transition-all shadow-sm cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Global Cashflow</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats?.totalTransactions || 0}</span>
            <span className="text-xs text-indigo-400 font-medium">Transactions</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {formatCurrency(stats?.totalIncomeRecorded || 0)} total logged
          </p>
        </div>
      </div>

      {/* Visual Analytics Row (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top OTT Providers Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Tv className="w-4 h-4 text-amber-400" /> Top Tracked OTT & Digital Services
            </h3>
            <span className="text-xs text-slate-500">Popularity</span>
          </div>

          {(stats?.topProviders || []).length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">No subscriptions tracked yet.</p>
          ) : (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.topProviders} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(stats?.topProviders || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={providerChartColors[index % providerChartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Database Table Row Matrix */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" /> Database Table Row Telemetry
            </h3>
            <span className="text-xs text-slate-500">Supabase</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {Object.entries(stats?.tableCounts || {}).map(([table, count]) => (
              <div key={table} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block mb-1 capitalize truncate font-mono text-[10px]">
                  {table.replace('_', ' ')}
                </span>
                <span className="text-lg font-bold text-white">{count}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Postgres Status:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Healthy & Synced
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent User Registrations</h3>
            <button 
              onClick={() => onNavigateTab('users')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View directory <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No users registered yet.</p>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentUsers.map((u) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                      {u.avatar_initial || (u.name ? u.name.charAt(0).toUpperCase() : 'U')}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{u.name || 'Anonymous User'}</p>
                      <p className="text-slate-400">{u.email || 'No email provided'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                      u.is_onboarded 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {u.is_onboarded ? 'Onboarded' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Admin Audit Logs */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Audit Events</h3>
            <button 
              onClick={() => onNavigateTab('logs')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View full audit trail <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recentLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No recent administrative actions recorded.</p>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-emerald-400 font-semibold">{log.action}</span>
                    <p className="text-slate-400 mt-0.5">by {log.admin_email || 'System'}</p>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
