'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { BillingCycle, InsuranceType, TransactionCategory } from '@/types';

interface AddFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFinanceModal: React.FC<AddFinanceModalProps> = ({ isOpen, onClose }) => {
  const { addSubscription, addInsurance, addIncomeSource, addTransaction } = useFinance();
  const [activeType, setActiveType] = useState<'subscription' | 'insurance' | 'income' | 'expense'>('subscription');

  // Subscription form fields
  const [subName, setSubName] = useState('');
  const [subProvider, setSubProvider] = useState('');
  const [subLogoKey, setSubLogoKey] = useState<'netflix' | 'amazon_prime' | 'spotify' | 'hotstar' | 'youtube' | 'apple' | 'chatgpt' | 'claude' | 'sonyliv' | 'other'>('netflix');
  const [subAmount, setSubAmount] = useState('');
  const [subCycle, setSubCycle] = useState<BillingCycle>('monthly');
  const [subCategory, setSubCategory] = useState('Entertainment');
  const [subDate, setSubDate] = useState('28 Aug 2026');

  // Insurance form fields
  const [insName, setInsName] = useState('');
  const [insProvider, setInsProvider] = useState('HDFC Life Insurance');
  const [insLogoKey, setInsLogoKey] = useState<'hdfc_life' | 'star_health' | 'icici_lombard' | 'other'>('hdfc_life');
  const [insType, setInsType] = useState<InsuranceType>('term_life');
  const [insCoverage, setInsCoverage] = useState('');
  const [insPremium, setInsPremium] = useState('');
  const [insFreq, setInsFreq] = useState<'monthly' | 'yearly'>('yearly');
  const [insPolicyNo, setInsPolicyNo] = useState('');
  const [insDate, setInsDate] = useState('15 Sep 2026');

  // Income form fields
  const [incTitle, setIncTitle] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incFreq, setIncFreq] = useState<'monthly' | 'one_time'>('monthly');

  // Expense form fields
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<TransactionCategory>('utilities');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeType === 'subscription') {
      if (!subName || !subAmount) return;
      addSubscription({
        name: subName,
        provider: subProvider || subName,
        logoKey: subLogoKey,
        planName: `${subCycle === 'monthly' ? 'Monthly' : 'Annual'} Plan`,
        amount: Number(subAmount),
        currency: 'INR',
        billing_cycle: subCycle,
        category: subCategory,
        next_renewal_date: subDate,
        is_urgent: false,
        is_active: true,
      });
    } else if (activeType === 'insurance') {
      if (!insName || !insPremium) return;
      addInsurance({
        policy_name: insName,
        provider: insProvider,
        logoKey: insLogoKey,
        policy_type: insType,
        policy_number: insPolicyNo || `POL-${Math.floor(100000 + Math.random() * 900000)}`,
        coverage_amount: Number(insCoverage) || 1000000,
        premium_amount: Number(insPremium),
        premium_frequency: insFreq,
        renewal_date: insDate,
        is_urgent: false,
        is_active: true,
      });
    } else if (activeType === 'income') {
      if (!incTitle || !incAmount) return;
      addIncomeSource({
        title: incTitle,
        amount: Number(incAmount),
        frequency: incFreq,
        category: 'salary',
        date: '01 of every month',
      });
    } else if (activeType === 'expense') {
      if (!expTitle || !expAmount) return;
      addTransaction({
        title: expTitle,
        amount: Number(expAmount),
        currency: 'INR',
        type: 'expense',
        category: expCategory,
        date: 'Today',
        account_name: 'Primary Account',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Add Financial Record
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 p-2 bg-slate-100 dark:bg-slate-800/80 gap-1 text-xs font-semibold">
          {[
            { id: 'subscription', label: 'OTT / Sub' },
            { id: 'insurance', label: 'Insurance' },
            { id: 'income', label: 'Income' },
            { id: 'expense', label: 'Expense' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id as any)}
              className={`py-2 rounded-xl transition-all ${
                activeType === tab.id
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {activeType === 'subscription' && (
            <>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Service / Platform Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Disney+ Hotstar, Netflix, Spotify"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Platform Logo
                  </label>
                  <select
                    value={subLogoKey}
                    onChange={(e) => setSubLogoKey(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="netflix">Netflix</option>
                    <option value="amazon_prime">Amazon Prime</option>
                    <option value="spotify">Spotify</option>
                    <option value="hotstar">Disney+ Hotstar</option>
                    <option value="youtube">YouTube Premium</option>
                    <option value="apple">Apple One</option>
                    <option value="chatgpt">ChatGPT Plus</option>
                    <option value="claude">Claude Pro</option>
                    <option value="sonyliv">Sony LIV</option>
                    <option value="other">Other / Utility</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Billing Cycle
                  </label>
                  <select
                    value={subCycle}
                    onChange={(e) => setSubCycle(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 499"
                    value={subAmount}
                    onChange={(e) => setSubAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Renewal Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 28 Aug 2026"
                    value={subDate}
                    onChange={(e) => setSubDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {activeType === 'insurance' && (
            <>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Policy Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Max Life Term Plan Plus"
                  value={insName}
                  onChange={(e) => setInsName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Provider
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Life, Star Health"
                    value={insProvider}
                    onChange={(e) => setInsProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Policy Type
                  </label>
                  <select
                    value={insType}
                    onChange={(e) => setInsType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="term_life">Term Life</option>
                    <option value="health">Health Insurance</option>
                    <option value="motor">Motor / Vehicle</option>
                    <option value="home">Home Insurance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Sum Insured Cover (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 10000000 (1 Cr)"
                    value={insCoverage}
                    onChange={(e) => setInsCoverage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Premium Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1800"
                    value={insPremium}
                    onChange={(e) => setInsPremium(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {activeType === 'income' && (
            <>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Income Source Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Salary, Freelance Design"
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 65000"
                  value={incAmount}
                  onChange={(e) => setIncAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </>
          )}

          {activeType === 'expense' && (
            <>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Expense Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grocery store, Broadband"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1200"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="housing">Housing</option>
                    <option value="investments">Investments</option>
                    <option value="utilities">Bills & Utilities</option>
                    <option value="subscriptions">Subscriptions</option>
                    <option value="insurance">Insurance</option>
                    <option value="dining">Food & Dining</option>
                    <option value="other">Others</option>
                  </select>
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
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold rounded-xl shadow-xs transition-all"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
