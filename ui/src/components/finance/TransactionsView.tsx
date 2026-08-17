'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { SparkleSmallIcon } from '@/components/icons/CustomIcons';
import {
  Wallet,
  TrendingUp,
  Utensils,
  ShoppingCart,
  ShoppingBag,
  Car,
  Zap,
  Tv,
  HeartPulse,
  CreditCard,
} from 'lucide-react';

interface TransactionsViewProps {
  onOpenAddModal: (type?: any) => void;
  onBack?: () => void;
  isMobile?: boolean;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddModal,
  onBack,
  isMobile = false,
}) => {
  const { transactions, totalIncome, totalOutflow, netSurplus } = useFinance();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.account_name && tx.account_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.category && tx.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getCategoryIcon = (category?: string, type?: string) => {
    if (type === 'income') return <Wallet className="w-4 h-4 text-emerald-500" />;
    if (type === 'investment') return <TrendingUp className="w-4 h-4 text-blue-500" />;
    switch (category?.toLowerCase()) {
      case 'food':
      case 'dining':
        return <Utensils className="w-4 h-4 text-amber-500" />;
      case 'groceries':
        return <ShoppingCart className="w-4 h-4 text-emerald-500" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-purple-500" />;
      case 'transport':
      case 'fuel':
        return <Car className="w-4 h-4 text-sky-500" />;
      case 'utilities':
      case 'bills':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'entertainment':
      case 'subscriptions':
        return <Tv className="w-4 h-4 text-rose-500" />;
      case 'health':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-24 md:pb-8">
      {/* Mobile Top Navigation Header */}
      {isMobile && (
        <div className="sticky top-0 z-30 px-4 py-3 bg-white/95 dark:bg-[#0B101D]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-2xs mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 justify-center">
              Transactions
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Live Ledger</p>
          </div>

          <button
            onClick={() => onOpenAddModal('expense')}
            className="p-1.5 sm:px-3 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
          >
            <span className="text-sm leading-none">+</span>
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      )}

      <div className="px-4 sm:px-6 md:px-8 space-y-5">
        {/* Desktop Page Title & Top Actions */}
        {!isMobile && (
          <div className="flex items-center justify-between pt-6 pb-2">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Recent Transactions
                <SparkleSmallIcon className="w-5 h-5 text-emerald-500 fill-emerald-400" />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Live ledger of your banking, UPI and automated debits
              </p>
            </div>
            <button
              onClick={() => onOpenAddModal('expense')}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
            >
              <span className="text-base leading-none">+</span>
              <span>Add Transaction</span>
            </button>
          </div>
        )}

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400">Total Inflow</span>
            <p className="text-xs sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
              +₹{totalIncome.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400">Total Outflow</span>
            <p className="text-xs sm:text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5 truncate">
              -₹{totalOutflow.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400">Net Balance</span>
            <p className={`text-xs sm:text-lg font-black mt-0.5 truncate ${netSurplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              ₹{netSurplus.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'expense'
                  ? 'bg-white dark:bg-[#0F172A] text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'income'
                  ? 'bg-white dark:bg-[#0F172A] text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Income
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              placeholder="Search by title, category, account..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Transactions List Container */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto text-2xl font-black shadow-lg shadow-emerald-900/30">
                ₹
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {transactions.length === 0 ? 'Your Ledger is Clean & Ready' : 'No Matching Transactions'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {transactions.length === 0
                    ? 'Log your daily UPI expenses, salary credits, or investments to keep a real-time financial overview.'
                    : 'Try changing your search query or filter category to view matching records.'}
                </p>
              </div>

              {transactions.length === 0 && (
                <div className="pt-2 space-y-3">
                  <button
                    onClick={() => onOpenAddModal('expense')}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-900/20 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>+</span>
                    <span>Add First Transaction</span>
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md mx-auto pt-2">
                    <button
                      onClick={() => onOpenAddModal('expense')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Utensils className="w-3 h-3 text-amber-500" />
                      <span>Dining / Tea (₹150)</span>
                    </button>
                    <button
                      onClick={() => onOpenAddModal('expense')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ShoppingCart className="w-3 h-3 text-emerald-500" />
                      <span>Groceries (₹1,200)</span>
                    </button>
                    <button
                      onClick={() => onOpenAddModal('income')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Wallet className="w-3 h-3 text-blue-500" />
                      <span>Salary Deposit</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                    }`}>
                      {getCategoryIcon(tx.category, tx.type)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {tx.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded font-medium text-slate-600 dark:text-slate-300">
                          {tx.account_name || 'UPI / Cash'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs sm:text-sm font-extrabold ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[9px] text-slate-400 capitalize">{tx.category || tx.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
