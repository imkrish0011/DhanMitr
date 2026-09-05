'use client';

import React, { useState } from 'react';
import { MarginLoanCalculator } from './MarginLoanCalculator';
import { HyperLocalFeasibility } from './HyperLocalFeasibility';
import { Calculator, Store, Printer } from 'lucide-react';

export const ProjectLoanSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'loan' | 'feasibility'>('loan');
  const [sharedProjectCost, setSharedProjectCost] = useState<number>(500000);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Sleek Top Navigation Switcher */}
      <div className="flex items-center justify-between gap-3 p-1.5 rounded-2xl bg-white/70 dark:bg-[#070B14]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('loan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'loan'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>10% Margin & Loan Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('feasibility')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'feasibility'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Village Business Feasibility</span>
          </button>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer"
          title="Print or Save Report"
        >
          <Printer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Print Report</span>
        </button>
      </div>

      {/* Tab Views */}
      {activeTab === 'loan' ? (
        <MarginLoanCalculator
          initialProjectCost={sharedProjectCost}
          onProjectCostChange={setSharedProjectCost}
        />
      ) : (
        <HyperLocalFeasibility initialProjectCost={sharedProjectCost} />
      )}
    </div>
  );
};
