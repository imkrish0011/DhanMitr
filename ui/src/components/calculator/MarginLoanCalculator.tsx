'use client';

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Download,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface MarginLoanCalculatorProps {
  onProjectCostChange?: (cost: number) => void;
  initialProjectCost?: number;
}

export const MarginLoanCalculator: React.FC<MarginLoanCalculatorProps> = ({
  onProjectCostChange,
  initialProjectCost = 500000,
}) => {
  // Single synced state: project cost
  const [projectCost, setProjectCost] = useState<number>(initialProjectCost);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // Exact formulas:
  // Margin = Project Cost * 0.10 (10%)
  // Loan = Project Cost * 0.90 (90%)
  // Project Cost = Margin / 0.10
  // Official Micro Finance tier cap: Maximum loan is ₹1.25 Lakh (₹125,000)
  const isMicro = projectCost <= 140000;
  const rawLoanAmount = Math.round(projectCost * 0.9);
  const loanAmount = isMicro ? Math.min(125000, rawLoanAmount) : rawLoanAmount;
  const marginMoney = projectCost - loanAmount;

  // Update parent when project cost changes
  React.useEffect(() => {
    onProjectCostChange?.(projectCost);
  }, [projectCost, onProjectCostChange]);

  // Exact Tiered Threshold Scheme Router:
  // <= 1.40L -> Micro Finance (6.5%, 3 yrs, 3 mo moratorium, Max loan cap: ₹1.25L)
  // 1.40L to 50L -> Term Loan (8%, 7 yrs, 6 mo moratorium)
  // > 50L -> Commercial MSME (9.5%, 8 yrs, 6 mo moratorium)
  const scheme = useMemo(() => {
    if (projectCost <= 140000) {
      return {
        name: 'Micro Finance Scheme',
        badge: 'Priority Micro Credit (Max ₹1.25L)',
        rate: 6.5,
        years: 3,
        moratoriumMonths: 3,
        maxLoanCap: 125000,
        note: 'Designed for small village ventures & retail shops. Zero collateral needed. Official loan cap of ₹1.25 Lakh.',
      };
    } else if (projectCost <= 5000000) {
      return {
        name: 'MSME Term Loan Scheme',
        badge: 'CGTMSE Project Loan',
        rate: 8.0,
        years: 7,
        moratoriumMonths: 6,
        maxLoanCap: null,
        note: 'Ideal for machinery, sheds & commercial setups. 6 months grace period.',
      };
    } else {
      return {
        name: 'Commercial MSME Loan',
        badge: 'Enterprise Tier',
        rate: 9.5,
        years: 8,
        moratoriumMonths: 6,
        maxLoanCap: null,
        note: 'For larger industrial and processing setups with customized banking terms.',
      };
    }
  }, [projectCost]);

  // Quarterly EMI & Moratorium Math:
  const schedule = useMemo(() => {
    if (loanAmount <= 0) return { quarterlyEmi: 0, interestOnly: 0, rows: [] };

    const totalQuarters = scheme.years * 4;
    const moratoriumQuarters = Math.round(scheme.moratoriumMonths / 3);
    const repaymentQuarters = totalQuarters - moratoriumQuarters;
    const quarterlyRate = (scheme.rate / 100) / 4;

    // Grace period simple interest per quarter
    const interestOnly = Math.round(loanAmount * quarterlyRate);

    // Quarterly reducing EMI formula
    const factor = Math.pow(1 + quarterlyRate, repaymentQuarters);
    const quarterlyEmi = Math.round(
      loanAmount * ((quarterlyRate * factor) / (factor - 1))
    );

    // Schedule generation
    let balance = loanAmount;
    const rows = [];

    for (let q = 1; q <= totalQuarters; q++) {
      const isGrace = q <= moratoriumQuarters;
      const intPay = Math.round(balance * quarterlyRate);
      let prinPay = 0;
      let totalPay = 0;

      if (isGrace) {
        prinPay = 0;
        totalPay = intPay;
      } else {
        prinPay = Math.min(balance, quarterlyEmi - intPay);
        totalPay = quarterlyEmi;
        balance = Math.max(0, balance - prinPay);
      }

      rows.push({
        quarter: q,
        year: Math.ceil(q / 4),
        isGrace,
        principal: prinPay,
        interest: intPay,
        total: totalPay,
        balance: Math.max(0, balance),
      });
    }

    return { quarterlyEmi, interestOnly, rows };
  }, [loanAmount, scheme]);

  // CSV Export
  const downloadCSV = () => {
    if (!schedule.rows.length) return;
    const csvContent =
      'data:text/csv;charset=utf-8,Quarter,Period,Status,Principal (INR),Interest (INR),Total Payment (INR),Remaining Balance (INR)\n' +
      schedule.rows
        .map(
          (r) =>
            `Q${r.quarter},Year ${r.year} Q${((r.quarter - 1) % 4) + 1},${
              r.isGrace ? 'Grace Period (Moratorium)' : 'Regular EMI'
            },${r.principal},${r.interest},${r.total},${r.balance}`
        )
        .join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Repayment_Schedule_${loanAmount}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* 1. Main Interactive Card */}
      <div className="fintech-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200/70 dark:border-white/5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
              10% Margin Money & 90% Loan Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Enter your project budget to calculate your down payment, bank loan, and quarterly repayments.
            </p>
          </div>

          <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {scheme.badge}
          </span>
        </div>

        {/* Inputs & Quick Presets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Input A: Total Project Cost */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Total Project Cost (100%)</span>
              <span className="text-emerald-500 font-mono text-sm">
                ₹{projectCost.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="25000"
                min="50000"
                value={projectCost}
                onChange={(e) => setProjectCost(Math.max(50000, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-base"
              />
            </div>
            <input
              type="range"
              min="50000"
              max="5000000"
              step="25000"
              value={projectCost}
              onChange={(e) => setProjectCost(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />
          </div>

          {/* Input B: Your Margin Money (10%) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Your Down Payment / Margin (10%)</span>
              <span className="text-teal-500 font-mono text-sm">
                ₹{marginMoney.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="5000"
                min="5000"
                value={marginMoney}
                onChange={(e) => {
                  const m = Math.max(5000, Number(e.target.value));
                  setProjectCost(Math.round(m / 0.1)); // Project Cost = Margin / 0.10
                }}
                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-base"
              />
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-mono">Quick Budgets:</span>
              {[100000, 140000, 500000, 1000000, 2500000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setProjectCost(val)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                    projectCost === val
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-500'
                      : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {val === 140000 ? '₹1.4L' : val >= 100000 ? `₹${val / 100000}L` : `₹${val / 1000}k`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Key Results Trio */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Card 1: Margin Money */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/80 dark:border-white/5 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 font-mono">
              Your {isMicro && rawLoanAmount > 125000 ? 'Promoter' : '10%'} Margin Money
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              ₹{marginMoney.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400">Promoter equity required by bank</p>
          </div>

          {/* Card 2: 90% Loan Amount */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[11px] uppercase font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {isMicro && rawLoanAmount > 125000 ? 'Bank Loan (Capped)' : '90% Bank Loan'}
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold">
                {scheme.rate}% p.a.
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              ₹{loanAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
              {scheme.name} ({scheme.years} Years)
              {isMicro && (
                <span className="block text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-mono mt-0.5">
                  Official Max Cap: ₹1.25 Lakh
                </span>
              )}
            </p>
          </div>

          {/* Card 3: Quarterly EMI */}
          <div className="p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[11px] uppercase font-bold text-blue-600 dark:text-blue-400 font-mono">
                Quarterly EMI
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">Every 3 Months</span>
            </div>
            <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
              ₹{schedule.quarterlyEmi.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-blue-500/80 dark:text-blue-400/80">
              ~₹{Math.round(schedule.quarterlyEmi / 3).toLocaleString('en-IN')} / month
            </p>
          </div>
        </div>

        {/* 3. Moratorium (Grace Period) Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {scheme.moratoriumMonths}-Month Moratorium (Grace Period) Included
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              During the first {scheme.moratoriumMonths} months, your principal repayment is ₹0. You only pay simple quarterly interest of ₹{schedule.interestOnly.toLocaleString('en-IN')} while setting up your business.
            </p>
          </div>

          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer shadow-sm shrink-0"
          >
            <span>{showSchedule ? 'Hide Schedule' : 'View Schedule'}</span>
            {showSchedule ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 4. Collapsible Schedule Table */}
        {showSchedule && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase text-slate-400">
                Quarterly Repayment Schedule ({scheme.years * 4} Quarters)
              </h3>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-1.5 text-xs font-mono text-emerald-500 hover:text-emerald-400 font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 dark:bg-[#070B14] border-b border-slate-200 dark:border-white/10 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Quarter</th>
                    <th className="py-2.5 px-3 font-bold">Status</th>
                    <th className="py-2.5 px-3 font-bold">Principal</th>
                    <th className="py-2.5 px-3 font-bold">Interest</th>
                    <th className="py-2.5 px-3 font-bold">Total Payment</th>
                    <th className="py-2.5 px-3 font-bold">Remaining Loan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {schedule.rows.map((row) => (
                    <tr
                      key={row.quarter}
                      className={
                        row.isGrace
                          ? 'bg-amber-500/5 text-amber-600 dark:text-amber-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }
                    >
                      <td className="py-2 px-3 font-bold">Q{row.quarter}</td>
                      <td className="py-2 px-3">
                        {row.isGrace ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 font-bold">
                            Grace Period (Moratorium)
                          </span>
                        ) : (
                          <span className="text-slate-400">Regular EMI</span>
                        )}
                      </td>
                      <td className="py-2 px-3">₹{row.principal.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3">₹{row.interest.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 font-bold">₹{row.total.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3">₹{row.balance.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
