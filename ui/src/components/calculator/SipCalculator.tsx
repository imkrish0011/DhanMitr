'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, Sparkles, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const SipCalculator: React.FC = () => {
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(10000);
  const [returnRate, setReturnRate] = useState<number>(12);
  const [years, setYears] = useState<number>(15);
  const [isStepUp, setIsStepUp] = useState<boolean>(true);
  const [stepUpPercent, setStepUpPercent] = useState<number>(10);

  // Quick Preset Options
  const depositPresets = [2500, 5000, 10000, 25000, 50000];
  const yearPresets = [5, 10, 15, 20, 25];
  const returnPresets = [
    { label: 'FD/Debt (7%)', value: 7 },
    { label: 'Balanced (12%)', value: 12 },
    { label: 'Equity (15%)', value: 15 },
  ];

  // Calculation Logic
  const calculation = useMemo(() => {
    const monthlyRate = returnRate / 12 / 100;
    const totalMonths = years * 12;

    // 1. Calculation WITH Step-Up (if enabled)
    let investedWithStepUp = 0;
    let maturityWithStepUp = 0;
    let currentMonthly = monthlyDeposit;

    for (let yr = 1; yr <= years; yr++) {
      for (let m = 1; m <= 12; m++) {
        const monthsRemaining = totalMonths - ((yr - 1) * 12 + (m - 1));
        investedWithStepUp += currentMonthly;
        maturityWithStepUp += currentMonthly * Math.pow(1 + monthlyRate, monthsRemaining);
      }
      if (isStepUp) {
        currentMonthly = currentMonthly * (1 + stepUpPercent / 100);
      }
    }

    // 2. Calculation WITHOUT Step-Up (Base regular SIP)
    const investedFlat = monthlyDeposit * totalMonths;
    let maturityFlat = 0;
    if (monthlyRate > 0) {
      maturityFlat = monthlyDeposit * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
    } else {
      maturityFlat = investedFlat;
    }

    const finalInvested = isStepUp ? investedWithStepUp : investedFlat;
    const finalMaturity = isStepUp ? maturityWithStepUp : maturityFlat;
    const finalWealthGained = finalMaturity - finalInvested;
    const stepUpAdvantage = maturityWithStepUp - maturityFlat;

    const investedPercent = Math.max(5, Math.min(95, Math.round((finalInvested / finalMaturity) * 100)));
    const wealthPercent = 100 - investedPercent;

    return {
      invested: Math.round(finalInvested),
      wealthGained: Math.round(finalWealthGained),
      maturity: Math.round(finalMaturity),
      flatMaturity: Math.round(maturityFlat),
      stepUpAdvantage: Math.round(stepUpAdvantage),
      investedPercent,
      wealthPercent,
    };
  }, [monthlyDeposit, returnRate, years, isStepUp, stepUpPercent]);

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const formatShortINR = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              SIP & Annual Step-Up Wealth Builder
            </h4>
            <p className="text-slate-600 dark:text-slate-300">
              Calculate the power of regular disciplined investing, and see how stepping up SIP yearly supercharges your wealth!
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[11px] whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local & Instant</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-7 space-y-5 fintech-card p-5 sm:p-6 rounded-3xl">
          {/* Monthly Investment */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Monthly SIP Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min={500}
                  max={500000}
                  step={500}
                  value={monthlyDeposit}
                  onChange={(e) => setMonthlyDeposit(Math.max(0, Number(e.target.value)))}
                  className="w-32 pl-7 pr-3 py-1.5 rounded-xl text-right font-mono font-bold text-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <input
              type="range"
              min={500}
              max={100000}
              step={500}
              value={monthlyDeposit}
              onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            {/* Quick Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400 mr-1">Quick:</span>
              {depositPresets.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setMonthlyDeposit(amt)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    monthlyDeposit === amt
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-2xs'
                      : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* Expected Return Rate */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Expected Annual Return Rate (p.a.)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={30}
                  step={0.5}
                  value={returnRate}
                  onChange={(e) => setReturnRate(Math.max(1, Number(e.target.value)))}
                  className="w-24 px-3 py-1.5 rounded-xl text-right font-mono font-bold text-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>

            <input
              type="range"
              min={1}
              max={25}
              step={0.5}
              value={returnRate}
              onChange={(e) => setReturnRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400 mr-1">Typical:</span>
              {returnPresets.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReturnRate(r.value)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    returnRate === r.value
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-2xs'
                      : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Horizon (Years) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Investment Duration (Years)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={40}
                  step={1}
                  value={years}
                  onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}
                  className="w-24 px-3 py-1.5 rounded-xl text-right font-mono font-bold text-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Yrs</span>
              </div>
            </div>

            <input
              type="range"
              min={1}
              max={35}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400 mr-1">Tenure:</span>
              {yearPresets.map((y) => (
                <button
                  key={y}
                  onClick={() => setYears(y)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    years === y
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-2xs'
                      : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {y} Years
                </button>
              ))}
            </div>
          </div>

          {/* Annual Step-Up Option Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-emerald-500/5 to-transparent border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-500 dark:text-indigo-400">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Annual Step-Up Booster
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Increase SIP yearly with your annual salary hike
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStepUp(!isStepUp)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isStepUp ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isStepUp ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {isStepUp && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Yearly Step-Up Rate:
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +{stepUpPercent}% per year
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={stepUpPercent}
                  onChange={(e) => setStepUpPercent(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>+5% (Modest)</span>
                  <span>+10% (Recommended)</span>
                  <span>+20% (Aggressive)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Results & Wealth Projection */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Maturity Card */}
          <div className="fintech-card p-6 rounded-3xl space-y-5 border-2 border-emerald-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                Total Maturity Corpus
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1 font-display">
                {formatShortINR(calculation.maturity)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Exact: {formatCurrency(calculation.maturity)}
              </p>
            </div>

            {/* Split Metrics: Invested vs Wealth Gained */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Amount Invested
                </span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-200 font-mono block mt-1">
                  {formatShortINR(calculation.invested)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {calculation.investedPercent}% of corpus
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  Wealth Gained
                </span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono block mt-1">
                  +{formatShortINR(calculation.wealthGained)}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  {calculation.wealthPercent}% of corpus
                </span>
              </div>
            </div>

            {/* Visual Ratio Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <span>Principal ({calculation.investedPercent}%)</span>
                <span>Returns ({calculation.wealthPercent}%)</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${calculation.investedPercent}%` }}
                  className="h-full bg-slate-400 dark:bg-slate-600 transition-all duration-300"
                  title={`Invested: ${formatCurrency(calculation.invested)}`}
                />
                <div
                  style={{ width: `${calculation.wealthPercent}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  title={`Wealth Gained: ${formatCurrency(calculation.wealthGained)}`}
                />
              </div>
            </div>

            {/* Step-Up Advantage Callout */}
            {isStepUp && calculation.stepUpAdvantage > 0 && (
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2.5 text-xs text-indigo-950 dark:text-indigo-200">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Step-Up Bonus Effect:</p>
                  <p className="text-[11px] text-slate-600 dark:text-indigo-200/80 leading-relaxed mt-0.5">
                    By stepping up {stepUpPercent}% yearly, you create{' '}
                    <strong className="text-indigo-600 dark:text-indigo-300">
                      +{formatShortINR(calculation.stepUpAdvantage)}
                    </strong>{' '}
                    extra wealth compared to a flat SIP of ₹{monthlyDeposit.toLocaleString('en-IN')}/mo!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Practical Wisdom Tip */}
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#070B14]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Smart SIP Rules for Wealth Creation:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              <li>Keep investments disciplined through market ups and downs.</li>
              <li>Compounding kicks in heavily after year 7–10.</li>
              <li>Indian index & flexi-cap funds historically yield 12%–14% over 10+ year horizons.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
