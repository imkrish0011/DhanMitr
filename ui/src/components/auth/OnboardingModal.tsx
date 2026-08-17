'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DhanMitrLogo, SparkleSmallIcon } from '@/components/icons/CustomIcons';
import { EmploymentType, RiskTolerance, TaxRegime } from '@/types';
import { StatefulButton, ButtonState } from '@/components/ui/StatefulButton';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, profile, saveOnboardingProfile, closeOnboarding } = useAuth();

  const [name, setName] = useState(profile?.name || '');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyExpenses, setMonthlyExpenses] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('salaried');
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('moderate');
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('new');
  const [emergencyFund, setEmergencyFund] = useState('');
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (profile?.name && !name) {
      setName(profile.name);
    }
  }, [profile]);

  if (!isOnboardingOpen) return null;

  const handleFinish = async (skipOptional: boolean = false) => {
    setError(null);
    if (!name.trim()) {
      setError('Please enter your Name (Mandatory).');
      return;
    }

    setButtonState('loading');

    try {
      await saveOnboardingProfile({
        name: name.trim(),
        monthly_income: skipOptional ? 0 : Number(monthlyIncome) || 0,
        monthly_expenses: skipOptional ? 0 : Number(monthlyExpenses) || 0,
        employment_type: skipOptional ? 'salaried' : employmentType,
        risk_tolerance: skipOptional ? 'moderate' : riskTolerance,
        tax_regime: skipOptional ? 'new' : taxRegime,
        emergency_fund_balance: skipOptional ? 0 : Number(emergencyFund) || 0,
      });

      setButtonState('success');
      setTimeout(() => {
        setButtonState('idle');
      }, 500);
    } catch (err: any) {
      setButtonState('error');
      setError('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <DhanMitrLogo className="w-6 h-6" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Welcome to Dhan<span className="text-emerald-500 font-extrabold">MITR</span>
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            Set Up Your Financial Profile
            <SparkleSmallIcon className="w-4 h-4 text-emerald-500 fill-emerald-400" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Name is mandatory. All other financial details are optional and can be filled later or skipped.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Mandatory Name */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl">
            <label className="block font-bold text-slate-900 dark:text-white mb-1">
              Your Full Name <span className="text-emerald-600 font-extrabold">* (Mandatory)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-emerald-500 font-bold"
              required
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Optional Financial Details
              </span>
              <span className="text-[10px] text-slate-400 italic">Can be skipped</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Income (₹) <span className="text-slate-400 text-[10px]">(Optional)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 65000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Expenses (₹) <span className="text-slate-400 text-[10px]">(Optional)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 35000"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Employment Type <span className="text-slate-400 text-[10px]">(Optional)</span>
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="salaried">Salaried Employee</option>
                  <option value="self_employed">Self Employed / Business</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="student">Student</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Risk Tolerance <span className="text-slate-400 text-[10px]">(Optional)</span>
                </label>
                <select
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="conservative">Conservative (Low Risk)</option>
                  <option value="moderate">Moderate (Balanced)</option>
                  <option value="aggressive">Aggressive (High Growth)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tax Regime <span className="text-slate-400 text-[10px]">(Optional)</span>
                </label>
                <select
                  value={taxRegime}
                  onChange={(e) => setTaxRegime(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="new">New Tax Regime</option>
                  <option value="old">Old Tax Regime</option>
                  <option value="not_applicable">Not Applicable</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Fund (₹) <span className="text-slate-400 text-[10px]">(Optional)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  value={emergencyFund}
                  onChange={(e) => setEmergencyFund(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => handleFinish(true)}
            className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold transition-colors"
          >
            Skip optional details
          </button>

          <StatefulButton
            type="button"
            onClick={() => handleFinish(false)}
            state={buttonState}
            loadingText="Saving..."
            successText="All Set!"
            className="px-6 py-2.5 text-xs font-bold shadow-md shadow-emerald-900/20"
          >
            Save & Unlock Hub
          </StatefulButton>
        </div>
      </div>
    </div>
  );
};
