'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { ProviderLogo, ShieldCheckIcon } from '@/components/icons/CustomIcons';
import { EditRecordModal, EditableItem } from '@/components/finance/Modals/EditRecordModal';
import { ShieldCheck, Plus, Sparkles, HeartPulse, FileText, Wallet, Pencil, Trash2 } from 'lucide-react';

interface InsurancesTabProps {
  onOpenAddModal: () => void;
}

export const InsurancesTab: React.FC<InsurancesTabProps> = ({ onOpenAddModal }) => {
  const { insurances, toggleInsuranceActive, deleteInsurance } = useFinance();
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);

  const activeInsurances = insurances.filter((i) => i.is_active);
  const totalCoverage = activeInsurances.reduce((sum, i) => sum + i.coverage_amount, 0);
  const totalAnnualPremium = activeInsurances.reduce((sum, i) => {
    if (i.premium_frequency === 'monthly') return sum + i.premium_amount * 12;
    if (i.premium_frequency === 'quarterly') return sum + i.premium_amount * 4;
    return sum + i.premium_amount;
  }, 0);

  const formatCoverage = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-2">
      {/* Clean Header & Coverage Overview */}
      <div className="fintech-card fintech-card-hover rounded-2xl sm:rounded-3xl text-slate-900 dark:text-white p-5 sm:p-7 relative overflow-hidden space-y-5 group">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-500 shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Insurance & Risk Safety Net
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Active health, life, and asset risk protection policies with claim assistance.
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-950/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Policy</span>
          </button>
        </div>

        {/* Responsive Balanced Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-500/[0.03] dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.06]">
          {/* Total Coverage */}
          <div className="flex items-center gap-3 px-2 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-500 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 block truncate">
                Total Risk Cover
              </span>
              <span className="text-sm sm:text-base font-black font-mono tabular-nums text-blue-600 dark:text-blue-400 truncate block">
                {formatCoverage(totalCoverage)}
              </span>
            </div>
          </div>

          {/* Annual Outlay */}
          <div className="flex items-center gap-3 px-2 min-w-0 border-l border-slate-200/80 dark:border-white/[0.06] pl-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 block truncate">
                Annual Premium Outlay
              </span>
              <span className="text-sm sm:text-base font-black font-mono tabular-nums text-slate-900 dark:text-white truncate block">
                ₹{totalAnnualPremium.toLocaleString('en-IN')}/yr
              </span>
            </div>
          </div>

          {/* Active Policies */}
          <div className="col-span-2 md:col-span-1 flex items-center gap-3 px-2 min-w-0 border-t md:border-t-0 md:border-l border-slate-200/80 dark:border-white/[0.06] pt-2.5 md:pt-0 md:pl-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 block truncate">
                Portfolio Status
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-600 dark:text-emerald-400 truncate block">
                {activeInsurances.length} Policies Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Insurances List or Empty State */}
      {insurances.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-6 h-6" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {insurances.map((ins) => (
            <div
              key={ins.id}
              className={`fintech-card fintech-card-hover rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between group relative overflow-hidden ${
                ins.is_active
                  ? ''
                  : 'opacity-60 border-dashed'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <ProviderLogo logoKey={ins.logoKey} className="w-10 h-10 shrink-0 transition-transform group-hover:scale-105" />
                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {ins.policy_name}
                      </h3>
                      <span className="text-[11px] text-slate-400 block font-mono truncate">
                        {ins.policy_number}
                      </span>
                    </div>
                  </div>

                  <span className="text-sm sm:text-base font-black font-mono text-blue-600 dark:text-blue-400 shrink-0">
                    {formatCoverage(ins.coverage_amount)}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-white/[0.06]">
                  <div className="flex justify-between">
                    <span>Renewal Date:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{ins.renewal_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Premium Outlay:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200 capitalize">
                      ₹{ins.premium_amount.toLocaleString('en-IN')} / {ins.premium_frequency || 'yearly'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-mono font-bold ${ins.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {ins.is_active ? `Active (in ${ins.days_remaining}d)` : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs">
                <button
                  onClick={() => toggleInsuranceActive(ins.id)}
                  className={`text-[11px] font-bold cursor-pointer transition-colors ${
                    ins.is_active
                      ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
                      : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {ins.is_active ? 'Pause Policy' : 'Resume'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingItem({ type: 'insurance', data: ins })}
                    className="text-slate-400 hover:text-emerald-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit Insurance"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteInsurance(ins.id)}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete Policy"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
