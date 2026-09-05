'use client';

import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { ProviderLogo } from '@/components/icons/CustomIcons';

export const UpcomingRenewals: React.FC = () => {
  const { subscriptions, insurances, setActiveSubTab } = useFinance();

  const renewalItems = [
    ...subscriptions.filter((s) => s.is_active).map((s) => ({
      id: s.id,
      title: s.name,
      logoKey: s.logoKey,
      dueDate: `Due: ${s.next_renewal_date} (in ${s.days_remaining} days)`,
      amount: `₹${s.amount.toLocaleString('en-IN')}`,
      cycle: s.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly',
      isUrgent: s.is_urgent || s.days_remaining <= 10,
      type: 'sub' as const,
    })),
    ...insurances.filter((i) => i.is_active).map((i) => ({
      id: i.id,
      title: i.policy_name,
      logoKey: i.logoKey,
      dueDate: `Due: ${i.renewal_date} (in ${i.days_remaining} days)`,
      amount: `₹${i.premium_amount.toLocaleString('en-IN')}`,
      cycle: i.premium_frequency === 'monthly' ? 'Monthly' : 'Yearly',
      isUrgent: i.is_urgent || i.days_remaining <= 10,
      type: 'ins' as const,
    })),
  ].slice(0, 4);

  return (
    <div className="bg-transparent mt-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Upcoming Renewals & Alerts
        </h2>
        <button
          onClick={() => setActiveSubTab('subscriptions')}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
        >
          View All
        </button>
      </div>

      {/* Grid Cards or Empty State */}
      {renewalItems.length === 0 ? (
        <div className="fintech-card rounded-2xl sm:rounded-3xl p-6 text-center">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No active renewals or policy alerts</p>
          <p className="text-[11px] text-slate-400 mt-1">Add your OTT subscriptions and insurances to track renewal dates and automated alerts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {renewalItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveSubTab(item.type === 'sub' ? 'subscriptions' : 'insurances')}
              className={`fintech-card fintech-card-hover rounded-2xl sm:rounded-3xl p-4.5 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                item.isUrgent ? 'border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.08)]' : ''
              }`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] ${
                item.isUrgent
                  ? 'bg-gradient-to-r from-transparent via-rose-500/60 to-transparent'
                  : 'bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity'
              }`} />

              <div className="flex items-start gap-3 mb-3">
                <ProviderLogo logoKey={item.logoKey} className="w-10 h-10 shrink-0 transition-transform group-hover:scale-105" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    {item.isUrgent && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    {item.dueDate}
                  </p>
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-2.5 border-t border-slate-100 dark:border-white/[0.06]">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                  {item.cycle}
                </span>
                <span className="text-sm sm:text-base font-black font-mono tabular-nums text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  {item.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
