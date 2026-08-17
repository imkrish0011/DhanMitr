'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RiskTolerance } from '@/types';
import { StatefulButton, ButtonState } from '@/components/ui/StatefulButton';
import {
  Scale,
  ShieldCheck,
  Rocket,
  CheckCircle2,
  X,
  PieChart,
  Shield,
  Zap,
} from 'lucide-react';

interface EditRiskToleranceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditRiskToleranceModal: React.FC<EditRiskToleranceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, saveOnboardingProfile } = useAuth();
  const [selectedRisk, setSelectedRisk] = useState<RiskTolerance>(
    profile?.risk_tolerance || 'moderate'
  );
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && profile) {
      setSelectedRisk(profile.risk_tolerance || 'moderate');
      setError(null);
      setButtonState('idle');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setButtonState('loading');
    setError(null);

    try {
      await saveOnboardingProfile({
        name: profile?.name || 'User',
        monthly_income: profile?.monthly_income || 0,
        monthly_expenses: profile?.monthly_expenses || 0,
        emergency_fund_balance: profile?.emergency_fund_balance || 0,
        employment_type: profile?.employment_type || 'salaried',
        risk_tolerance: selectedRisk,
        tax_regime: profile?.tax_regime || 'new',
        is_onboarded: true,
      });

      setButtonState('success');
      setTimeout(() => {
        setButtonState('idle');
        onClose();
      }, 400);
    } catch (err: any) {
      setError(err?.message || 'Failed to update risk appetite');
      setButtonState('error');
    }
  };

  const riskOptions = [
    {
      id: 'conservative' as RiskTolerance,
      title: 'Conservative',
      badge: 'Capital Preservation',
      icon: ShieldCheck,
      color: 'emerald',
      description:
        'Focuses on capital safety, fixed returns, and high liquidity with minimal exposure to market dips.',
      allocation: [
        { label: 'Debt & FDs', pct: '70%', color: 'bg-emerald-500' },
        { label: 'Gold / SGB', pct: '20%', color: 'bg-amber-500' },
        { label: 'Large Cap Index', pct: '10%', color: 'bg-blue-500' },
      ],
      targetHorizon: '1 - 3 Years',
    },
    {
      id: 'moderate' as RiskTolerance,
      title: 'Moderate',
      badge: 'Balanced Growth',
      icon: Scale,
      color: 'blue',
      description:
        'Balanced multi-asset allocation targeting steady capital compounding with moderate equity exposure.',
      allocation: [
        { label: 'Equity & Index', pct: '60%', color: 'bg-blue-500' },
        { label: 'Debt & Bonds', pct: '25%', color: 'bg-teal-500' },
        { label: 'Gold & Assets', pct: '15%', color: 'bg-amber-500' },
      ],
      targetHorizon: '3 - 7 Years',
    },
    {
      id: 'aggressive' as RiskTolerance,
      title: 'Aggressive',
      badge: 'Wealth Multiplier',
      icon: Rocket,
      color: 'rose',
      description:
        'High equity and growth asset exposure targeting inflation-beating alpha with acceptance of volatility.',
      allocation: [
        { label: 'Mid/Small & Index', pct: '85%', color: 'bg-rose-500' },
        { label: 'Crypto & Alternates', pct: '10%', color: 'bg-purple-500' },
        { label: 'Liquid Buffer', pct: '5%', color: 'bg-emerald-500' },
      ],
      targetHorizon: '7+ Years',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Adjust Risk Tolerance Appetite
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Choose the investment strategy matching your volatility comfort.
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {riskOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedRisk === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedRisk(opt.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none relative ${
                    isSelected
                      ? 'bg-slate-50 dark:bg-[#0B101D] border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white dark:bg-[#0F172A] border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                            {opt.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            {opt.badge}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Ideal Horizon: {opt.targetHorizon}
                        </span>
                      </div>
                    </div>

                    <div className="pt-0.5 shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-transparent'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 fill-current text-white stroke-emerald-500" />}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                    {opt.description}
                  </p>

                  {/* Asset Allocation Pill Meter */}
                  <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <PieChart className="w-3 h-3 text-slate-400" />
                      Model Asset Allocation:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {opt.allocation.map((alloc) => (
                        <div key={alloc.label} className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${alloc.color}`} />
                          <span>
                            {alloc.label} ({alloc.pct})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <StatefulButton
            type="button"
            state={buttonState}
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs cursor-pointer"
          >
            Apply Risk Strategy
          </StatefulButton>
        </div>
      </div>
    </div>
  );
};
