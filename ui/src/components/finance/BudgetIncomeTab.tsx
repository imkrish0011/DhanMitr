'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { WalletIcon, TrendingUpIcon, ArrowDownOutflowIcon } from '@/components/icons/CustomIcons';
import { EditRecordModal, EditableItem } from '@/components/finance/Modals/EditRecordModal';

interface BudgetIncomeTabProps {
  onOpenAddModal: () => void;
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
  } = useFinance();

  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);

  return (
    <div className="space-y-6">
      {/* Top Banner: Income vs Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center">
              <WalletIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Monthly Inflows</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                ₹{totalIncome.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center">
              <ArrowDownOutflowIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Planned Monthly Outflow</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                ₹{totalOutflow.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center">
              <TrendingUpIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly Net Surplus</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{netSurplus.toLocaleString('en-IN')} ({savingsRate}%)
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Income Streams */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Income Streams
            </h3>
            <button
              onClick={onOpenAddModal}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              <span>+ Add Income</span>
            </button>
          </div>

          <div className="space-y-3">
            {incomeSources.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 space-y-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Income Sources Added</p>
                <p className="text-[11px] text-slate-400">Log your primary salary, freelance earnings, or secondary inflows.</p>
                <button
                  onClick={onOpenAddModal}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-block"
                >
                  + Add Income
                </button>
              </div>
            ) : (
              incomeSources.map((inc) => (
                <div
                  key={inc.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {inc.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Credit Date: {inc.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      +₹{inc.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => setEditingItem({ type: 'income', data: inc })}
                      className="text-slate-400 hover:text-emerald-600 text-xs p-1"
                      title="Edit Income"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => deleteIncomeSource(inc.id)}
                      className="text-slate-400 hover:text-red-500 text-xs"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Category Budget Allocations & Progress Bars */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Category Budgets
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Track how close you are to your monthly budget caps. Click edit to adjust caps.
              </p>
            </div>
            <button
              onClick={onOpenAddModal}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              + Add Budget
            </button>
          </div>

          <div className="space-y-4">
            {budgetItems.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 space-y-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Category Budgets Set</p>
                <p className="text-[11px] text-slate-400">Set monthly spend limits on housing, investments, food, or shopping.</p>
                <button
                  onClick={onOpenAddModal}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-block"
                >
                  + Add Budget Cap
                </button>
              </div>
            ) : (
              budgetItems.map((item) => {
                const percentUsed = Math.min(100, Math.round((item.spent / (item.allocated || 1)) * 100));
                const isExceeded = item.spent > item.allocated;

                return (
                  <div key={item.id} className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{item.spent.toLocaleString('en-IN')}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">
                          / ₹{item.allocated.toLocaleString('en-IN')}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isExceeded
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {percentUsed}%
                        </span>
                        <button
                          onClick={() => setEditingItem({ type: 'budget', data: item })}
                          className="text-slate-400 hover:text-emerald-600 text-xs ml-1"
                          title="Edit Budget Cap"
                        >
                          ✎
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percentUsed}%`,
                          backgroundColor: isExceeded ? '#EF4444' : item.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit Record Modal */}
      <EditRecordModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
      />
    </div>
  );
};
