'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  Search, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  PieChart, 
  Calendar 
} from 'lucide-react';

export const AdminTransactionsView: React.FC = () => {
  const { adminFetch } = useAdminAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      params.append('limit', '200');

      const res = await adminFetch(`/api/admin/transactions?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      } else {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
    } catch (err: any) {
      console.error('Error in AdminTransactionsView:', err);
      setError(err.message || 'Failed to load transaction ledger.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, categoryFilter]);

  const formatCurrency = (val: number, cur: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: cur || 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filtered = transactions.filter(t =>
    t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.account_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalIn = filtered.filter(t => t.type === 'income').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const totalOut = filtered.filter(t => t.type === 'expense').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const totalInvested = filtered.filter(t => t.type === 'investment').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Global Transaction Ledger</h1>
          <p className="text-sm text-slate-400">Live monitoring of user financial cashflow and categorizations</p>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          Refresh Ledger
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">Total Income Logged</span>
            <span className="text-xl font-bold text-emerald-400">{formatCurrency(totalIn)}</span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">Total Expenses Logged</span>
            <span className="text-xl font-bold text-rose-400">{formatCurrency(totalOut)}</span>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">Investments Logged</span>
            <span className="text-xl font-bold text-indigo-400">{formatCurrency(totalInvested)}</span>
          </div>
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search title, user, account, note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Flow Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
            <option value="investment">Investment Only</option>
            <option value="transfer">Transfer Only</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500 capitalize"
          >
            <option value="all">All Categories</option>
            <option value="housing">Housing</option>
            <option value="groceries">Groceries</option>
            <option value="dining">Dining</option>
            <option value="utilities">Utilities</option>
            <option value="subscriptions">Subscriptions</option>
            <option value="insurance">Insurance</option>
            <option value="investments">Investments</option>
            <option value="salary">Salary</option>
            <option value="travel">Travel</option>
            <option value="shopping">Shopping</option>
            <option value="healthcare">Healthcare</option>
            <option value="entertainment">Entertainment</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {isLoading && transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <RefreshCw className="w-7 h-7 animate-spin text-emerald-500 mb-2" />
            <p className="text-xs">Scanning transaction records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <DollarSign className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">No transactions recorded</p>
            <p className="text-xs text-slate-600 mt-1">User financial transactions will be audited here in real-time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Transaction Title</th>
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Account / Source</th>
                  <th className="px-5 py-3.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((tx) => {
                  const isInc = tx.type === 'income';
                  const isExp = tx.type === 'expense';
                  const isInv = tx.type === 'investment';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${
                            isInc ? 'bg-emerald-500/10 text-emerald-400' : isExp ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'
                          }`}>
                            {isInc ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          </div>
                          <span>{tx.title}</span>
                          {tx.is_recurring && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              Recurring
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{tx.user_name}</div>
                        <div className="text-[10px] text-slate-500">{tx.user_email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          isInc 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isExp
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-300">
                        {tx.category || 'General'}
                      </td>
                      <td className={`px-4 py-3 font-bold ${
                        isInc ? 'text-emerald-400' : isExp ? 'text-rose-400' : 'text-indigo-400'
                      }`}>
                        {isInc ? '+' : isExp ? '-' : ''}{formatCurrency(tx.amount, tx.currency)}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {tx.account_name || 'Primary Wallet'}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-[11px] text-slate-500">
                        {tx.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
