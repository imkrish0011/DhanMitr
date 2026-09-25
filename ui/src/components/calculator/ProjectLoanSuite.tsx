'use client';

import React, { useState } from 'react';
import { MarginLoanCalculator } from './MarginLoanCalculator';
import { HyperLocalFeasibility } from './HyperLocalFeasibility';
import { SipCalculator } from './SipCalculator';
import { BudgetSplitter } from './BudgetSplitter';
import { LoanPrepaymentCalculator } from './LoanPrepaymentCalculator';
import { useLanguage } from '@/context/LanguageContext';
import {
  Calculator,
  Store,
  TrendingUp,
  Scale,
  Zap,
  Printer,
  Sparkles,
} from 'lucide-react';

export type ProjectLoanTab = 'loan' | 'feasibility' | 'prepayment' | 'sip' | 'budget';

export const ProjectLoanSuite: React.FC = () => {
  const { language } = useLanguage();
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
      label: language === 'hi' ? '10% मार्जिन लोन' : '10% Margin Loan',
      shortLabel: language === 'hi' ? 'लोन' : 'Loan',
      icon: Calculator,
      badge: 'Mudra / PMEGP',
    },
    {
      id: 'feasibility' as const,
      label: language === 'hi' ? 'व्यापार व्यवहार्यता' : 'Village Feasibility',
      shortLabel: language === 'hi' ? 'व्यवहार्यता' : 'Feasibility',
      icon: Store,
      badge: 'Local AI',
    },
    {
      id: 'prepayment' as const,
      label: language === 'hi' ? 'EMI व प्रीपेमेंट' : 'EMI & Prepayment',
      shortLabel: language === 'hi' ? 'ईएमआई' : 'EMI',
      icon: Zap,
      badge: 'Interest Saver',
    },
    {
      id: 'sip' as const,
      label: language === 'hi' ? 'SIP कैलकुलेटर' : 'SIP & Wealth',
      shortLabel: language === 'hi' ? 'एसआईपी' : 'SIP',
      icon: TrendingUp,
      badge: 'Wealth',
    },
    {
      id: 'budget' as const,
      label: language === 'hi' ? '50-30-20 नियम' : '50-30-20 Rule',
      shortLabel: language === 'hi' ? 'बजट' : 'Budget',
      icon: Scale,
      badge: 'Allocations',
    },
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto select-none pb-2">
      {/* Sleek Minimal Header & Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{language === 'hi' ? 'व्यापार व सरकारी योजनाएं' : 'MSME & Business Hub'}</span>
              <Sparkles className="w-4 h-4 text-emerald-500 fill-emerald-400" />
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Mudra • PMEGP • CGTMSE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'hi'
              ? '10% मार्जिन पर सरकारी लोन, ग्रामीण व्यापार व्यवहार्यता व आसान किश्त योजना'
              : '10% margin project loans, rural business viability & smart repayment'}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 transition-all cursor-pointer active:scale-95 shadow-2xs"
          title="Print or Save Report"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'रिपोर्ट प्रिंट करें' : 'Export Report'}</span>
        </button>
      </div>

      {/* Horizontal Segmented Tool Switcher */}
      <div className="p-1 bg-slate-100/90 dark:bg-[#0c1220]/90 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-inner flex items-center gap-1 overflow-x-auto no-scrollbar">
        {toolTabs.map((t) => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 font-bold ${
                isActive
                  ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-slate-950 shadow-xs border border-slate-200/60 dark:border-transparent'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-500 dark:text-slate-950' : 'text-slate-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
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
          <HyperLocalFeasibility
            initialProjectCost={sharedProjectCost}
            onProjectCostChange={setSharedProjectCost}
            onNavigateToLoanTab={() => setActiveTab('loan')}
          />
        )}
        {activeTab === 'prepayment' && <LoanPrepaymentCalculator />}
        {activeTab === 'sip' && <SipCalculator />}
        {activeTab === 'budget' && <BudgetSplitter />}
      </div>
    </div>
  );
};
