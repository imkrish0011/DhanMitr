'use client';

import React, { useState } from 'react';
import { MarginLoanCalculator } from './MarginLoanCalculator';
import { HyperLocalFeasibility } from './HyperLocalFeasibility';
import { SipCalculator } from './SipCalculator';
import { BudgetSplitter } from './BudgetSplitter';
import { LoanPrepaymentCalculator } from './LoanPrepaymentCalculator';
import { Calculator, Store, TrendingUp, Scale, Zap, Printer, Sparkles } from 'lucide-react';

export type ProjectLoanTab = 'loan' | 'feasibility' | 'sip' | 'budget' | 'prepayment';

export const ProjectLoanSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProjectLoanTab>('loan');
  const [sharedProjectCost, setSharedProjectCost] = useState<number>(500000);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const toolTabs = [
    {
      id: 'loan' as const,
      label: '10% Margin & Loan',
      shortLabel: 'Margin Loan',
      category: 'MSME & Business',
      icon: Calculator,
      activeClass: 'bg-emerald-500 text-slate-950 shadow-xs font-bold',
    },
    {
      id: 'feasibility' as const,
      label: 'Village Feasibility',
      shortLabel: 'Feasibility',
      category: 'MSME & Business',
      icon: Store,
      activeClass: 'bg-teal-500 text-slate-950 shadow-xs font-bold',
    },
    {
      id: 'sip' as const,
      label: 'SIP & Step-Up Wealth',
      shortLabel: 'SIP Wealth',
      category: 'Personal Wealth',
      icon: TrendingUp,
      activeClass: 'bg-emerald-500 text-slate-950 shadow-xs font-bold',
    },
    {
      id: 'budget' as const,
      label: '50-30-20 Budget Splitter',
      shortLabel: '50-30-20',
      category: 'Personal Wealth',
      icon: Scale,
      activeClass: 'bg-amber-500 text-slate-950 shadow-xs font-bold',
    },
    {
      id: 'prepayment' as const,
      label: 'Loan EMI & Prepayment',
      shortLabel: 'Prepayment Saver',
      category: 'Personal Wealth',
      icon: Zap,
      activeClass: 'bg-sky-500 text-slate-950 shadow-xs font-bold',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto select-none">
      {/* Top Header & Navigation Switcher */}
      <div className="fintech-card p-2.5 sm:p-3 rounded-3xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white font-display flex items-center gap-2">
                <span>Financial Calculators & MSME Suite</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  5 Local Tools
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Institutional project loans, rural enterprise feasibility, and personal wealth calculators.
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer"
            title="Print or Save Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>

        {/* 5-Tool Horizontal Navigation Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-[#070B14]/60 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-white/5 overflow-x-auto no-scrollbar">
          {toolTabs.map((t) => {
            const isActive = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? t.activeClass
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5 font-medium'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab View */}
      <div className="transition-all duration-200">
        {activeTab === 'loan' && (
          <MarginLoanCalculator
            initialProjectCost={sharedProjectCost}
            onProjectCostChange={setSharedProjectCost}
          />
        )}
        {activeTab === 'feasibility' && (
          <HyperLocalFeasibility initialProjectCost={sharedProjectCost} />
        )}
        {activeTab === 'sip' && <SipCalculator />}
        {activeTab === 'budget' && <BudgetSplitter />}
        {activeTab === 'prepayment' && <LoanPrepaymentCalculator />}
      </div>
    </div>
  );
};
