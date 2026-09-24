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
  Building2,
  Coins,
  Sparkles,
  ArrowRight,
  Info,
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
        name: 'Mudra / Micro Finance Scheme',
        badge: 'Priority Micro Credit (Max ₹1.25L)',
        rate: 6.5,
        years: 3,
        moratoriumMonths: 3,
        maxLoanCap: 125000,
        note: 'Designed for small village ventures & retail shops. Zero collateral needed.',
      };
    } else if (projectCost <= 5000000) {
      return {
        name: 'CGTMSE Project Term Loan',
        badge: 'CGTMSE Collateral-Free',
        rate: 8.0,
        years: 7,
        moratoriumMonths: 6,
        maxLoanCap: null,
        note: 'Government-guaranteed term loan for machinery, sheds & commercial setups.',
      };
    } else {
      return {
        name: 'Commercial MSME Project Loan',
        badge: 'Enterprise Tier',
        rate: 9.5,
        years: 8,
        moratoriumMonths: 6,
        maxLoanCap: null,
        note: 'Customized banking terms for larger industrial and processing setups.',
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

  const quickPresets = [
    { label: '₹1 Lakh', val: 100000 },
    { label: '₹2 Lakh', val: 200000 },
    { label: '₹5 Lakh', val: 500000 },
    { label: '₹10 Lakh', val: 1000000 },
    { label: '₹25 Lakh', val: 2500000 },
    { label: '₹50 Lakh', val: 5000000 },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Main Project Loan Interactive Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs space-y-5">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                10% Margin & 90% Project Loan
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                PMEGP / Mudra
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter your enterprise capital to calculate your equity down payment and sanctioned bank loan.
            </p>
          </div>

          <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            {scheme.badge}
          </span>
        </div>

        {/* Project Cost Input & Slider */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/60 dark:border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Total Project Budget (100%)
            </span>
            <span className="text-lg sm:text-xl font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              ₹{projectCost.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Fluid Slider */}
          <input
            type="range"
            min="50000"
            max="5000000"
            step="25000"
            value={projectCost}
            onChange={(e) => setProjectCost(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />

          {/* Quick Preset Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {quickPresets.map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => setProjectCost(preset.val)}
                className={`py-1 px-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  projectCost === preset.val
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Key Results Trio (Promoter Margin, Bank Loan, EMI) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Margin Money (10%) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent border border-teal-500/20 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 font-mono">
                Your 10% Down Payment
              </span>
              <Coins className="w-3.5 h-3.5 text-teal-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
              ₹{marginMoney.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Promoter equity required by bank
            </p>
          </div>

          {/* Card 2: 90% Bank Loan */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                Sanctioned Bank Loan (90%)
              </span>
              <span className="text-[9px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                {scheme.rate}% p.a.
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              ₹{loanAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {scheme.name} • {scheme.years} Years
            </p>
          </div>

          {/* Card 3: Repayment EMI */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 font-mono">
                Estimated Monthly EMI
              </span>
              <span className="text-[9px] font-mono bg-blue-500/15 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded font-bold">
                Quarterly Cycle
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-blue-600 dark:text-blue-400">
              ~₹{Math.round(schedule.quarterlyEmi / 3).toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-400">/mo</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              ₹{schedule.quarterlyEmi.toLocaleString('en-IN')} paid quarterly
            </p>
          </div>
        </div>

        {/* 3. Moratorium (Grace Period) Benefit Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {scheme.moratoriumMonths}-Month Moratorium (Grace Period)
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                ₹0 Principal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              Pay ₹0 principal during the first {scheme.moratoriumMonths} months. You only pay simple quarterly interest of ₹{schedule.interestOnly.toLocaleString('en-IN')} while building your enterprise.
            </p>
          </div>

          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
          >
            <span>{showSchedule ? 'Hide Schedule' : 'View Schedule'}</span>
            {showSchedule ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* 4. Collapsible Schedule Table */}
        {showSchedule && (
          <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-400">
                Repayment Breakdown ({scheme.years * 4} Quarters)
              </h4>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-1.5 text-xs font-mono text-emerald-500 hover:text-emerald-400 font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-[#070B14] border-b border-slate-200 dark:border-white/10 text-slate-500">
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
                            Moratorium (Grace)
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

      {/* 5. Government Schemes Guide Card (Clear & Understandable) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
            Which Scheme Powers Your Loan?
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/60 dark:border-white/5 space-y-1">
            <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase font-mono block">
              Mudra Yojana (PMMY)
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Up to ₹10 Lakhs</p>
            <p className="text-[10px] text-slate-400">Zero collateral needed. Ideal for rural shops, service units & vendors.</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/60 dark:border-white/5 space-y-1">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono block">
              PMEGP Subsidy Scheme
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-white">15% – 35% Govt Subsidy</p>
            <p className="text-[10px] text-slate-400">Up to ₹50 Lakhs for manufacturing, with direct margin subsidy into your account.</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/60 dark:border-white/5 space-y-1">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase font-mono block">
              CGTMSE Guarantee
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Up to ₹5 Crores</p>
            <p className="text-[10px] text-slate-400">Bank loan backed up to 85% by Credit Guarantee Trust for Micro & Small Enterprises.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
