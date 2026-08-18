'use client';

import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Shield, ShieldAlert, ShieldCheck, Info, Sparkles } from 'lucide-react';

export const EmergencyRunwayGauge: React.FC = () => {
  const { profile, totalIncome, totalOutflow, netSurplus, emergencyRunwayMonths, goals } = useFinance();

  const emergencyGoal = goals.find((g) => g.category === 'emergency_fund');
  const liquidEmergencyFund = profile.emergency_fund_balance > 0
    ? profile.emergency_fund_balance
    : (emergencyGoal?.current_amount || 0);

  const target6MonthFund = totalOutflow * 6;
  const target3MonthFund = totalOutflow * 3;
  const progressPercent = target6MonthFund > 0
    ? Math.min(100, Math.round((liquidEmergencyFund / target6MonthFund) * 100))
    : (liquidEmergencyFund > 0 ? 100 : 0);


  const getStatus = (months: number) => {
    if (months >= 6) {
      return {
        label: 'Optimal Runway',
        description: 'You have over 6 months of financial survival buffer. Well prepared for emergencies!',
        color: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-500/20',
        progressBg: 'bg-emerald-500',
        icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      };
    } else if (months >= 3) {
      return {
        label: 'Adequate Runway',
        description: 'You have a healthy 3-5 month cushion. Aim for 6 months for complete safety.',
        color: 'text-blue-600 dark:text-blue-400',
        badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-500/20',
        progressBg: 'bg-blue-500',
        icon: <Shield className="w-5 h-5 text-blue-500" />,
      };
    } else {
      return {
        label: 'Caution / Build Cushion',
        description: 'Your runway is under 3 months. Prioritize building emergency savings before aggressive investing.',
        color: 'text-amber-600 dark:text-amber-400',
        badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-500/20',
        progressBg: 'bg-amber-500',
        icon: <ShieldAlert className="w-5 h-5 text-amber-500" />,
      };
    }
  };

  const status = getStatus(emergencyRunwayMonths);

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
            {status.icon}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              Emergency Fund Runway
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Survival months if all active income stops today
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1.5 ${status.badgeBg}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          {status.label}
        </span>
      </div>

      {/* Runway Score & Progress Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1">
        {/* Large Meter Number */}
        <div className="md:col-span-4 p-4 rounded-2xl neumorph-inset-deep text-center space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400">Survival Duration</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-baseline justify-center gap-1">
            <span className={status.color}>{emergencyRunwayMonths}</span>
            <span className="text-xs text-slate-400 font-semibold">Months</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium truncate">
            Based on ₹{totalOutflow.toLocaleString('en-IN')}/mo burn rate
          </p>
        </div>

        {/* Visual Progress Bar & Milestones */}
        <div className="md:col-span-8 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-300">
              Cushion: <strong className="text-slate-900 dark:text-white">₹{liquidEmergencyFund.toLocaleString('en-IN')}</strong>
            </span>
            <span className="text-slate-400">
              Target (6 Mo): <strong className="text-slate-700 dark:text-slate-200">₹{target6MonthFund.toLocaleString('en-IN')}</strong>
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 relative">
            <div
              className={`h-full rounded-full transition-all duration-500 shadow-xs ${status.progressBg}`}
              style={{ width: `${Math.max(8, progressPercent)}%` }}
            />
          </div>

          {/* Milestones Labels */}
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-0.5">
            <span>0 Mo</span>
            <span className="text-blue-500">3 Mo (Essential: ₹{target3MonthFund.toLocaleString('en-IN')})</span>
            <span className="text-emerald-500">6 Mo (Target)</span>
          </div>
        </div>
      </div>

      {/* Insight Note */}
      <div className="p-3 bg-slate-50 dark:bg-[#0B101D] border border-slate-200/60 dark:border-slate-800/60 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
        <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <span>{status.description}</span>
      </div>
    </div>
  );
};
