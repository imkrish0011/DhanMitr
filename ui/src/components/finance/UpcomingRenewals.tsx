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

      {/* Grid Cards with Pop-up Hover effect */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {renewalItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveSubTab(item.type === 'sub' ? 'subscriptions' : 'insurances')}
            className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs hover:shadow-sm hover:border-emerald-500/20 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-start gap-3 mb-3">
              <ProviderLogo logoKey={item.logoKey} className="w-10 h-10 shrink-0 transition-transform" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  {item.isUrgent && (
                    <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400 rounded">
                      URGENT
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {item.dueDate}
                </p>
              </div>
            </div>

            <div className="flex items-baseline justify-end pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white mr-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {item.amount}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {item.cycle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
