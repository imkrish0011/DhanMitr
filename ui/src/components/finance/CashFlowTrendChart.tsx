'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useFinance } from '@/context/FinanceContext';

export const CashFlowTrendChart: React.FC = () => {
  const { cashFlowTrend, netSurplus } = useFinance();
  const [period, setPeriod] = useState<'This 6 Months' | 'This Year' | 'Past 3 Months'>('This 6 Months');
  const [showDropdown, setShowDropdown] = useState(false);

  const formatYAxis = (val: number) => {
    if (val === 0) return '₹0';
    return `₹${val / 1000}K`;
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs hover:shadow-sm hover:border-emerald-500/20 transition-all duration-300 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Cash Flow Trend
        </h2>

        {/* Period Selector */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <span>{period}</span>
            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-30">
              {(['This 6 Months', 'Past 3 Months', 'This Year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs ${
                    period === p
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend & Surplus Callout Tag */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 rounded-full" />
            <span className="text-slate-600 dark:text-slate-300">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400 dark:border-slate-500" />
            <span className="text-slate-500 dark:text-slate-400">Expense</span>
          </div>
        </div>

        <div className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-md text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
          ₹{netSurplus.toLocaleString('en-IN')} Surplus
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={cashFlowTrend} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#10B981" stopOpacity={0.22} />
                <stop stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={formatYAxis}
              domain={[0, 80000]}
              ticks={[0, 20000, 40000, 60000, 80000]}
            />
            <Tooltip
              formatter={(value: any, name: any) => [
                `₹${Number(value || 0).toLocaleString('en-IN')}`,
                name === 'income' ? 'Income' : 'Expense',
              ]}
              contentStyle={{
                backgroundColor: '#0F172A',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#10B981"
              strokeWidth={2.5}
              fill="url(#incomeAreaGrad)"
              activeDot={{ r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#94A3B8"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 4, fill: '#94A3B8' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
