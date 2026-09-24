'use client';

import React, { useState } from 'react';
import { MarginLoanCalculator } from './MarginLoanCalculator';
import { HyperLocalFeasibility } from './HyperLocalFeasibility';
import { SipCalculator } from './SipCalculator';
import { BudgetSplitter } from './BudgetSplitter';
import { LoanPrepaymentCalculator } from './LoanPrepaymentCalculator';
import {
  Calculator,
  Store,
  TrendingUp,
  Scale,
  Zap,
  Printer,
  Sparkles,
  ShieldCheck,
  Building2,
  Coins,
} from 'lucide-react';

export type ProjectLoanTab = 'feasibility' | 'loan' | 'sip' | 'prepayment' | 'budget';

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
      badge: 'PMEGP/Mudra',
      activeClass: 'bg-emerald-500 text-slate-950 shadow-xs font-bold',
    },
    {
      id: 'feasibility' as const,
      label: 'Village Feasibility',
      shortLabel: 'Feasibility',
      category: 'MSME & Business',
      icon: Store,
      badge: 'Local AI',
      activeClass: 'bg-teal-500 text-slate-950 shadow-xs font-bold',
    },
    {
      id: 'prepayment' as const,
      label: 'EMI & Prepayment',
      shortLabel: 'Prepayment',
      category: 'Debt Freedom',
      icon: Zap,
      badge: 'Interest Saver',
      activeClass: 'bg-sky-500 text-slate-950 shadow-xs font-bold',
    },
    {
      id: 'sip' as const,
      label: 'SIP & Compounding',
      shortLabel: 'SIP Wealth',
      category: 'Wealth Growth',
      icon: TrendingUp,
      badge: 'Compounding',
      activeClass: 'bg-emerald-500 text-slate-950 shadow-xs font-bold',
    },
    {
      id: 'budget' as const,
      label: '50-30-20 Splitter',
      shortLabel: '50-30-20',
      category: 'Cash Flow',
      icon: Scale,
      badge: 'Allocations',
      activeClass: 'bg-amber-500 text-slate-950 shadow-xs font-bold',
    },
  ];

  return (
    <div className="space-y-4 max-w-6xl mx-auto select-none pb-2">
      {/* Top Header & Navigation Switcher */}
      <div className="relative p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-[#06241a] via-[#041a12] to-[#010e0a] text-white shadow-[0_20px_45px_-12px_rgba(5,150,105,0.25)] border border-emerald-500/25 overflow-hidden">
        {/* Ambient diffuse decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Govt Schemes • Mudra • PMEGP
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-emerald-200">
                90% Debt • 10% Margin
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display flex items-center gap-2">
              <span>MSME & Enterprise Engine</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </h2>
            <p className="text-xs text-emerald-100/80 max-w-lg leading-relaxed">
              Institutional project loans, village business viability analysis, and debt repayment optimization.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Print or Save Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>

        {/* 5-Tool Horizontal Navigation Pills */}
        <div className="relative z-10 mt-4 pt-3 border-t border-emerald-500/20">
          <div className="flex items-center gap-1.5 p-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto no-scrollbar shadow-inner">
            {toolTabs.map((t) => {
              const isActive = activeTab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? t.activeClass
                      : 'text-slate-300 hover:text-white hover:bg-white/10 font-semibold'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Tab View */}
      <div className="transition-all duration-200">
        {activeTab === 'feasibility' && (
          <HyperLocalFeasibility
            initialProjectCost={sharedProjectCost}
            onProjectCostChange={setSharedProjectCost}
            onNavigateToLoanTab={() => setActiveTab('loan')}
          />
        )}
        {activeTab === 'loan' && (
          <MarginLoanCalculator
            initialProjectCost={sharedProjectCost}
            onProjectCostChange={setSharedProjectCost}
          />
        )}
        {activeTab === 'prepayment' && <LoanPrepaymentCalculator />}
        {activeTab === 'sip' && <SipCalculator />}
        {activeTab === 'budget' && <BudgetSplitter />}
      </div>
    </div>
  );
};
