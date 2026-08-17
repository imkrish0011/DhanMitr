'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  DhanMitrLogo,
  ShieldCheckIcon,
  SparklesIcon,
  WalletIcon,
  TrendingUpIcon,
  LockIcon,
} from '@/components/icons/CustomIcons';

interface LockedFeatureViewProps {
  featureName?: string;
}

export const LockedFeatureView: React.FC<LockedFeatureViewProps> = ({
  featureName = 'Personal Finance Hub',
}) => {
  const { openAuthModal } = useAuth();

  const benefits = [
    {
      icon: <WalletIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: 'Real-time Income & Spending Breakdown',
      description: 'Track cashflows, categorized budget caps, and dynamic savings rates.',
    },
    {
      icon: <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: 'OTT Subscriptions & Insurance Tracker',
      description: 'Never miss a renewal with automated alerts and renewal countdowns.',
    },
    {
      icon: <TrendingUpIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      title: 'Secure Cloud Sync with Supabase',
      description: 'Your financial records stay safe, encrypted, and accessible anywhere.',
    },
    {
      icon: <SparklesIcon className="w-5 h-5 text-amber-500" />,
      title: 'Unlimited AI Financial Companion',
      description: 'Bilingual voice and chat assistant tailored to your real financial data.',
    },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-6 md:p-12 min-h-[calc(100vh-4rem)] select-none">
      <div className="max-w-xl w-full bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Animated Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <DhanMitrLogo className="w-9 h-9" />
        </div>

        {/* Headline */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-200 dark:border-emerald-800">
            <LockIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Locked Feature</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Unlock {featureName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            Create a free account or sign in to connect your financial life, manage recurring renewals, and get personalized AI insights.
          </p>
        </div>

        {/* Benefits List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-start gap-3"
            >
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shrink-0 border border-slate-200/70 dark:border-slate-700">
                {b.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{b.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal('signup', `Create a free account to unlock ${featureName}.`)}
            className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            Create Free Account
          </button>
          <button
            onClick={() => openAuthModal('login', `Sign in to access your ${featureName}.`)}
            className="w-full sm:w-auto px-8 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
