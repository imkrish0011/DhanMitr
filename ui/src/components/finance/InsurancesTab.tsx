'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { ProviderLogo, ShieldCheckIcon } from '@/components/icons/CustomIcons';
import { EditRecordModal, EditableItem } from '@/components/finance/Modals/EditRecordModal';

interface InsurancesTabProps {
  onOpenAddModal: () => void;
}

export const InsurancesTab: React.FC<InsurancesTabProps> = ({ onOpenAddModal }) => {
  const { insurances, toggleInsuranceActive, deleteInsurance } = useFinance();
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);

  const totalCoverage = insurances
    .filter((i) => i.is_active)
    .reduce((sum, i) => sum + i.coverage_amount, 0);

  const formatCoverage = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Crore`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakhs`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Coverage Overview */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Insurance & Safety Net Coverage
            <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active health, life, and asset risk protection policies with claim assistance.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 dark:text-slate-500 block">Total Risk Cover</span>
            <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
              {formatCoverage(totalCoverage)}
            </span>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Add Policy</span>
          </button>
        </div>
      </div>

      {/* Insurances List or Empty State */}
      {insurances.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 text-xl font-bold">
            🛡️
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Insurance Policies Added</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Add your health, term life, vehicle, or personal risk cover policies to track sum insured limits and premium renewal dates.
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-block"
          >
            + Add First Insurance Policy
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {insurances.map((ins) => (
          <div
            key={ins.id}
            className={`bg-white dark:bg-[#0F172A] border rounded-2xl p-5 shadow-2xs hover:shadow-sm hover:border-emerald-500/20 transition-all duration-300 flex flex-col justify-between group ${
              ins.is_active
                ? 'border-slate-200/80 dark:border-slate-800'
                : 'border-dashed border-slate-300 dark:border-slate-700 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <ProviderLogo logoKey={ins.logoKey} className="w-11 h-11 shrink-0 transition-transform" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {ins.policy_name}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
                      {ins.policy_number}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingItem({ type: 'insurance', data: ins })}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit Policy"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => toggleInsuranceActive(ins.id)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      ins.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                        ins.is_active ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs py-2.5 border-y border-slate-100 dark:border-slate-800/60 my-2">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Provider:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{ins.provider}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Sum Insured (Cover):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCoverage(ins.coverage_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Next Renewal:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {ins.renewal_date} (in {ins.days_remaining}d)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  ₹{ins.premium_amount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                  /{ins.premium_frequency === 'monthly' ? 'mo' : 'yr'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingItem({ type: 'insurance', data: ins })}
                  className="text-[11px] text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteInsurance(ins.id)}
                  className="text-[11px] text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

      {/* Edit Record Modal */}
      <EditRecordModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
      />
    </div>
  );
};
