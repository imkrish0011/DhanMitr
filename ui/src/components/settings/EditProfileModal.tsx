'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { StatefulButton, ButtonState } from '@/components/ui/StatefulButton';
import { EmploymentType, RiskTolerance, TaxRegime } from '@/types';
import {
  User,
  Sliders,
  X,
  Briefcase,
  Building,
  Laptop,
  GraduationCap,
  Palmtree,
  ShieldCheck,
  Scale,
  Rocket,
  Sparkles,
  FileText,
  XSquare,
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, saveOnboardingProfile } = useAuth();

  const [name, setName] = useState(profile?.name || '');
  const [monthlyIncome, setMonthlyIncome] = useState(
    profile?.monthly_income ? String(profile.monthly_income) : ''
  );
  const [monthlyExpenses, setMonthlyExpenses] = useState(
    profile?.monthly_expenses ? String(profile.monthly_expenses) : ''
  );
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    profile?.employment_type || 'salaried'
  );
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>(
    profile?.risk_tolerance || 'moderate'
  );
  const [taxRegime, setTaxRegime] = useState<TaxRegime>(
    profile?.tax_regime || 'new'
  );
  const [emergencyFund, setEmergencyFund] = useState(
    profile?.emergency_fund_balance ? String(profile.emergency_fund_balance) : ''
  );

  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && profile) {
      setName(profile.name || '');
      setMonthlyIncome(profile.monthly_income ? String(profile.monthly_income) : '');
      setMonthlyExpenses(profile.monthly_expenses ? String(profile.monthly_expenses) : '');
      setEmploymentType(profile.employment_type || 'salaried');
      setRiskTolerance(profile.risk_tolerance || 'moderate');
      setTaxRegime(profile.tax_regime || 'new');
      setEmergencyFund(profile.emergency_fund_balance ? String(profile.emergency_fund_balance) : '');
      setError(null);
      setButtonState('idle');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setButtonState('loading');
    setError(null);

    const updatedData = {
      name: name.trim(),
      monthly_income: monthlyIncome ? Number(monthlyIncome) : 0,
      monthly_expenses: monthlyExpenses ? Number(monthlyExpenses) : 0,
      emergency_fund_balance: emergencyFund ? Number(emergencyFund) : 0,
      employment_type: employmentType,
      risk_tolerance: riskTolerance,
      tax_regime: taxRegime,
      is_onboarded: true,
    };

    try {
      await saveOnboardingProfile(updatedData);
      setButtonState('success');
      setTimeout(() => {
        setButtonState('idle');
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
      setButtonState('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Edit Financial Profile
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Update your identity, income, risk appetite, and tax regime.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name <span className="text-emerald-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Krish Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white focus:outline-emerald-500"
                required
              />
            </div>
          </div>

          {/* Monthly Income & Expenses */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Income (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 75000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Expenses (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 35000"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white focus:outline-emerald-500"
              />
            </div>
          </div>

          {/* Employment Type & Risk Tolerance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Employment Status
              </label>
              <CustomSelect
                options={[
                  { value: 'salaried', label: 'Salaried Employee', icon: <Briefcase className="w-3.5 h-3.5 text-blue-500" /> },
                  { value: 'self_employed', label: 'Self Employed', icon: <Building className="w-3.5 h-3.5 text-emerald-500" /> },
                  { value: 'freelancer', label: 'Freelancer', icon: <Laptop className="w-3.5 h-3.5 text-purple-500" /> },
                  { value: 'student', label: 'Student', icon: <GraduationCap className="w-3.5 h-3.5 text-amber-500" /> },
                  { value: 'retired', label: 'Retired', icon: <Palmtree className="w-3.5 h-3.5 text-teal-500" /> },
                ]}
                value={employmentType}
                onChange={(val) => setEmploymentType(val as any)}
                direction="auto"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Risk Tolerance
              </label>
              <CustomSelect
                options={[
                  { value: 'conservative', label: 'Conservative (Low)', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> },
                  { value: 'moderate', label: 'Moderate (Balanced)', icon: <Scale className="w-3.5 h-3.5 text-blue-500" /> },
                  { value: 'aggressive', label: 'Aggressive (Growth)', icon: <Rocket className="w-3.5 h-3.5 text-rose-500" /> },
                ]}
                value={riskTolerance}
                onChange={(val) => setRiskTolerance(val as any)}
                direction="auto"
              />
            </div>
          </div>

          {/* Tax Regime & Emergency Fund */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tax Regime
              </label>
              <CustomSelect
                options={[
                  { value: 'new', label: 'New Tax Regime', icon: <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> },
                  { value: 'old', label: 'Old Tax Regime', icon: <FileText className="w-3.5 h-3.5 text-amber-500" /> },
                  { value: 'not_applicable', label: 'Not Applicable', icon: <XSquare className="w-3.5 h-3.5 text-slate-400" /> },
                ]}
                value={taxRegime}
                onChange={(val) => setTaxRegime(val as any)}
                direction="up"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Fund Target (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 150000"
                value={emergencyFund}
                onChange={(e) => setEmergencyFund(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <StatefulButton
              type="submit"
              state={buttonState}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Save Changes
            </StatefulButton>
          </div>
        </form>
      </div>
    </div>
  );
};
