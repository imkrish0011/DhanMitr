'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useFinance } from '@/context/FinanceContext';

export const SpendingOverviewChart: React.FC = () => {
  const { spendingCategories, totalOutflow } = useFinance();
  const [timeframe, setTimeframe] = useState<'This Month' | 'Last Month' | 'This Quarter'>('This Month');
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeCategories = totalOutflow > 0
    ? spendingCategories.filter((c) => c.amount > 0)
    : [{ id: 'empty', category: 'No Expenses', amount: 1, color: '#334155', percentage: 100, categoryKey: 'other' }];

  return (
    <div className="fintech-card fintech-card-hover rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Spending Overview
        </h2>

        {/* Timeframe Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <span>{timeframe}</span>
            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-30">
              {(['This Month', 'Last Month', 'This Quarter'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => {
                    setTimeframe(tf);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs ${
                    timeframe === tf
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart and Legend Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Donut Chart with Center Text */}
        <div className="md:col-span-6 relative flex items-center justify-center min-w-0 min-h-[220px]">
          {isMounted && (
            <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={220}>
            <PieChart>
              <Pie
                data={activeCategories}
                cx="50%"
                cy="50%"
                innerRadius={64}
                outerRadius={90}
                paddingAngle={totalOutflow > 0 ? 3 : 0}
                dataKey="amount"
                onMouseEnter={(_, index) => totalOutflow > 0 && setHoveredCategory(activeCategories[index]?.id || null)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {activeCategories.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.color}
                    stroke="transparent"
                    className="transition-all duration-200"
                    opacity={hoveredCategory ? (hoveredCategory === entry.id ? 1 : 0.4) : (totalOutflow > 0 ? 1 : 0.3)}
                  />
                ))}
              </Pie>
              {totalOutflow > 0 && (
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value || 0).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                  }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
          )}

          {/* Centered Total Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ₹{totalOutflow.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Total Spent
            </span>
          </div>
        </div>

        {/* Legend with interactive hover highlight */}
        <div className="md:col-span-6 space-y-2.5">
          {spendingCategories.map((cat) => {
            const isHovered = hoveredCategory === cat.id;
            return (
              <div
                key={cat.id}
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`flex items-center justify-between text-xs p-1 rounded-lg transition-all cursor-pointer ${
                  isHovered ? 'bg-emerald-50 dark:bg-emerald-950/50' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {cat.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    ₹{cat.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 w-10 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
