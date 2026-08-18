'use client';

import React, { useState, useMemo } from 'react';
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
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Old vs. New Tax Regime Comparator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                FY 2024-25 / FY 2025-26 Indian Income Tax Simulator & Recommendation
              </p>
            </div>
          </div>

          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/20">
            FY 2025-26 Updated
          </span>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex items-center justify-between flex-wrap gap-3 ${
          isNewBetter
            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
            : 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 shadow-xs flex items-center justify-center shrink-0">
            <CheckCircle2 className={`w-5 h-5 ${isNewBetter ? 'text-emerald-500' : 'text-blue-500'}`} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold">
              {isNewBetter ? '🎉 New Tax Regime is more beneficial!' : '🎉 Old Tax Regime is more beneficial!'}
            </h3>
            <p className="text-xs opacity-80 mt-0.5">
              {isNewBetter
                ? `You save ₹${savings.toLocaleString('en-IN')} in tax with the simplified New Tax Regime.`
                : `Your high deductions (80C/80D/HRA) save you ₹${savings.toLocaleString('en-IN')} in the Old Regime.`}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Annual Tax Savings</span>
          <p className="text-lg font-black leading-none mt-0.5">
            ₹{savings.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Column */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4 text-xs">
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
            className={`p-5 rounded-2xl sm:rounded-3xl border flex flex-col justify-between space-y-4 shadow-2xs ${
              isNewBetter
                ? 'bg-white dark:bg-[#0F172A] border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-slate-50 dark:bg-[#0B101D] border-slate-200 dark:border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  New Tax Regime
                </h4>
                {isNewBetter && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Recommended ⭐
                  </span>
                )}
              </div>

              <div className="space-y-2.5 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Income:</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{grossIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Standard Deduction:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">-₹{newRegimeCalc.stdDeduction.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Taxable Income:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">₹{newRegimeCalc.taxableIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Income Tax:</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{newRegimeCalc.baseTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cess (4%):</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{newRegimeCalc.cess.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl neumorph-inset-deep text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Tax Payable</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                ₹{newRegimeCalc.totalTax.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Old Regime Card */}
          <div
            className={`p-5 rounded-2xl sm:rounded-3xl border flex flex-col justify-between space-y-4 shadow-2xs ${
              !isNewBetter
                ? 'bg-white dark:bg-[#0F172A] border-blue-500 ring-2 ring-blue-500/20'
                : 'bg-slate-50 dark:bg-[#0B101D] border-slate-200 dark:border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Old Tax Regime
                </h4>
                {!isNewBetter && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Recommended ⭐
                  </span>
                )}
              </div>

              <div className="space-y-2.5 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Income:</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{grossIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Deductions:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">-₹{oldRegimeCalc.totalDeductions.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Taxable Income:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">₹{oldRegimeCalc.taxableIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Income Tax:</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{oldRegimeCalc.baseTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cess (4%):</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{oldRegimeCalc.cess.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl neumorph-inset-deep text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Tax Payable</span>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                ₹{oldRegimeCalc.totalTax.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
