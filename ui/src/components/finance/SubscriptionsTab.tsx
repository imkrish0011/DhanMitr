'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { ProviderLogo } from '@/components/icons/CustomIcons';
import { Subscription } from '@/types';
import { EditRecordModal, EditableItem } from '@/components/finance/Modals/EditRecordModal';
import { Tv, Plus, Sparkles, Filter, CreditCard, TrendingUp, ShieldCheck } from 'lucide-react';

interface SubscriptionsTabProps {
  onOpenAddModal: () => void;
}

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({ onOpenAddModal }) => {
  const { subscriptions, toggleSubscriptionActive, deleteSubscription } = useFinance();
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);

  const categories = ['All', 'Entertainment', 'AI & Productivity', 'Music', 'Cloud & Media', 'Utilities'];

  const filteredSubs = filterCategory === 'All'
    ? subscriptions
    : subscriptions.filter((s) => s.category.toLowerCase().includes(filterCategory.toLowerCase()));

  const activeSubs = subscriptions.filter((s) => s.is_active);
  const totalMonthlyCost = activeSubs.reduce(
    (sum, s) => sum + (s.billing_cycle === 'monthly' ? s.amount : Math.round(s.amount / 12)),
    0
  );
  const totalAnnualCost = totalMonthlyCost * 12;

  return (
    <div className="space-y-4 sm:space-y-6 pb-2">
      {/* Clean Header & Metrics Card */}
      <div className="fintech-card fintech-card-hover rounded-2xl sm:rounded-3xl text-slate-900 dark:text-white p-5 sm:p-7 relative overflow-hidden space-y-5 group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0 shadow-xs">
                <Tv className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Active Subscriptions & Recurring Plans
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Monitor, pause, or optimize your recurring monthly and annual memberships.
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-950/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subscription</span>
          </button>
        </div>

        {/* Responsive Balanced Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-500/[0.03] dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.06]">
          {/* Monthly Outlay */}
          <div className="flex items-center gap-3 px-2 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 block truncate">
                Monthly Outlay
              </span>
              <span className="text-sm sm:text-base font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400 truncate block">
                ₹{totalMonthlyCost.toLocaleString('en-IN')}/mo
              </span>
            </div>
          </div>

          {/* Annualized Cost */}
          <div className="flex items-center gap-3 px-2 min-w-0 border-l border-slate-200/80 dark:border-white/[0.06] pl-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-500 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 block truncate">
                Annual Run-Rate
              </span>
              <span className="text-sm sm:text-base font-black font-mono tabular-nums text-slate-900 dark:text-white truncate block">
                ₹{totalAnnualCost.toLocaleString('en-IN')}/yr
              </span>
            </div>
          </div>

          {/* Active Count */}
          <div className="col-span-2 md:col-span-1 flex items-center gap-3 px-2 min-w-0 border-t md:border-t-0 md:border-l border-slate-200/80 dark:border-white/[0.06] pt-2.5 md:pt-0 md:pl-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-500 shrink-0">
              <Tv className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 block truncate">
                Tracked Services
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-600 dark:text-emerald-400 truncate block">
                {activeSubs.length} Active Plans
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filterCategory === cat
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Subscriptions Grid or Empty State */}
      {filteredSubs.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <Tv className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Active Subscriptions Tracked</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Log your OTT, music, AI, and utility memberships to monitor upcoming billing dates and prune unwanted recurring costs.
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-block"
          >
            + Add First Subscription
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredSubs.map((sub) => (
            <div
              key={sub.id}
              className={`fintech-card fintech-card-hover rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between group relative overflow-hidden ${
                sub.is_active
                  ? ''
                  : 'opacity-60 border-dashed'
              }`}
            >
              {sub.is_urgent && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />
              )}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <ProviderLogo logoKey={sub.logoKey} className="w-10 h-10 shrink-0 transition-transform group-hover:scale-105" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {sub.name}
                        </h3>
                        {sub.is_urgent && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono font-black uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded shrink-0">
                            Due Soon
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 capitalize block truncate">
                        {sub.category}
                      </span>
                    </div>
                  </div>

                  <span className="text-sm sm:text-base font-black font-mono tabular-nums text-slate-900 dark:text-white shrink-0">
                    ₹{sub.amount.toLocaleString('en-IN')}
                    <span className="text-[10px] text-slate-400 font-sans font-normal">/{sub.billing_cycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-white/[0.06]">
                  <div className="flex justify-between">
                    <span>Renewal Date:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{sub.next_renewal_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-mono font-bold ${sub.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {sub.is_active ? `Active (in ${sub.days_remaining}d)` : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs">
                <button
                  onClick={() => toggleSubscriptionActive(sub.id)}
                  className={`text-[11px] font-bold cursor-pointer transition-colors ${
                    sub.is_active
                      ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
                      : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {sub.is_active ? 'Pause Plan' : 'Resume'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingItem({ type: 'subscription', data: sub })}
                    className="text-slate-400 hover:text-emerald-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit Subscription"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteSubscription(sub.id)}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete Subscription"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Record Modal */}
      {editingItem && (
        <EditRecordModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          item={editingItem}
        />
      )}
    </div>
  );
};
