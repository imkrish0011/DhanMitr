import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Subscription, Insurance, IncomeSource, BudgetItem, BillingCycle, InsuranceType } from '@/types';
import { StatefulButton, ButtonState } from '@/components/ui/StatefulButton';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { X } from 'lucide-react';

export type EditableItem =
  | { type: 'subscription'; data: Subscription }
  | { type: 'insurance'; data: Insurance }
  | { type: 'income'; data: IncomeSource }
  | { type: 'budget'; data: BudgetItem };

interface EditRecordModalProps {
  item: EditableItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({ item, isOpen, onClose }) => {
  const { updateSubscription, updateInsurance, updateIncomeSource, updateBudgetItem } = useFinance();
  const [buttonState, setButtonState] = useState<ButtonState>('idle');

  // Subscription state
  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [subCycle, setSubCycle] = useState<BillingCycle>('monthly');
  const [subCategory, setSubCategory] = useState('');
  const [subDate, setSubDate] = useState('');
  const [subLogoKey, setSubLogoKey] = useState<any>('netflix');

  // Insurance state
  const [insName, setInsName] = useState('');
  const [insProvider, setInsProvider] = useState('');
  const [insCoverage, setInsCoverage] = useState('');
  const [insPremium, setInsPremium] = useState('');
  const [insFreq, setInsFreq] = useState<'monthly' | 'yearly'>('yearly');
  const [insType, setInsType] = useState<InsuranceType>('term_life');
  const [insDate, setInsDate] = useState('');

  // Income state
  const [incTitle, setIncTitle] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incDate, setIncDate] = useState('');

  // Budget state
  const [budAllocated, setBudAllocated] = useState('');
  const [budSpent, setBudSpent] = useState('');

  useEffect(() => {
    if (!item) return;

    if (item.type === 'subscription') {
      setSubName(item.data.name);
      setSubAmount(String(item.data.amount));
      setSubCycle(item.data.billing_cycle);
      setSubCategory(item.data.category);
      setSubDate(item.data.next_renewal_date);
      setSubLogoKey(item.data.logoKey);
    } else if (item.type === 'insurance') {
      setInsName(item.data.policy_name);
      setInsProvider(item.data.provider);
      setInsCoverage(String(item.data.coverage_amount));
      setInsPremium(String(item.data.premium_amount));
      setInsFreq(item.data.premium_frequency as any);
      setInsType(item.data.policy_type);
      setInsDate(item.data.renewal_date);
    } else if (item.type === 'income') {
      setIncTitle(item.data.title);
      setIncAmount(String(item.data.amount));
      setIncDate(item.data.date);
    } else if (item.type === 'budget') {
      setBudAllocated(String(item.data.allocated));
      setBudSpent(String(item.data.spent));
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setButtonState('loading');

    setTimeout(() => {
      if (item.type === 'subscription') {
        updateSubscription(item.data.id, {
          name: subName,
          amount: Number(subAmount),
          billing_cycle: subCycle,
          category: subCategory,
          next_renewal_date: subDate,
          logoKey: subLogoKey,
        });
      } else if (item.type === 'insurance') {
        updateInsurance(item.data.id, {
          policy_name: insName,
          provider: insProvider,
          coverage_amount: Number(insCoverage),
          premium_amount: Number(insPremium),
          premium_frequency: insFreq,
          policy_type: insType,
          renewal_date: insDate,
        });
      } else if (item.type === 'income') {
        updateIncomeSource?.(item.data.id, {
          title: incTitle,
          amount: Number(incAmount),
          date: incDate,
        } as any);
      } else if (item.type === 'budget') {
        updateBudgetItem(item.data.id, {
          allocated: Number(budAllocated),
          spent: Number(budSpent),
        });
      }

      setButtonState('success');
      setTimeout(() => {
        setButtonState('idle');
        onClose();
      }, 500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Edit {item.type === 'subscription' ? 'Subscription' : item.type === 'insurance' ? 'Insurance Policy' : item.type === 'income' ? 'Income Stream' : 'Budget Category'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {item.type === 'subscription' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service / Plan Name
                </label>
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={subAmount}
                    onChange={(e) => setSubAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Billing Cycle
                  </label>
                  <CustomSelect
                    options={[
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'yearly', label: 'Yearly' },
                    ]}
                    value={subCycle}
                    onChange={(val) => setSubCycle(val as any)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Next Renewal Date
                  </label>
                  <input
                    type="text"
                    value={subDate}
                    onChange={(e) => setSubDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {item.type === 'insurance' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Policy Name
                </label>
                <input
                  type="text"
                  value={insName}
                  onChange={(e) => setInsName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Provider
                  </label>
                  <input
                    type="text"
                    value={insProvider}
                    onChange={(e) => setInsProvider(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Premium Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={insPremium}
                    onChange={(e) => setInsPremium(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sum Insured (Cover ₹)
                  </label>
                  <input
                    type="number"
                    value={insCoverage}
                    onChange={(e) => setInsCoverage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Next Renewal Date
                  </label>
                  <input
                    type="text"
                    value={insDate}
                    onChange={(e) => setInsDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {item.type === 'budget' && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Budget Category
                </label>
                <p className="font-bold text-slate-900 dark:text-white py-1">{item.data.category}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Allocated Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={budAllocated}
                    onChange={(e) => setBudAllocated(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Spent (₹)
                  </label>
                  <input
                    type="number"
                    value={budSpent}
                    onChange={(e) => setBudSpent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <StatefulButton
              type="submit"
              state={buttonState}
              loadingText="Saving..."
              successText="Updated!"
              className="px-5 py-2 min-w-[125px]"
            >
              Save Changes
            </StatefulButton>
          </div>
        </form>
      </div>
    </div>
  );
};
