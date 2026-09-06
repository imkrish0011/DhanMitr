'use client';

import React, { useState, useMemo } from 'react';
import { Landmark, Zap, Clock, ShieldAlert, Sparkles, CheckCircle2, PartyPopper } from 'lucide-react';

export const LoanPrepaymentCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState<number>(2500000);
  const [interestRate, setInterestRate] = useState<number>(8.75);
  const [tenureYears, setTenureYears] = useState<number>(20);
  
  // Prepayment strategy state
  const [strategy, setStrategy] = useState<'monthly' | 'annual_emi' | 'lumpsum'>('monthly');
  const [extraMonthly, setExtraMonthly] = useState<number>(3000);
  const [lumpSumAmount, setLumpSumAmount] = useState<number>(100000);
  const [lumpSumYear, setLumpSumYear] = useState<number>(2);

  const principalPresets = [1000000, 2500000, 5000000, 7500000, 10000000];
  const ratePresets = [
    { label: 'Home (8.5%)', value: 8.5 },
    { label: 'Home (9.0%)', value: 9.0 },
    { label: 'Auto (10.0%)', value: 10.0 },
    { label: 'Personal (12.5%)', value: 12.5 },
  ];
  const tenurePresets = [5, 10, 15, 20, 25];

  const results = useMemo(() => {
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = tenureYears * 12;

    // Standard EMI formula
    let emi = 0;
    if (monthlyRate > 0) {
      emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else {
      emi = principal / totalMonths;
    }

    const totalWithoutPrep = emi * totalMonths;
    const totalInterestWithoutPrep = totalWithoutPrep - principal;

    // Simulation with prepayment
    let balance = principal;
    let totalInterestWithPrep = 0;
    let totalPaidWithPrep = 0;
    let monthsElapsed = 0;

    for (let m = 1; m <= totalMonths; m++) {
      if (balance <= 0) break;
      monthsElapsed++;
      
      const interestForMonth = balance * monthlyRate;
      totalInterestWithPrep += interestForMonth;
      const principalFromEmi = emi - interestForMonth;

      let extraPayment = 0;
      if (strategy === 'monthly') {
        extraPayment = extraMonthly;
      } else if (strategy === 'annual_emi' && m % 12 === 0) {
        extraPayment = emi; // 1 extra EMI annually
      } else if (strategy === 'lumpsum' && m === lumpSumYear * 12) {
        extraPayment = lumpSumAmount;
      }

      const totalPrincipalPayment = principalFromEmi + extraPayment;

      if (totalPrincipalPayment >= balance) {
        totalPaidWithPrep += balance + interestForMonth;
        balance = 0;
        break;
      } else {
        totalPaidWithPrep += emi + extraPayment;
        balance -= totalPrincipalPayment;
      }
    }

    const interestSaved = Math.max(0, totalInterestWithoutPrep - totalInterestWithPrep);
    const monthsSaved = Math.max(0, totalMonths - monthsElapsed);
    const yearsSaved = (monthsSaved / 12).toFixed(1);

    return {
      emi: Math.round(emi),
      totalInterestWithoutPrep: Math.round(totalInterestWithoutPrep),
      totalWithoutPrep: Math.round(totalWithoutPrep),
      totalInterestWithPrep: Math.round(totalInterestWithPrep),
      totalPaidWithPrep: Math.round(totalPaidWithPrep),
      interestSaved: Math.round(interestSaved),
      monthsSaved,
      yearsSaved,
      newTenureYears: (monthsElapsed / 12).toFixed(1),
    };
  }, [principal, interestRate, tenureYears, strategy, extraMonthly, lumpSumAmount, lumpSumYear]);

  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const formatShortINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Loan EMI & Prepayment Saver
            </h4>
            <p className="text-slate-600 dark:text-slate-300">
              Banks earn huge interest over long tenures. See how a small regular prepayment shaves off years and saves lakhs!
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 font-mono font-bold text-[11px] whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Debt Freedom Math</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Loan Inputs & Strategy */}
        <div className="lg:col-span-7 space-y-5 fintech-card p-5 sm:p-6 rounded-3xl">
          {/* Principal Amount */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Loan Amount (Principal)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min={50000}
                  max={20000000}
                  step={50000}
                  value={principal}
                  onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                  className="w-36 pl-7 pr-3 py-1.5 rounded-xl text-right font-mono font-bold text-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <input
              type="range"
              min={100000}
              max={10000000}
              step={50000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400 mr-1">Loan:</span>
              {principalPresets.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setPrincipal(amt)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    principal === amt
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-2xs'
                      : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  ₹{amt >= 10000000 ? `${amt / 10000000} Cr` : `${amt / 100000} L`}
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Interest Rate (p.a.)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={25}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0.1, Number(e.target.value)))}
                  className="w-24 px-3 py-1.5 rounded-xl text-right font-mono font-bold text-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>

            <input
              type="range"
              min={6}
              max={18}
              step={0.1}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400 mr-1">Bench:</span>
              {ratePresets.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setInterestRate(r.value)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    interestRate === r.value
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-2xs'
                      : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tenure (Years) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Loan Tenure (Years)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={30}
                  step={1}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Math.max(1, Number(e.target.value)))}
                  className="w-24 px-3 py-1.5 rounded-xl text-right font-mono font-bold text-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Yrs</span>
              </div>
            </div>

            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400 mr-1">Years:</span>
              {tenurePresets.map((y) => (
                <button
                  key={y}
                  onClick={() => setTenureYears(y)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    tenureYears === y
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-2xs'
                      : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {y} Years
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Prepayment Supercharger */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/10 via-emerald-500/5 to-transparent border border-sky-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Prepayment Accelerator
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Choose how you want to pay down principal faster
                  </p>
                </div>
              </div>
            </div>

            {/* Strategy Switcher */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-200/60 dark:bg-black/30 rounded-xl text-xs">
              <button
                onClick={() => setStrategy('monthly')}
                className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer text-center ${
                  strategy === 'monthly'
                    ? 'bg-white dark:bg-sky-500 text-slate-900 dark:text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                +₹ Monthly Extra
              </button>
              <button
                onClick={() => setStrategy('annual_emi')}
                className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer text-center ${
                  strategy === 'annual_emi'
                    ? 'bg-white dark:bg-sky-500 text-slate-900 dark:text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                1 Extra EMI / Year
              </button>
              <button
                onClick={() => setStrategy('lumpsum')}
                className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer text-center ${
                  strategy === 'lumpsum'
                    ? 'bg-white dark:bg-sky-500 text-slate-900 dark:text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                One-Time Lump Sum
              </button>
            </div>

            {/* Strategy Specific Input */}
            {strategy === 'monthly' && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Extra Principal per Month:
                  </span>
                  <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                    +{formatINR(extraMonthly)}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={25000}
                  step={500}
                  value={extraMonthly}
                  onChange={(e) => setExtraMonthly(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <div className="flex gap-1.5">
                  {[1000, 2500, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setExtraMonthly(amt)}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-semibold"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {strategy === 'annual_emi' && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                Pay <strong>13 EMIs</strong> every year instead of 12 (using your annual Diwali or performance bonus of {formatINR(results.emi)}).
              </p>
            )}

            {strategy === 'lumpsum' && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Lump Sum (₹):</label>
                    <input
                      type="number"
                      step={25000}
                      value={lumpSumAmount}
                      onChange={(e) => setLumpSumAmount(Number(e.target.value))}
                      className="w-full px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Pay at Year:</label>
                    <input
                      type="number"
                      min={1}
                      max={tenureYears - 1}
                      value={lumpSumYear}
                      onChange={(e) => setLumpSumYear(Number(e.target.value))}
                      className="w-full px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: EMI & Freedom Dashboard */}
        <div className="lg:col-span-5 space-y-4">
          {/* Base EMI Card */}
          <div className="fintech-card p-6 rounded-3xl space-y-4 border-2 border-sky-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                  Standard Monthly EMI
                </span>
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 font-display">
                  {formatINR(results.emi)}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Landmark className="w-6 h-6" />
              </div>
            </div>

            {/* Interest vs Principal Callout */}
            <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Normal Interest:</span>
              <span className="font-mono font-bold text-rose-500">
                {formatShortINR(results.totalInterestWithoutPrep)}
              </span>
            </div>

            {/* BIG SAVINGS HERO BOX */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-sky-500/10 border-2 border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Your Prepayment Rewards
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Interest Saved:</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatShortINR(results.interestSaved)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Time Cut Off:</span>
                  <span className="text-xl font-black text-sky-600 dark:text-sky-400 font-mono">
                    {results.yearsSaved} Years
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 dark:text-emerald-200/80 leading-snug pt-1 border-t border-emerald-500/20 flex items-center gap-1.5">
                <PartyPopper className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  Your {tenureYears}-year loan finishes in <strong>{results.newTenureYears} years</strong> instead!
                </span>
              </div>
            </div>
          </div>

          {/* Quick Bank Wisdom Box */}
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#070B14]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>RBI Guidelines to Remember:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              <li>Floating-rate home loans in India have <strong>ZERO prepayment penalty</strong> by RBI mandate.</li>
              <li>Prepaying in the initial 5–7 years yields the maximum interest savings.</li>
              <li>Always tell your bank to <em>reduce tenure</em> instead of reducing EMI amount.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
