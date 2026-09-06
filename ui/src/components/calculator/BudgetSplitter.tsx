'use client';

import React, { useState, useMemo } from 'react';
import { Scale, CheckCircle, AlertTriangle, ShieldCheck, Heart, PiggyBank, Sparkles, Lightbulb, Rocket } from 'lucide-react';

export const BudgetSplitter: React.FC = () => {
  const [income, setIncome] = useState<number>(60000);
  const [needsPct, setNeedsPct] = useState<number>(50);
  const [wantsPct, setWantsPct] = useState<number>(30);
  const [savingsPct, setSavingsPct] = useState<number>(20);

  const presets = [25000, 40000, 60000, 80000, 100000, 150000, 200000];

  const resetToStandard = () => {
    setNeedsPct(50);
    setWantsPct(30);
    setSavingsPct(20);
  };

  const handleNeedsChange = (val: number) => {
    setNeedsPct(val);
    // automatically adjust wants/savings proportionally
    const remaining = 100 - val;
    const currentSubtotal = wantsPct + savingsPct || 1;
    const newWants = Math.round((wantsPct / currentSubtotal) * remaining);
    setWantsPct(newWants);
    setSavingsPct(remaining - newWants);
  };

  const calculations = useMemo(() => {
    const needsAmt = Math.round((income * needsPct) / 100);
    const wantsAmt = Math.round((income * wantsPct) / 100);
    const savingsAmt = Math.round((income * savingsPct) / 100);

    return {
      needsAmt,
      wantsAmt,
      savingsAmt,
    };
  }, [income, needsPct, wantsPct, savingsPct]);

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              50-30-20 Smart Budget Splitter
            </h4>
            <p className="text-slate-600 dark:text-slate-300">
              The golden rule of personal budgeting: 50% for Needs, 30% for Lifestyle & Wants, and 20% to build your future.
            </p>
          </div>
        </div>
        <button
          onClick={resetToStandard}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          Reset to 50 / 30 / 20
        </button>
      </div>

      {/* Main Income Input Card */}
      <div className="fintech-card p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
              Monthly In-Hand / Take-Home Income
            </label>
            <span className="text-[11px] text-slate-400">
              Your net salary deposited in the bank after PF & TDS deductions
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
            <input
              type="number"
              min={5000}
              max={2000000}
              step={1000}
              value={income}
              onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
              className="w-full sm:w-44 pl-8 pr-3 py-2 rounded-2xl text-right font-mono font-black text-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Quick Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-white/5">
          <span className="text-[10px] text-slate-400 mr-1 font-medium">Quick Select:</span>
          {presets.map((amt) => (
            <button
              key={amt}
              onClick={() => setIncome(amt)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                income === amt
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-2xs'
                  : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'
              }`}
            >
              ₹{amt >= 100000 ? `${amt / 100000} Lakh` : `${amt / 1000}k`}
            </button>
          ))}
        </div>

        {/* Visual Allocation Ribbon */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-emerald-600 dark:text-emerald-400">Needs: {needsPct}% ({formatINR(calculations.needsAmt)})</span>
            <span className="text-amber-500 dark:text-amber-400">Wants: {wantsPct}% ({formatINR(calculations.wantsAmt)})</span>
            <span className="text-sky-500 dark:text-sky-400">Savings: {savingsPct}% ({formatINR(calculations.savingsAmt)})</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${needsPct}%` }}
              className="h-full bg-emerald-500 transition-all duration-300"
              title={`Needs: ${needsPct}%`}
            />
            <div
              style={{ width: `${wantsPct}%` }}
              className="h-full bg-amber-500 transition-all duration-300"
              title={`Wants: ${wantsPct}%`}
            />
            <div
              style={{ width: `${savingsPct}%` }}
              className="h-full bg-sky-500 transition-all duration-300"
              title={`Savings: ${savingsPct}%`}
            />
          </div>
        </div>
      </div>

      {/* 3 Dedicated Interactive Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1: Needs (50%) */}
        <div className="fintech-card p-5 rounded-3xl space-y-4 border-t-4 border-t-emerald-500 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">50% Needs</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Essentials</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {needsPct}%
              </span>
            </div>

            <div className="pt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {formatINR(calculations.needsAmt)}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Maximum target budget per month
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">What fits here:</p>
              <ul className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  House Rent / Home Loan EMI
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Groceries, Milk & Vegetables
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Electricity, Water & WiFi bills
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Health & Term Insurance
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-2">
            <label className="text-[10px] text-slate-400 font-semibold block mb-1">Adjust Allocation:</label>
            <input
              type="range"
              min={40}
              max={70}
              step={1}
              value={needsPct}
              onChange={(e) => handleNeedsChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Pillar 2: Wants (30%) */}
        <div className="fintech-card p-5 rounded-3xl space-y-4 border-t-4 border-t-amber-500 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">30% Wants</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Lifestyle & Joy</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {wantsPct}%
              </span>
            </div>

            <div className="pt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {formatINR(calculations.wantsAmt)}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Guilt-free spending limit
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">What fits here:</p>
              <ul className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Dining Out, Swiggy / Zomato
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Netflix, Spotify & OTT subs
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Shopping, Gadgets & Clothing
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Weekend Outings & Vacations
                </li>
              </ul>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/5 text-amber-700 dark:text-amber-300 text-[11px] leading-snug flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              <em>Rule:</em> If your Needs exceed 50%, cut from Wants first, not from Savings!
            </span>
          </div>
        </div>

        {/* Pillar 3: Savings (20%) */}
        <div className="fintech-card p-5 rounded-3xl space-y-4 border-t-4 border-t-sky-500 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">20% Savings</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Future Freedom</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                {savingsPct}%
              </span>
            </div>

            <div className="pt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {formatINR(calculations.savingsAmt)}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Minimum monthly wealth generation
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">What fits here:</p>
              <ul className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  Emergency Fund (first 6 months)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  Mutual Fund Monthly SIP
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  PPF / NPS / Sovereign Gold
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  Extra loan principal prepayments
                </li>
              </ul>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 text-[11px] leading-snug flex items-center gap-1.5">
            <Rocket className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span>
              <em>Corpus:</em> Investing {formatINR(calculations.savingsAmt)}/mo for 15 yrs at 12% returns grows to ~<strong>₹60 Lakhs!</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
