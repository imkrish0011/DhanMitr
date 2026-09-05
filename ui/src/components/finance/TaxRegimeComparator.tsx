'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import {
  Scale,
  Sparkles,
  HelpCircle,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export const TaxRegimeComparator: React.FC = () => {
  const { totalIncome, profile } = useFinance();

  // Annual Gross Income calculated from user's actual salary records
  const defaultAnnual = totalIncome > 0
    ? totalIncome * 12
    : (profile.monthly_income > 0 ? profile.monthly_income * 12 : 0);
  const [grossIncome, setGrossIncome] = useState<number>(defaultAnnual);

  // Automatically sync gross income when user salary records load from Supabase
  useEffect(() => {
    if (defaultAnnual > 0 && grossIncome === 0) {
      setGrossIncome(defaultAnnual);
    }
  }, [defaultAnnual, grossIncome]);

  // Deductions for Old Regime (Starts clean at 0)
  const [sec80C, setSec80C] = useState<number>(0);
  const [sec80D, setSec80D] = useState<number>(0);
  const [hraExemption, setHraExemption] = useState<number>(0);
  const [homeLoanInterest, setHomeLoanInterest] = useState<number>(0);
  const [nps80CCD, setNps80CCD] = useState<number>(0);

  // 1. Calculate Tax under New Regime (FY 2024-25 / 2025-26)
  // Slabs: 0-3L: 0%, 3-7L: 5%, 7-10L: 10%, 10-12L: 15%, 12-15L: 20%, >15L: 30%
  // Standard Deduction = ₹75,000
  // Rebate u/s 87A: Up to ₹7,00,000 taxable income -> Tax = 0
  const newRegimeCalc = useMemo(() => {
    const stdDeduction = 75000;
    const taxableIncome = Math.max(0, grossIncome - stdDeduction);

    let tax = 0;
    if (taxableIncome <= 300000) {
      tax = 0;
    } else if (taxableIncome <= 700000) {
      tax = (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax = 400000 * 0.05 + (taxableIncome - 700000) * 0.10;
    } else if (taxableIncome <= 1200000) {
      tax = 400000 * 0.05 + 300000 * 0.10 + (taxableIncome - 1000000) * 0.15;
    } else if (taxableIncome <= 1500000) {
      tax = 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + (taxableIncome - 1200000) * 0.20;
    } else {
      tax = 400000 * 0.05 + 300000 * 0.10 + 200000 * 0.15 + 300000 * 0.20 + (taxableIncome - 1500000) * 0.30;
    }

    // 87A rebate for New Regime (taxable income <= 7,00,000 -> 0 tax)
    if (taxableIncome <= 700000) {
      tax = 0;
    }

    const cess = tax * 0.04;
    const totalTax = tax + cess;

    return {
      stdDeduction,
      totalDeductions: stdDeduction,
      taxableIncome,
      baseTax: tax,
      cess,
      totalTax: Math.round(totalTax),
    };
  }, [grossIncome]);

  // 2. Calculate Tax under Old Regime
  // Slabs: 0-2.5L: 0%, 2.5-5L: 5%, 5-10L: 20%, >10L: 30%
  // Standard Deduction = ₹50,000
  // Rebate u/s 87A: Up to ₹5,00,000 taxable income -> Tax = 0
  const oldRegimeCalc = useMemo(() => {
    const stdDeduction = 50000;
    const totalDeductions =
      stdDeduction +
      Math.min(150000, sec80C) +
      Math.min(75000, sec80D) +
      hraExemption +
      Math.min(200000, homeLoanInterest) +
      Math.min(50000, nps80CCD);

    const taxableIncome = Math.max(0, grossIncome - totalDeductions);

    let tax = 0;
    if (taxableIncome <= 250000) {
      tax = 0;
    } else if (taxableIncome <= 500000) {
      tax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax = 250000 * 0.05 + (taxableIncome - 500000) * 0.20;
    } else {
      tax = 250000 * 0.05 + 500000 * 0.20 + (taxableIncome - 1000000) * 0.30;
    }

    // 87A rebate for Old Regime (taxable income <= 5,00,000 -> 0 tax)
    if (taxableIncome <= 500000) {
      tax = 0;
    }

    const cess = tax * 0.04;
    const totalTax = tax + cess;

    return {
      stdDeduction,
      totalDeductions,
      taxableIncome,
      baseTax: tax,
      cess,
      totalTax: Math.round(totalTax),
    };
  }, [grossIncome, sec80C, sec80D, hraExemption, homeLoanInterest, nps80CCD]);

  const savings = Math.abs(newRegimeCalc.totalTax - oldRegimeCalc.totalTax);
  const isNewBetter = newRegimeCalc.totalTax <= oldRegimeCalc.totalTax;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="fintech-card fintech-card-hover rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-2 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Old vs. New Tax Regime Comparator
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                FY 2024-25 / FY 2025-26 Indian Income Tax Simulator & Recommendation Engine
              </p>
            </div>
          </div>

          <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 rounded-full text-xs font-mono font-bold tracking-wide">
            FY 2025-26 UPDATED
          </span>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div
        className={`p-5 rounded-2xl sm:rounded-3xl border flex items-center justify-between flex-wrap gap-4 relative overflow-hidden backdrop-blur-xl ${
          isNewBetter
            ? 'bg-emerald-500/[0.08] dark:bg-emerald-950/40 border-emerald-500/40 text-slate-900 dark:text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.12)]'
            : 'bg-blue-500/[0.08] dark:bg-blue-950/40 border-blue-500/40 text-slate-900 dark:text-blue-100 shadow-[0_0_25px_rgba(59,130,246,0.12)]'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl shadow-xs flex items-center justify-center shrink-0 ${
            isNewBetter ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold">
              {isNewBetter ? 'New Tax Regime is more beneficial' : 'Old Tax Regime is more beneficial'}
            </h3>
            <p className="text-xs opacity-80 mt-0.5 max-w-xl font-medium">
              {isNewBetter
                ? `You save ₹${savings.toLocaleString('en-IN')} in tax with the simplified New Tax Regime.`
                : `Your high deductions (80C/80D/HRA) save you ₹${savings.toLocaleString('en-IN')} in the Old Regime.`}
            </p>
          </div>
        </div>

        <div className="text-right pl-4">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider opacity-70 block">
            Annual Tax Savings
          </span>
          <p className="text-2xl font-black font-mono tabular-nums leading-none mt-1">
            ₹{savings.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Column */}
        <div className="lg:col-span-5 fintech-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 text-xs">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            Your Income & Deductions
          </h3>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Gross Annual Salary / Income (₹)
            </label>
            <input
              type="number"
              value={grossIncome}
              onChange={(e) => setGrossIncome(Number(e.target.value) || 0)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 dark:text-white">Old Regime Deductions:</span>
              <span className="text-[10px] text-slate-400">(Not allowed in New Regime)</span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">
                  Section 80C (PPF, ELSS, EPF, LIC)
                </label>
                <span className="text-[10px] text-slate-400">Max ₹1.5L</span>
              </div>
              <input
                type="number"
                value={sec80C}
                onChange={(e) => setSec80C(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">
                  Section 80D (Health Insurance Premium)
                </label>
                <span className="text-[10px] text-slate-400">Max ₹25k-75k</span>
              </div>
              <input
                type="number"
                value={sec80D}
                onChange={(e) => setSec80D(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">
                  HRA (House Rent Allowance Exemption)
                </label>
              </div>
              <input
                type="number"
                value={hraExemption}
                onChange={(e) => setHraExemption(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="font-semibold text-slate-600 dark:text-slate-400">
                  Section 24 (Home Loan Interest)
                </label>
                <span className="text-[10px] text-slate-400">Max ₹2L</span>
              </div>
              <input
                type="number"
                value={homeLoanInterest}
                onChange={(e) => setHomeLoanInterest(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Right Side-by-Side Comparison Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* New Regime Card */}
          <div
            className={`fintech-card fintech-card-hover rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 relative overflow-hidden ${
              isNewBetter
                ? 'border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                : 'opacity-85'
            }`}
          >
            {isNewBetter && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
            )}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  New Tax Regime
                </h4>
                {isNewBetter && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Recommended ⭐
                  </span>
                )}
              </div>

              <div className="space-y-2.5 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Income:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">₹{grossIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Standard Deduction:</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">-₹{newRegimeCalc.stdDeduction.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Taxable Income:</span>
                  <span className="font-extrabold font-mono text-slate-900 dark:text-white">₹{newRegimeCalc.taxableIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Income Tax:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">₹{newRegimeCalc.baseTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cess (4%):</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">₹{newRegimeCalc.cess.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-500/[0.04] dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] text-center">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Total Tax Payable</span>
              <p className="text-2xl font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{newRegimeCalc.totalTax.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Old Regime Card */}
          <div
            className={`fintech-card fintech-card-hover rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between space-y-4 relative overflow-hidden ${
              !isNewBetter
                ? 'border-blue-500/60 ring-2 ring-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                : 'opacity-85'
            }`}
          >
            {!isNewBetter && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
            )}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Old Tax Regime
                </h4>
                {!isNewBetter && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    Recommended ⭐
                  </span>
                )}
              </div>

              <div className="space-y-2.5 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Income:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">₹{grossIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Deductions:</span>
                  <span className="font-bold font-mono text-blue-600 dark:text-blue-400">-₹{oldRegimeCalc.totalDeductions.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Taxable Income:</span>
                  <span className="font-extrabold font-mono text-slate-900 dark:text-white">₹{oldRegimeCalc.taxableIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Income Tax:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">₹{oldRegimeCalc.baseTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cess (4%):</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">₹{oldRegimeCalc.cess.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-500/[0.04] dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] text-center">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Total Tax Payable</span>
              <p className="text-2xl font-black font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-1">
                ₹{oldRegimeCalc.totalTax.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
