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
    <div className="fintech-card fintech-card-hover rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5 relative overflow-hidden group">
      {/* Top Ambient Subtle Accent Beam */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-90" />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 dark:border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs shadow-emerald-950/20">
            {status.icon}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Emergency Fund Runway
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Survival months if all active income stops today
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 shadow-2xs backdrop-blur-md ${status.badgeBg}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          {status.label}
        </span>
      </div>

      {/* Runway Score & Progress Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-1">
        {/* Large Meter Number */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-slate-500/[0.04] dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] text-center space-y-1 shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-emerald-500/5 to-transparent pointer-events-none" />
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 block">
            Survival Duration
          </span>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-baseline justify-center gap-1.5 font-mono tabular-nums">
            <span className={status.color}>{emergencyRunwayMonths}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-sans font-bold uppercase tracking-wider">
              Months
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate font-mono">
            ₹{totalOutflow.toLocaleString('en-IN')}/mo burn rate
          </p>
        </div>

        {/* Visual Progress Bar & Milestones */}
        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
              Cushion: <strong className="text-slate-900 dark:text-white font-mono tabular-nums">₹{liquidEmergencyFund.toLocaleString('en-IN')}</strong>
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              Target (6 Mo): <strong className="text-slate-700 dark:text-slate-200 font-mono tabular-nums">₹{target6MonthFund.toLocaleString('en-IN')}</strong>
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full h-3.5 bg-slate-200/60 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 relative shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
              style={{ width: `${Math.max(8, progressPercent)}%` }}
            />
          </div>

          {/* Milestones Labels */}
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 px-0.5">
            <span>0 Mo</span>
            <span className="text-blue-500 dark:text-blue-400">3 Mo (Essential: ₹{target3MonthFund.toLocaleString('en-IN')})</span>
            <span className="text-emerald-500 dark:text-emerald-400">6 Mo (Optimal Target)</span>
          </div>
        </div>
      </div>

      {/* Insight Note */}
      <div className="p-3.5 bg-slate-500/[0.04] dark:bg-white/[0.02] border border-slate-200/70 dark:border-white/[0.06] rounded-2xl text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <span className="leading-relaxed font-medium">{status.description}</span>
      </div>
    </div>
  );
};
