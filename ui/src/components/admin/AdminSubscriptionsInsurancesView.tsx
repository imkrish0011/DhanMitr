'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { 
  Tv, 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';

export const AdminSubscriptionsInsurancesView: React.FC = () => {
  const { adminFetch } = useAdminAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [insurances, setInsurances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubView, setActiveSubView] = useState<'subscriptions' | 'insurances'>('subscriptions');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminFetch('/api/admin/subscriptions-insurances');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.subscriptions || []);
        setInsurances(data.insurances || []);
      } else {
        throw new Error(data.error || 'Failed to fetch data');
      }
    } catch (err: any) {
      console.error('Error in AdminSubscriptionsInsurancesView:', err);
      setError(err.message || 'Failed to load records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (val: number, cur: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: cur || 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredSubs = subscriptions.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIns = insurances.filter(i => 
    i.policy_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.policy_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Recurring Products & Insurances</h1>
          <p className="text-sm text-slate-400">Global OTT subscription and insurance policy telemetry across all users</p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          Refresh Records
        </button>
      </div>

      {/* Sub-Switch & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setActiveSubView('subscriptions')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubView === 'subscriptions'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>OTT & Subscriptions ({subscriptions.length})</span>
          </button>
          <button
            onClick={() => setActiveSubView('insurances')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubView === 'insurances'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Insurances & Policies ({insurances.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search provider, user, policy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {isLoading && subscriptions.length === 0 && insurances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <RefreshCw className="w-7 h-7 animate-spin text-emerald-500 mb-2" />
            <p className="text-xs">Loading recurring assets...</p>
          </div>
        ) : activeSubView === 'subscriptions' ? (
          filteredSubs.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Tv className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-400">No subscriptions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Service / Provider</th>
                    <th className="px-4 py-3.5">User</th>
                    <th className="px-4 py-3.5">Plan</th>
                    <th className="px-4 py-3.5">Cost</th>
                    <th className="px-4 py-3.5">Billing</th>
                    <th className="px-4 py-3.5">Next Renewal</th>
                    <th className="px-4 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span>{sub.name}</span>
                          {sub.provider && <span className="text-[10px] text-slate-500 font-mono">({sub.provider})</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{sub.user_name}</div>
                        <div className="text-[10px] text-slate-500">{sub.user_email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{sub.plan_name || 'Standard'}</td>
                      <td className="px-4 py-3 font-bold text-amber-300">
                        {formatCurrency(sub.amount, sub.currency)}
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-400">{sub.billing_cycle || 'Monthly'}</td>
                      <td className="px-4 py-3 text-slate-400 text-[11px] font-mono">{sub.next_renewal_date || 'N/A'}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          sub.is_active 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {sub.is_active ? 'Active' : 'Paused'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredIns.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <ShieldCheck className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-400">No insurance policies found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Policy / Provider</th>
                    <th className="px-4 py-3.5">User</th>
                    <th className="px-4 py-3.5">Type</th>
                    <th className="px-4 py-3.5">Coverage Sum</th>
                    <th className="px-4 py-3.5">Premium</th>
                    <th className="px-4 py-3.5">Renewal Date</th>
                    <th className="px-4 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredIns.map((ins) => (
                    <tr key={ins.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-400" />
                          <span>{ins.policy_name}</span>
                          {ins.provider && <span className="text-[10px] text-slate-500 font-mono">({ins.provider})</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{ins.user_name}</div>
                        <div className="text-[10px] text-slate-500">{ins.user_email}</div>
                      </td>
                      <td className="px-4 py-3 capitalize text-purple-300">
                        {ins.policy_type ? ins.policy_type.replace('_', ' ') : 'General'}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-400">
                        {formatCurrency(ins.coverage_amount)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-300">
                        {formatCurrency(ins.premium_amount)} / {ins.premium_frequency || 'yr'}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px] font-mono">{ins.renewal_date || 'N/A'}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          ins.is_active 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {ins.is_active ? 'Active' : 'Lapsed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};
