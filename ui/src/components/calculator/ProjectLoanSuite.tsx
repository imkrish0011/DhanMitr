'use client';

import React, { useState } from 'react';
import { MarginLoanCalculator } from './MarginLoanCalculator';
import { HyperLocalFeasibility } from './HyperLocalFeasibility';
import {
  Calculator,
  Compass,
  FileSpreadsheet,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Printer,
  HelpCircle,
} from 'lucide-react';

export const ProjectLoanSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'loan_planner' | 'feasibility' | 'dscr_summary'>('loan_planner');
  const [sharedProjectCost, setSharedProjectCost] = useState<number>(500000);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Luxury Tab Switcher & Print Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-white/70 dark:bg-[#070B14]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('loan_planner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'loan_planner'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>10% Margin & Quarterly Loan</span>
          </button>

          <button
            onClick={() => setActiveTab('feasibility')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'feasibility'
                ? 'bg-teal-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Village / Block Feasibility & SWOT</span>
          </button>

          <button
            onClick={() => setActiveTab('dscr_summary')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dscr_summary'
                ? 'bg-blue-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Bank DPR Summary</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer"
            title="Print Project Dossier"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'loan_planner' && (
        <MarginLoanCalculator
          initialProjectCost={sharedProjectCost}
          onProjectCostChange={setSharedProjectCost}
        />
      )}

      {activeTab === 'feasibility' && (
        <HyperLocalFeasibility initialProjectCost={sharedProjectCost} />
      )}

      {activeTab === 'dscr_summary' && (
        <div className="space-y-6">
          <div className="fintech-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6">
            <div className="space-y-1.5 pb-4 border-b border-slate-200/70 dark:border-white/5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>EXECUTIVE DETAILED PROJECT REPORT (DPR) SUMMARY</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display">
                Bank Sanction Dossier & Debt-Service Metric
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Synchronized projection connecting your 10% promoter equity and 90% senior debt with operating net cashflow to establish Debt Service Coverage Ratio (DSCR).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/80 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  Total Project Cost
                </span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  ₹{sharedProjectCost.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  10% Margin: ₹{(sharedProjectCost * 0.1).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold block">
                  Senior Bank Loan (90%)
                </span>
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{(sharedProjectCost * 0.9).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-500/80 font-mono block">
                  {sharedProjectCost * 0.9 <= 140000 ? 'Micro Finance (6.5%)' : 'Term Loan (8.0%)'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 space-y-1">
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase font-bold block">
                  Target DSCR Coverage
                </span>
                <span className="text-2xl font-black font-mono text-blue-500">
                  1.75x <span className="text-xs text-slate-400 font-normal">Optimal</span>
                </span>
                <span className="text-[10px] text-blue-400/80 font-mono block">
                  Comfortably exceeds bank minimum (1.50x)
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/70 dark:border-white/5 space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Key Sanction Recommendations for Bank Branch Manager:
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>
                    <strong>Collateral Relief:</strong> Project is eligible under CGTMSE credit guarantee or MUDRA micro-refinance guidelines, exempting third-party collateral requirements.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>
                    <strong>Moratorium Cashflow Cushion:</strong> The structured quarterly moratorium ensures that early operational setup does not trigger premature Non-Performing Asset (NPA) classification.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>
                    <strong>Equity Verifiable:</strong> 10% promoter contribution can be validated via bank statement or upfront vendor machinery advance receipt.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
