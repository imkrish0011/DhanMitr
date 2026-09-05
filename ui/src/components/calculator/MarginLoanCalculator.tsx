'use client';

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  ArrowRight,
  ShieldCheck,
  Zap,
  Download,
  Calendar,
  Layers,
  ChevronDown,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface MarginLoanCalculatorProps {
  onProjectCostChange?: (cost: number) => void;
  initialProjectCost?: number;
}

export const MarginLoanCalculator: React.FC<MarginLoanCalculatorProps> = ({
  onProjectCostChange,
  initialProjectCost,
}) => {
  // Input mode: 'margin' | 'project_cost'
  const [activeInputMode, setActiveInputMode] = useState<'margin' | 'project_cost'>('margin');

  // Core inputs: Default Margin Money = ₹50,000 (which yields ₹5,00,000 Project Cost & ₹4,50,000 Loan)
  const [marginInput, setMarginInput] = useState<number>(50000);
  const [projectCostInput, setProjectCostInput] = useState<number>(
    initialProjectCost || 500000
  );

  // Manual Scheme Override toggle
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const [manualScheme, setManualScheme] = useState<'micro' | 'term' | 'commercial'>('term');

  // Repayment schedule view toggle (show first 4 quarters vs all)
  const [showAllQuarters, setShowAllQuarters] = useState<boolean>(false);

  // 1. Module 2: Exact 10% Margin Money & 90% Loan Formulas
  // Project Cost = Margin / 0.10
  // Loan = Project Cost * 0.90
  const { marginMoney, projectCost, loanAmount } = useMemo(() => {
    if (activeInputMode === 'margin') {
      const validMargin = Math.max(0, marginInput);
      const calculatedProjectCost = validMargin / 0.10;
      const calculatedLoan = calculatedProjectCost * 0.90;
      return {
        marginMoney: validMargin,
        projectCost: calculatedProjectCost,
        loanAmount: calculatedLoan,
      };
    } else {
      const validCost = Math.max(0, projectCostInput);
      const calculatedMargin = validCost * 0.10;
      const calculatedLoan = validCost * 0.90;
      return {
        marginMoney: calculatedMargin,
        projectCost: validCost,
        loanAmount: calculatedLoan,
      };
    }
  }, [activeInputMode, marginInput, projectCostInput]);

  // Notify parent if project cost changes
  React.useEffect(() => {
    onProjectCostChange?.(projectCost);
  }, [projectCost, onProjectCostChange]);

  // 2. Module 2: Scheme Auto-Router (Exact Tiered Threshold Logic)
  // • <= ₹1.40L ➔ Micro Finance (6.5%, 3 yrs, 3 mo moratorium)
  // • ₹1.40L to ₹50L ➔ Term Loan (8%, 7 yrs, 6 mo moratorium)
  // • > ₹50L ➔ Commercial MSME (9.5%, 8 yrs, 6 mo moratorium)
  const autoDetectedScheme = useMemo<'micro' | 'term' | 'commercial'>(() => {
    if (loanAmount <= 140000) {
      return 'micro';
    } else if (loanAmount <= 5000000) {
      return 'term';
    } else {
      return 'commercial';
    }
  }, [loanAmount]);

  const effectiveScheme = isManualOverride ? manualScheme : autoDetectedScheme;

  const schemeConfig = useMemo(() => {
    switch (effectiveScheme) {
      case 'micro':
        return {
          id: 'micro',
          title: 'Micro Finance Loan',
          categoryBadge: 'Mudra / Micro Credit Tier',
          annualInterestRate: 6.5, // 6.5% p.a.
          tenureYears: 3, // 3 years
          moratoriumMonths: 3, // 3 months moratorium (1 quarter)
          description:
            'Subsidized nano & micro-enterprise facility for small village enterprises, retail stalls, and self-help groups. Zero collateral required.',
          benefits: [
            'Collateral-free micro-lending under Priority Sector Lending (PSL)',
            '6.5% concessional annual interest rate',
            '3-month initial grace period (first quarter interest only)',
            'Fast-track 7-day bank sanction',
          ],
        };
      case 'term':
        return {
          id: 'term',
          title: 'Term Loan / MSME Project Finance',
          categoryBadge: 'PMEGP / CGTMSE Project Tier',
          annualInterestRate: 8.0, // 8.0% p.a.
          tenureYears: 7, // 7 years
          moratoriumMonths: 6, // 6 months moratorium (2 quarters)
          description:
            'Structured commercial term loan for capital asset creation, machinery acquisition, sheds, and commercial rural enterprise setups.',
          benefits: [
            'Eligible for CGTMSE credit guarantee coverage (no third-party collateral)',
            '8.0% p.a. subsidized term lending rate',
            '6-month moratorium (2 full quarters) allowing business ramp-up',
            'Repayment phased comfortably over 7 years (28 quarters)',
          ],
        };
      case 'commercial':
      default:
        return {
          id: 'commercial',
          title: 'Commercial / Consortium MSME Loan',
          categoryBadge: 'High-Value Enterprise Tier',
          annualInterestRate: 9.5, // 9.5% p.a. benchmark
          tenureYears: 8, // 8 years
          moratoriumMonths: 6, // 6 months moratorium (2 quarters)
          description:
            'Industrial-scale agro-processing, cold storage, and manufacturing loans. Requires Detailed Project Report (DPR) and TEV study.',
          benefits: [
            'Large capital expenditure financing above ₹50 Lakhs',
            'Customizable quarterly debt servicing schedule',
            '6-month moratorium for civil construction & commissioning',
            'Working capital cash-credit linkage available',
          ],
        };
    }
  }, [effectiveScheme]);

  // 3. Module 2: Quarterly EMI & Moratorium Schedule Generator
  const scheduleData = useMemo(() => {
    const principal = loanAmount;
    if (principal <= 0) {
      return {
        quarterlyEmi: 0,
        monthlyEquivalent: 0,
        totalInterest: 0,
        totalRepayment: 0,
        moratoriumQuarters: 0,
        totalQuarters: 0,
        rows: [],
      };
    }

    const annualRate = schemeConfig.annualInterestRate / 100;
    const quarterlyRate = annualRate / 4; // r_q = r / 4
    const totalQuarters = schemeConfig.tenureYears * 4;
    const moratoriumQuarters = Math.round(schemeConfig.moratoriumMonths / 3);
    const repaymentQuarters = Math.max(1, totalQuarters - moratoriumQuarters);

    // Quarterly EMI formula for amortized period:
    // EMI_Q = P * [ r_q * (1 + r_q)^n ] / [ (1 + r_q)^n - 1 ]
    const powFactor = Math.pow(1 + quarterlyRate, repaymentQuarters);
    const quarterlyEmi =
      principal * ((quarterlyRate * powFactor) / (powFactor - 1));

    let currentBalance = principal;
    let totalInterestPaid = 0;
    const rows = [];

    // Generate quarter-by-quarter repayment schedule
    for (let q = 1; q <= totalQuarters; q++) {
      const isMoratorium = q <= moratoriumQuarters;
      const opening = currentBalance;
      const interestPayment = opening * quarterlyRate;
      totalInterestPaid += interestPayment;

      let principalPayment = 0;
      let totalQuarterPayment = 0;

      if (isMoratorium) {
        // In moratorium: Principal repayment is deferred (0).
        // Borrower only services the quarterly interest to keep account standard.
        principalPayment = 0;
        totalQuarterPayment = interestPayment;
        // Closing balance remains the same during moratorium
        currentBalance = opening;
      } else {
        // Amortized payment
        principalPayment = Math.min(opening, quarterlyEmi - interestPayment);
        totalQuarterPayment = quarterlyEmi;
        currentBalance = Math.max(0, opening - principalPayment);
      }

      rows.push({
        quarter: q,
        year: Math.ceil(q / 4),
        quarterInYear: ((q - 1) % 4) + 1,
        isMoratorium,
        openingBalance: Math.round(opening),
        interestPaid: Math.round(interestPayment),
        principalPaid: Math.round(principalPayment),
        totalQuarterPayment: Math.round(totalQuarterPayment),
        closingBalance: Math.round(currentBalance),
      });
    }

    const totalRepayment = principal + totalInterestPaid;
    const monthlyEquivalent = Math.round(quarterlyEmi / 3);

    return {
      quarterlyEmi: Math.round(quarterlyEmi),
      monthlyEquivalent,
      totalInterest: Math.round(totalInterestPaid),
      totalRepayment: Math.round(totalRepayment),
      moratoriumQuarters,
      totalQuarters,
      rows,
    };
  }, [loanAmount, schemeConfig]);

  // Handle preset clicks
  const handlePresetMargin = (preset: number) => {
    setActiveInputMode('margin');
    setMarginInput(preset);
  };

  // Export CSV schedule
  const handleExportCSV = () => {
    if (scheduleData.rows.length === 0) return;
    const headers = [
      'Quarter',
      'Year',
      'Status',
      'Opening Balance (INR)',
      'Interest Paid (INR)',
      'Principal Repaid (INR)',
      'Total Quarterly Payment (INR)',
      'Closing Balance (INR)',
    ];

    const csvRows = scheduleData.rows.map((r) => [
      `Q${r.quarter}`,
      `Year ${r.year} Q${r.quarterInYear}`,
      r.isMoratorium ? 'Moratorium Grace Period' : 'Regular Amortization',
      r.openingBalance,
      r.interestPaid,
      r.principalPaid,
      r.totalQuarterPayment,
      r.closingBalance,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `DhanMitr_${schemeConfig.id}_Quarterly_Schedule.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedRows = showAllQuarters
    ? scheduleData.rows
    : scheduleData.rows.slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Module 2 Header Banner */}
      <div className="p-6 sm:p-7 fintech-card rounded-3xl border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MODULE 2: MSME DEBT FINANCING SUITE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display">
              10% Margin Money & 90% Loan Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Computes eligible project scale from available promoter margin, automatically routes to Micro Finance or Term Loan schemes, and builds a quarterly repayment schedule with moratorium grace periods.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Export Amortization Schedule to CSV"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calculator Core: Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (7 cols): Two-Way 10/90 Calculator Inputs */}
        <div className="lg:col-span-7 fintech-card rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-display">
                  Project Financing Parameters
                </h3>
                <p className="text-[11px] text-slate-400">
                  Formula: Project Cost = Margin / 0.10 • Loan = Project Cost × 0.90
                </p>
              </div>
            </div>

            {/* Input Switcher Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[11px] font-mono font-bold">
              <button
                onClick={() => setActiveInputMode('margin')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeInputMode === 'margin'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Enter Margin
              </button>
              <button
                onClick={() => setActiveInputMode('project_cost')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeInputMode === 'project_cost'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Enter Project Cost
              </button>
            </div>
          </div>

          {/* Active Input Controls */}
          {activeInputMode === 'margin' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <span>Margin Money Available (10% Own Equity):</span>
                  <span className="text-emerald-500 font-mono font-black">*</span>
                </label>
                <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{marginInput.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={marginInput || ''}
                  onChange={(e) => setMarginInput(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  placeholder="e.g. 50000"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-400 mr-1">Presets:</span>
                {[25000, 50000, 100000, 250000, 500000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetMargin(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer border ${
                      marginInput === preset
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/5'
                    }`}
                  >
                    ₹{preset >= 100000 ? `${preset / 100000}L` : `${preset / 1000}k`}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <span>Total Project Capital Expenditure (100%):</span>
                  <span className="text-emerald-500 font-mono font-black">*</span>
                </label>
                <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{projectCostInput.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  min="50000"
                  step="50000"
                  value={projectCostInput || ''}
                  onChange={(e) =>
                    setProjectCostInput(Math.max(0, Number(e.target.value)))
                  }
                  className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800 text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  placeholder="e.g. 500000"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-400 mr-1">Presets:</span>
                {[140000, 500000, 1000000, 2500000, 5000000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setActiveInputMode('project_cost');
                      setProjectCostInput(preset);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer border ${
                      projectCostInput === preset
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/5'
                    }`}
                  >
                    ₹{preset >= 100000 ? `${preset / 100000}L` : `${preset / 1000}k`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic 10/90 Proportion Bar */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                10% Margin Money: ₹{Math.round(marginMoney).toLocaleString('en-IN')}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                90% Bank Debt: ₹{Math.round(loanAmount).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 flex overflow-hidden shadow-inner">
              <div
                style={{ width: '10%' }}
                className="bg-amber-500 h-full transition-all"
                title="10% Promoter Margin"
              />
              <div
                style={{ width: '90%' }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all"
                title="90% Senior Bank Debt"
              />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Under National MSME & PMEGP guidelines, General Category promoters contribute a mandatory minimum of 10% own equity, unlocking 90% senior bank debt. Special category (women, SC/ST, rural) can scale with 5% margin.
            </p>
          </div>

          {/* Summary Math Callout Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                Margin Money (10%)
              </span>
              <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                ₹{Math.round(marginMoney).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block">Promoter Cash</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1">
              <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 block font-bold">
                Eligible Loan (90%)
              </span>
              <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                ₹{Math.round(loanAmount).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 block">Bank Sanction</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                Total Project Cost
              </span>
              <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                ₹{Math.round(projectCost).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block">CapEx + Margin</span>
            </div>
          </div>
        </div>

        {/* Right Col (5 cols): Scheme Auto-Router Verdict */}
        <div className="lg:col-span-5 fintech-card rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Scheme Auto-Router
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  AUTO-MATCHED
                </span>
              </div>
            </div>

            {/* Scheme Title & Badge */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{schemeConfig.categoryBadge}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-display">
                {schemeConfig.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {schemeConfig.description}
              </p>
            </div>

            {/* Tiered Parameters Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/70 dark:border-white/5 text-center">
                <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">
                  Interest Rate
                </span>
                <span className="text-base font-black font-mono text-emerald-500 block">
                  {schemeConfig.annualInterestRate}%
                </span>
                <span className="text-[9px] text-slate-400 font-mono">per annum</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/70 dark:border-white/5 text-center">
                <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">
                  Loan Tenure
                </span>
                <span className="text-base font-black font-mono text-slate-900 dark:text-white block">
                  {schemeConfig.tenureYears} Yrs
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {schemeConfig.tenureYears * 4} Quarters
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 uppercase block font-bold">
                  Moratorium
                </span>
                <span className="text-base font-black font-mono text-amber-600 dark:text-amber-400 block">
                  {schemeConfig.moratoriumMonths} Mo
                </span>
                <span className="text-[9px] text-amber-500/70 font-mono">
                  {Math.round(schemeConfig.moratoriumMonths / 3)} Qtr Grace
                </span>
              </div>
            </div>

            {/* Scheme Key Benefits */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Government Scheme Entitlements:
              </span>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {schemeConfig.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Scheme Override Dropdown */}
          <div className="pt-4 border-t border-slate-200/70 dark:border-white/5 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isManualOverride}
                onChange={(e) => setIsManualOverride(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
              />
              <span>Manual Scheme Comparison</span>
            </label>

            {isManualOverride && (
              <select
                value={manualScheme}
                onChange={(e) => setManualScheme(e.target.value as any)}
                className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              >
                <option value="micro">Micro Finance (≤₹1.4L)</option>
                <option value="term">Term Loan (₹1.4L–₹50L)</option>
                <option value="commercial">Commercial MSME (&gt;₹50L)</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Module 2: Quarterly EMI & Moratorium Generator Section */}
      <div className="fintech-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-white/5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>QUARTERLY REPAYMENT & AMORTIZATION SCHEDULE</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display">
              Quarterly EMI with {schemeConfig.moratoriumMonths}-Month Moratorium Grace Phase
            </h3>
            <p className="text-xs text-slate-400">
              Unlike personal loans with monthly cycles, rural & MSME term financing functions on quarterly rests. During the {schemeConfig.moratoriumMonths}-month moratorium, principal repayment is ₹0, protecting your cashflow.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAllQuarters(!showAllQuarters)}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 transition-all cursor-pointer"
            >
              {showAllQuarters ? 'Show First Year (Q1–Q4)' : `Show All ${scheduleData.totalQuarters} Quarters`}
            </button>
          </div>
        </div>

        {/* 4 KPI Outflow Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1">
            <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 block font-bold">
              Amortized Quarterly EMI
            </span>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              ₹{scheduleData.quarterlyEmi.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-400 block">
              Paid post-moratorium ({scheduleData.totalQuarters - scheduleData.moratoriumQuarters} Quarters)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/70 dark:border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
              Monthly Equivalent Burden
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              ₹{scheduleData.monthlyEquivalent.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-400 block">
              Quarterly EMI / 3 for budget planning
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/70 dark:border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
              Total Interest Payable
            </span>
            <div className="text-2xl font-black font-mono text-amber-500">
              ₹{scheduleData.totalInterest.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-400 block">
              Over {schemeConfig.tenureYears} Years ({schemeConfig.annualInterestRate}% p.a.)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/70 dark:border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
              Total Repayment (P + I)
            </span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              ₹{scheduleData.totalRepayment.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-400 block">
              Principal ₹{Math.round(loanAmount).toLocaleString('en-IN')} + Interest
            </span>
          </div>
        </div>

        {/* Moratorium Special Notice Box */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-amber-700 dark:text-amber-300">
              Moratorium Grace Period Impact ({schemeConfig.moratoriumMonths} Months / {scheduleData.moratoriumQuarters} Quarter{scheduleData.moratoriumQuarters > 1 ? 's' : ''})
            </p>
            <p className="text-amber-800/90 dark:text-amber-200/80 leading-relaxed text-[11px]">
              During Quarter 1{scheduleData.moratoriumQuarters > 1 ? ' to Quarter 2' : ''}, zero principal is due. You only pay quarterly simple interest of approximately ₹{scheduleData.rows[0]?.interestPaid.toLocaleString('en-IN')} per quarter while setting up equipment, buying inventory, or waiting for dairy lactation / crop cycles. Regular principal amortization starts from Quarter {scheduleData.moratoriumQuarters + 1}.
            </p>
          </div>
        </div>

        {/* Interactive Quarterly Schedule Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Amortization Schedule Breakdown (Showing {displayedRows.length} of {scheduleData.rows.length} Quarters):
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              All figures in Indian Rupees (₹)
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100/90 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-bold">Quarter</th>
                  <th className="py-3 px-4 font-bold">Phase</th>
                  <th className="py-3 px-4 font-bold text-right">Opening Balance</th>
                  <th className="py-3 px-4 font-bold text-right">Interest (r/4)</th>
                  <th className="py-3 px-4 font-bold text-right">Principal Paid</th>
                  <th className="py-3 px-4 font-bold text-right">Total Outflow</th>
                  <th className="py-3 px-4 font-bold text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                {displayedRows.map((row) => (
                  <tr
                    key={row.quarter}
                    className={`transition-colors ${
                      row.isMoratorium
                        ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.06] hover:bg-amber-500/10'
                        : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      Q{row.quarter}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        Yr {row.year} Q{row.quarterInYear}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {row.isMoratorium ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          Moratorium
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          Amortized
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-700 dark:text-slate-300">
                      ₹{row.openingBalance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-amber-600 dark:text-amber-400 font-medium">
                      ₹{row.interestPaid.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">
                      {row.principalPaid === 0 ? '—' : `₹${row.principalPaid.toLocaleString('en-IN')}`}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-black text-slate-900 dark:text-white">
                      ₹{row.totalQuarterPayment.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                      ₹{row.closingBalance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!showAllQuarters && scheduleData.rows.length > 4 && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowAllQuarters(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
              >
                <span>View Full Schedule ({scheduleData.rows.length - 4} remaining quarters)</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
