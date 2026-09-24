'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { SparkleSmallIcon } from '@/components/icons/CustomIcons';
import { BottomSheetDrawer } from '@/components/ui/BottomSheetDrawer';
import { Transaction, TransactionCategory, TransactionType } from '@/types';
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
  Edit2,
  Trash2,
  Plus,
  Search,
  X,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
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
  const { transactions, totalIncome, totalOutflow, netSurplus, updateTransaction, deleteTransaction } = useFinance();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'investment'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Drawer State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<TransactionType>('expense');
  const [editCategory, setEditCategory] = useState<TransactionCategory>('other');
  const [editAccount, setEditAccount] = useState('');
  const [editDate, setEditDate] = useState('');

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditTitle(tx.title);
    setEditAmount(tx.amount.toString());
    setEditType(tx.type);
    setEditCategory(tx.category);
    setEditAccount(tx.account_name || 'Primary Bank');
    setEditDate(tx.date || new Date().toISOString().slice(0, 10));
    setIsEditDrawerOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editTitle.trim() || !editAmount) return;

    await updateTransaction(editingTx.id, {
      title: editTitle,
      amount: Number(editAmount),
      type: editType,
      category: editCategory,
      account_name: editAccount,
      date: editDate,
    });

    setIsEditDrawerOpen(false);
    setEditingTx(null);
  };

  const expenseCount = transactions.filter((t) => t.type === 'expense').length;
  const incomeCount = transactions.filter((t) => t.type === 'income').length;
  const investmentCount = transactions.filter((t) => t.type === 'investment').length;

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
      case 'travel':
        return <Car className="w-4 h-4 text-sky-500" />;
      case 'utilities':
      case 'bills':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'entertainment':
      case 'subscriptions':
        return <Tv className="w-4 h-4 text-rose-500" />;
      case 'healthcare':
      case 'health':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'investments':
      case 'investment':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-36 md:pb-12 relative">
      <div className="px-4 sm:px-6 md:px-8 space-y-4">
        {/* Mobile Modern Header Banner (No back bar or top plus) */}
        {isMobile && (
          <div className="pt-4 pb-1 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Passbook & Ledger
                <SparkleSmallIcon className="w-4 h-4 text-emerald-500 fill-emerald-400" />
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Zero-leakage UPI & automated debit tracking
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{filteredTransactions.length} Entries</span>
            </div>
          </div>
        )}

        {/* Desktop Page Title & Top Actions */}
        {!isMobile && (
          <div className="flex items-center justify-between pt-6 pb-2">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Passbook & Ledger
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
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>
          </div>
        )}

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-transparent border border-emerald-500/20 shadow-2xs relative overflow-hidden group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Inflow</span>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-md">
                ▲ In
              </span>
            </div>
            <p className="text-sm sm:text-xl font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400 truncate">
              +₹{totalIncome.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">Monthly credits</span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent dark:from-rose-950/40 dark:via-rose-950/20 dark:to-transparent border border-rose-500/20 shadow-2xs relative overflow-hidden group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Outflow</span>
              <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/15 px-1.5 py-0.5 rounded-md">
                ▼ Out
              </span>
            </div>
            <p className="text-sm sm:text-xl font-black font-mono tabular-nums text-rose-600 dark:text-rose-400 truncate">
              -₹{totalOutflow.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">Debits & expenses</span>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-950/40 dark:via-blue-950/20 dark:to-transparent border border-blue-500/20 shadow-2xs relative overflow-hidden group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Surplus</span>
              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded-md">
                {netSurplus >= 0 ? 'Safe' : 'Deficit'}
              </span>
            </div>
            <p className={`text-sm sm:text-xl font-black font-mono tabular-nums truncate ${netSurplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
              ₹{netSurplus.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">Free balance</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-[#0c1220]/90 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-inner overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-white dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 shadow-xs border border-slate-200/60 dark:border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'expense'
                  ? 'bg-white dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 shadow-xs border border-slate-200/60 dark:border-rose-500/30'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Expenses ({expenseCount})
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'income'
                  ? 'bg-white dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200/60 dark:border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Income ({incomeCount})
            </button>
            {investmentCount > 0 && (
              <button
                onClick={() => setFilterType('investment')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'investment'
                    ? 'bg-white dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/60 dark:border-blue-500/30'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Investments ({investmentCount})
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              placeholder="Search title, category, account..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Transactions List Container */}
        <div className="fintech-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xs">
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
                    <Plus className="w-4 h-4" />
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
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 sm:p-4.5 flex items-center justify-between hover:bg-slate-500/[0.04] dark:hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${
                      tx.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
                        : tx.type === 'investment'
                        ? 'bg-blue-500/10 text-blue-500 border border-blue-500/25'
                        : 'bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10'
                    }`}>
                      {getCategoryIcon(tx.category, tx.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                          {tx.title}
                        </h4>
                        {tx.type === 'investment' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            SIP/INV
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                        <span className="font-mono text-slate-500 dark:text-slate-400">{tx.date}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/10 rounded-md font-mono text-[9px] font-medium text-slate-600 dark:text-slate-300 truncate">
                          {tx.account_name || 'UPI / Cash'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className={`text-xs sm:text-base font-black font-mono tabular-nums block ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : tx.type === 'investment'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">{tx.category || tx.type}</p>
                    </div>

                    {/* Row Action Buttons: Edit & Delete */}
                    <div className="flex items-center gap-0.5 sm:gap-1 opacity-70 group-hover:opacity-100 transition-opacity pl-2 border-l border-slate-100 dark:border-white/[0.06]">
                      <button
                        onClick={() => handleOpenEdit(tx)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                        title="Edit Transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (FAB) for Quick Add - positioned above mobile bottom nav bar without overlapping */}
      <div className="fixed bottom-24 right-5 sm:right-8 z-30 pointer-events-auto">
        <button
          onClick={() => onOpenAddModal('expense')}
          className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-slate-950 font-bold shadow-[0_12px_28px_-4px_rgba(16,185,129,0.55)] border border-emerald-300/40 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all group"
          aria-label="Add Transaction"
          title="Add Transaction"
        >
          <Plus className="w-6 h-6 text-slate-950 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* Edit Transaction Bottom Sheet Drawer */}
      <BottomSheetDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        title="Edit Transaction"
        subtitle="Update title, amount, category, or payment source"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Transaction Title
            </label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                required
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value as TransactionType)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="expense">Expense (Debit -)</option>
                <option value="income">Income (Credit +)</option>
                <option value="investment">Investment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="dining">Dining & Food</option>
                <option value="groceries">Groceries</option>
                <option value="housing">Housing / Rent</option>
                <option value="utilities">Bills & Utilities</option>
                <option value="shopping">Shopping</option>
                <option value="travel">Transport & Travel</option>
                <option value="healthcare">Healthcare</option>
                <option value="entertainment">Entertainment</option>
                <option value="subscriptions">Subscriptions</option>
                <option value="salary">Salary</option>
                <option value="freelance">Freelance</option>
                <option value="investments">Investments</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account / Payment Source
              </label>
              <input
                type="text"
                placeholder="UPI / HDFC Bank"
                value={editAccount}
                onChange={(e) => setEditAccount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <input
              type="text"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </BottomSheetDrawer>
    </div>
  );
};
