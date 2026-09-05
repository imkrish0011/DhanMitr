'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { EditRecordModal, EditableItem } from '@/components/finance/Modals/EditRecordModal';
import {
  Wallet,
  ArrowDownRight,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  PieChart,
  Sparkles,
  Briefcase,
  Laptop,
  Building,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Utensils,
  Home,
  ShoppingCart,
  Zap,
  Car,
  HeartPulse,
  Scale,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface BudgetIncomeTabProps {
  onOpenAddModal: (type?: any) => void;
}

export const BudgetIncomeTab: React.FC<BudgetIncomeTabProps> = ({ onOpenAddModal }) => {
  const {
    incomeSources,
    budgetItems,
    totalIncome,
    totalOutflow,
    netSurplus,
    savingsRate,
    deleteIncomeSource,
    deleteBudgetItem,
  } = useFinance();

  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const annualSurplus = Math.max(0, netSurplus * 12);
  const totalBudgetAllocated = budgetItems.reduce((sum, b) => sum + (b.allocated || 0), 0);
  const totalBudgetSpent = budgetItems.reduce((sum, b) => sum + (b.spent || 0), 0);

  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('food') || c.includes('dine') || c.includes('grocer'))
      return <Utensils className="w-4 h-4 text-amber-500" />;
    if (c.includes('house') || c.includes('rent') || c.includes('home'))
      return <Home className="w-4 h-4 text-blue-500" />;
    if (c.includes('shop') || c.includes('cloth') || c.includes('e-comm'))
      return <ShoppingCart className="w-4 h-4 text-purple-500" />;
    if (c.includes('util') || c.includes('bill') || c.includes('elect'))
      return <Zap className="w-4 h-4 text-yellow-500" />;
    if (c.includes('travel') || c.includes('fuel') || c.includes('transport'))
      return <Car className="w-4 h-4 text-indigo-500" />;
    if (c.includes('health') || c.includes('med') || c.includes('insur'))
      return <HeartPulse className="w-4 h-4 text-rose-500" />;
    return <PieChart className="w-4 h-4 text-emerald-500" />;
  };

  const getIncomeIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('salary') || t.includes('job') || t.includes('corp'))
      return <Briefcase className="w-4 h-4 text-blue-500" />;
    if (t.includes('free') || t.includes('client') || t.includes('consult'))
      return <Laptop className="w-4 h-4 text-purple-500" />;
    if (t.includes('rent') || t.includes('property') || t.includes('asset'))
      return <Building className="w-4 h-4 text-amber-500" />;
    return <Coins className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="space-y-6 pb-2">
      {/* Executive Cash Flow Matrix & Telemetry Hero */}
      <div className="fintech-card fintech-card-hover rounded-2xl sm:rounded-3xl text-slate-900 dark:text-white p-6 sm:p-8 relative overflow-hidden space-y-6 group">
        {/* Top Glow Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] sm:text-xs font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                Monthly Cash Flow Matrix
              </span>
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-mono tabular-nums">
                {formatCurrency(netSurplus)}
              </h2>
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                Net Monthly Surplus
              </span>
            </div>
          </div>

          {/* Action & Rate Cluster */}
          <div className="flex items-center gap-3 self-start lg:self-auto">
            <div className="px-5 py-2.5 rounded-2xl bg-slate-500/[0.04] dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 text-center shrink-0">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
                Savings Ratio
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
                {savingsRate}%
              </span>
            </div>

            <button
              onClick={() => onOpenAddModal('income')}
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-950/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Income Stream</span>
            </button>
          </div>
        </div>

        {/* 3-Column Responsive Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-500/[0.03] dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] relative z-10">
          {/* Inflow Card */}
          <div className="flex items-center gap-3.5 p-2 rounded-xl">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0 shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 block truncate">
                  Total Monthly Inflow
                </span>
                <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {incomeSources.length} Streams
                </span>
              </div>
              <span className="text-lg sm:text-xl font-black font-mono tabular-nums text-slate-900 dark:text-white truncate block mt-0.5">
                {formatCurrency(totalIncome)}
              </span>
            </div>
          </div>

          {/* Outflow Card */}
          <div className="flex items-center gap-3.5 p-2 rounded-xl border-t sm:border-t-0 sm:border-l border-slate-200/80 dark:border-white/[0.06] sm:pl-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500 shrink-0 shadow-xs">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 block truncate">
                  Planned Monthly Outflow
                </span>
                <span className="text-[10px] font-mono font-semibold text-rose-600 dark:text-rose-400">
                  Living + Caps
                </span>
              </div>
              <span className="text-lg sm:text-xl font-black font-mono tabular-nums text-slate-900 dark:text-white truncate block mt-0.5">
                {formatCurrency(totalOutflow)}
              </span>
            </div>
          </div>

          {/* Annualized Compounding Runway */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex items-center gap-3.5 p-2 rounded-xl border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/[0.06] lg:pl-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-500 shrink-0 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 block truncate">
                  Annual Wealth Potential
                </span>
                <span className="text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                  Compounding / yr
                </span>
              </div>
              <span className="text-lg sm:text-xl font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400 truncate block mt-0.5">
                {formatCurrency(annualSurplus)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Desktop Grid for Incomes & Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ===================== LEFT: INCOME STREAMS ===================== */}
        <div className="lg:col-span-5 fintech-card rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Income Streams
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400">
                  {incomeSources.length} registered earning channels
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenAddModal('income')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-500/25"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stream</span>
            </button>
          </div>

          <div className="space-y-3">
            {incomeSources.length === 0 ? (
              <div className="p-8 text-center bg-slate-500/[0.02] dark:bg-white/[0.02] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    No Income Sources Added
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto mt-1">
                    Log your salary, freelance client payments, or dividends to track your cash inflows.
                  </p>
                </div>
                <button
                  onClick={() => onOpenAddModal('income')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Inflow</span>
                </button>
              </div>
            ) : (
              incomeSources.map((inc) => {
                const percentOfTotal = totalIncome > 0 ? Math.round((inc.amount / totalIncome) * 100) : 100;

                return (
                  <div
                    key={inc.id}
                    className="p-4 bg-slate-500/[0.04] dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl flex items-center justify-between hover:border-emerald-500/50 hover:bg-slate-500/[0.06] dark:hover:bg-white/[0.05] transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        {getIncomeIcon(inc.title)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {inc.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-slate-400" />
                            {inc.date || 'Monthly'}
                          </span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                            {percentOfTotal}% of total
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-xs sm:text-sm font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(inc.amount)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingItem({ type: 'income', data: inc })}
                          className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteIncomeSource(inc.id)}
                          className="w-7 h-7 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/60 text-slate-400 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ===================== RIGHT: CATEGORY BUDGET CAPS ===================== */}
        <div className="lg:col-span-7 fintech-card rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Category Budgets & Expense Caps
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400">
                  {budgetItems.length} active spending caps
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenAddModal('budget_cap')}
              className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-blue-500/25"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Set Cap</span>
            </button>
          </div>

          <div className="space-y-3">
            {budgetItems.length === 0 ? (
              <div className="p-8 text-center bg-slate-500/[0.02] dark:bg-white/[0.02] rounded-2xl border border-slate-200/60 dark:border-white/[0.06] space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center mx-auto">
                  <PieChart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    No Category Budgets Set
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto mt-1">
                    Set spend thresholds on Housing, Dining, Shopping, and Utilities to avoid overshooting.
                  </p>
                </div>
                <button
                  onClick={() => onOpenAddModal('budget_cap')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Set Spend Cap</span>
                </button>
              </div>
            ) : (
              budgetItems.map((item) => {
                const percentUsed = Math.min(100, Math.round((item.spent / (item.allocated || 1)) * 100));
                const isExceeded = item.spent > item.allocated;
                const remaining = Math.max(0, (item.allocated || 0) - (item.spent || 0));

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-500/[0.04] dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl space-y-2.5 hover:border-blue-500/50 hover:bg-slate-500/[0.06] dark:hover:bg-white/[0.05] transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0 shadow-2xs">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm truncate block">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate font-mono">
                            {isExceeded ? '⚠️ Cap exceeded' : `₹${remaining.toLocaleString('en-IN')} headroom`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right font-mono">
                          <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm block tabular-nums">
                            {formatCurrency(item.spent)}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 text-[10px] block tabular-nums">
                            of {formatCurrency(item.allocated)}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-lg border ${
                            isExceeded
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                              : percentUsed > 80
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {percentUsed}%
                        </span>

                        <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-white/10">
                          <button
                            onClick={() => setEditingItem({ type: 'budget', data: item })}
                            className="w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="Edit Cap"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteBudgetItem(item.id)}
                            className="w-7 h-7 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete Cap"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExceeded
                            ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                            : percentUsed > 80
                            ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                            : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                        }`}
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit Record Modal Trigger */}
      {editingItem && (
        <EditRecordModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          item={editingItem}
        />
      )}
    </div>
  );
};
