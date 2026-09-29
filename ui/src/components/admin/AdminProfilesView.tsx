'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { 
  CreditCard, 
  PieChart, 
  TrendingUp, 
  Layers, 
  RefreshCw, 
  DollarSign, 
  AlertCircle,
  Search,
  UserCheck,
  UserX,
  Wallet,
  Receipt,
  Shield
} from 'lucide-react';

interface ProfileRecord {
  id: string;
  name: string;
  email: string;
  currency: string;
  monthly_income: number;
  monthly_expenses: number;
  total_investments: number;
  emergency_fund_balance: number;
  risk_tolerance: string;
  employment_type: string;
  tax_regime: string;
  is_onboarded: boolean;
  created_at: string;
}

export const AdminProfilesView: React.FC = () => {
  const { adminFetch } = useAdminAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProfilesData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminFetch('/api/admin/profiles');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        throw new Error(json.error || 'Failed to fetch profiles');
      }
    } catch (err: any) {
      console.error('Error in AdminProfilesView:', err);
      setError(err.message || 'Failed to load profile aggregations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfilesData();
  }, []);

  const formatCurrency = (val: number, cur: string = 'INR') => {
    try {
      const safeCur = (cur && typeof cur === 'string' && cur.length === 3) ? cur.toUpperCase() : 'INR';
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: safeCur,
        maximumFractionDigits: 0,
      }).format(val || 0);
    } catch {
      return `₹${Math.round(val || 0).toLocaleString('en-IN')}`;
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm font-medium">Aggregating धनMitr financial demographics...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-red-200 mb-1">Failed to Load Profile Analytics</h3>
        <p className="text-sm text-red-300/80 mb-4">{error}</p>
        <button
          onClick={fetchProfilesData}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const averages = data?.analytics?.averages || {};
  const riskDist = data?.analytics?.riskDistribution || {};
  const taxDist = data?.analytics?.taxRegimeDistribution || {};
  const empDist = data?.analytics?.employmentDistribution || {};
  const totalProfiles = data?.analytics?.totalProfiles || 0;
  const profilesList: ProfileRecord[] = data?.profiles || [];

  const filteredProfiles = profilesList.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.id?.toLowerCase().includes(q) ||
      p.employment_type?.toLowerCase().includes(q) ||
      p.tax_regime?.toLowerCase().includes(q) ||
      p.risk_tolerance?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Financial Profiles & Demographics</h1>
          <p className="text-sm text-slate-400">Aggregated insights and individual wealth profiles across all users</p>
        </div>
        <button
          onClick={fetchProfilesData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          Refresh Aggregations
        </button>
      </div>

      {/* Aggregate Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Average Monthly Income</span>
          <div className="text-2xl font-bold text-emerald-400">
            {formatCurrency(averages.averageMonthlyIncome)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Across {totalProfiles} profiles</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Average Monthly Spend</span>
          <div className="text-2xl font-bold text-rose-400">
            {formatCurrency(averages.averageMonthlyExpenses)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Estimated monthly burn</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Avg Investment Portfolio</span>
          <div className="text-2xl font-bold text-indigo-400">
            {formatCurrency(averages.averageInvestments)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Mutual funds, equities & fixed</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Total Emergency Reserve</span>
          <div className="text-2xl font-bold text-blue-400">
            {formatCurrency(averages.totalEmergencyFundSum)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Aggregate liquidity cushion</span>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tax Regime Split */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Tax Regime Preferences
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">New Tax Regime (Default)</span>
              <span className="font-bold text-white px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                {taxDist.new || 0} users
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Old Tax Regime</span>
              <span className="font-bold text-white px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">
                {taxDist.old || 0} users
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Not Applicable</span>
              <span className="font-bold text-white px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                {taxDist.not_applicable || 0} users
              </span>
            </div>
          </div>
        </div>

        {/* Risk Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" /> Risk Profiles
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Moderate</span>
              <span className="font-bold text-white px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">
                {riskDist.moderate || 0} users
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Conservative</span>
              <span className="font-bold text-white px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                {riskDist.conservative || 0} users
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">Aggressive</span>
              <span className="font-bold text-white px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                {riskDist.aggressive || 0} users
              </span>
            </div>
          </div>
        </div>

        {/* Employment Demographics */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" /> Employment Distribution
          </h3>
          <div className="space-y-2 text-xs">
            {Object.entries(empDist).map(([key, count]: any) => (
              <div key={key} className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300 capitalize">{key.replace('_', ' ')}</span>
                <span className="font-bold text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Wealth Profiles Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Registered User Wealth Directory</h2>
            <p className="text-xs text-slate-400">Detailed financial balances, regime, and risk preferences for all profiles</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <UserX className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-medium text-slate-400">No wealth profiles match your search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-4 py-3 text-right">Income /mo</th>
                    <th className="px-4 py-3 text-right">Expenses /mo</th>
                    <th className="px-4 py-3 text-right">Investments</th>
                    <th className="px-4 py-3 text-right">Emergency Cushion</th>
                    <th className="px-4 py-3">Risk Tolerance</th>
                    <th className="px-4 py-3">Employment</th>
                    <th className="px-4 py-3">Tax Regime</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProfiles.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-white">{p.name || 'User'}</div>
                        <div className="text-slate-500 text-[11px]">{p.email || p.id.substring(0, 8)}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                        {formatCurrency(p.monthly_income, p.currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-rose-400">
                        {formatCurrency(p.monthly_expenses, p.currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-indigo-400">
                        {formatCurrency(p.total_investments, p.currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-400">
                        {formatCurrency(p.emergency_fund_balance, p.currency)}
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-300">
                        {p.risk_tolerance || 'Moderate'}
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-400">
                        {p.employment_type?.replace('_', ' ') || 'Salaried'}
                      </td>
                      <td className="px-4 py-3 uppercase text-slate-400">
                        {p.tax_regime || 'New'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          p.is_onboarded 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {p.is_onboarded ? 'Onboarded' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
