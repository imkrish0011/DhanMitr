'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { ProviderLogo } from '@/components/icons/CustomIcons';
import { Subscription } from '@/types';
import { EditRecordModal, EditableItem } from '@/components/finance/Modals/EditRecordModal';

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

  const totalMonthlyCost = subscriptions
    .filter((s) => s.is_active)
    .reduce((sum, s) => sum + (s.billing_cycle === 'monthly' ? s.amount : Math.round(s.amount / 12)), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Metrics */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Active Subscriptions & Recurring Plans
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor, edit, pause, or optimize your recurring monthly and annual memberships.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 dark:text-slate-500 block">Total Monthly Cost</span>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹{totalMonthlyCost.toLocaleString('en-IN')}/mo
            </span>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filterCategory === cat
                ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Subscriptions Grid with Pop-up Hover and Edit buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSubs.map((sub) => (
          <div
            key={sub.id}
            className={`bg-white dark:bg-[#0F172A] border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-emerald-500/20 transition-all duration-300 flex flex-col justify-between group ${
              sub.is_active
                ? 'border-slate-200/80 dark:border-slate-800'
                : 'border-dashed border-slate-300 dark:border-slate-700 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <ProviderLogo logoKey={sub.logoKey} className="w-11 h-11 shrink-0 transition-transform" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {sub.name}
                      {sub.is_urgent && (
                        <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 rounded">
                          Urgent
                        </span>
                      )}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {sub.planName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Edit Pencil Button */}
                  <button
                    onClick={() => setEditingItem({ type: 'subscription', data: sub })}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit Subscription"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                  </button>

                  {/* Active Toggle */}
                  <button
                    onClick={() => toggleSubscriptionActive(sub.id)}
                    title={sub.is_active ? 'Pause Subscription' : 'Resume Subscription'}
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      sub.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                        sub.is_active ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs py-2.5 border-y border-slate-100 dark:border-slate-800/60 my-2">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Billing:</span>
                  <span className="font-medium capitalize text-slate-700 dark:text-slate-300">{sub.billing_cycle}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Category:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{sub.category}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Next Renewal:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {sub.next_renewal_date} (in {sub.days_remaining}d)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  ₹{sub.amount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                  /{sub.billing_cycle === 'monthly' ? 'mo' : 'yr'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingItem({ type: 'subscription', data: sub })}
                  className="text-[11px] text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteSubscription(sub.id)}
                  className="text-[11px] text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Record Modal */}
      <EditRecordModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
      />
    </div>
  );
};
