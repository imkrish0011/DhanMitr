'use client';

import React from 'react';
import { useVoiceChat } from '@/context/VoiceChatContext';
import { useAuth } from '@/context/AuthContext';
import {
  InsightsIcon,
  TransactionsIcon,
  ShieldCheckIcon,
  BulbIcon,
  SparkleSmallIcon,
  LockIcon,
} from '@/components/icons/CustomIcons';

export const QuickActionsSidebar: React.FC = () => {
  const { triggerPrompt } = useVoiceChat();
  const { isAuthenticated, openAuthModal } = useAuth();

  const quickActions = [
    {
      id: 'spend',
      label: 'Analyze Spending',
      query: 'मेरे खर्चों का विश्लेषण करें',
      lang: 'hi' as const,
      icon: <InsightsIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      id: 'subs',
      label: 'Review Subscriptions',
      query: 'मेरे OTT और सब्सक्रिप्शन दिखाएं',
      lang: 'hi' as const,
      icon: <TransactionsIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    },
    {
      id: 'ins',
      label: 'Check Insurance',
      query: 'Check my insurance coverage and upcoming renewal dates',
      lang: 'en' as const,
      icon: <ShieldCheckIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
    },
    {
      id: 'invest',
      label: 'Investment Ideas',
      query: 'मेरे निवेश के लिए सुझाव दें',
      lang: 'hi' as const,
      icon: <BulbIcon className="w-4 h-4 text-amber-500" />,
    },
  ];

  const handleActionClick = (action: typeof quickActions[0]) => {
    if (!isAuthenticated) {
      openAuthModal(
        'signup',
        `Sign in or create an account to unlock ${action.label} and connect your live financial records.`
      );
      return;
    }
    triggerPrompt(action.query, action.lang);
  };

  return (
    <aside className="w-72 shrink-0 bg-white/70 dark:bg-[#070B14]/80 backdrop-blur-2xl border-l border-slate-200/80 dark:border-white/[0.08] p-5 flex flex-col justify-between hidden lg:flex select-none transition-colors duration-200">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-mono font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Quick Actions</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            {!isAuthenticated && (
              <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-lg shadow-2xs">
                <LockIcon className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Locked</span>
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all text-left group cursor-pointer border ${
                  isAuthenticated
                    ? 'border-slate-200/80 dark:border-white/10 bg-slate-500/[0.03] hover:bg-emerald-500/10 dark:bg-white/[0.02] dark:hover:bg-emerald-500/15 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-300 hover:border-emerald-500/30'
                    : 'border-slate-200/60 dark:border-white/[0.06] bg-slate-500/[0.02] dark:bg-white/[0.01] text-slate-400 dark:text-slate-500 opacity-80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    {action.icon}
                  </div>
                  <span className="font-medium">{action.label}</span>
                </div>

                {!isAuthenticated && (
                  <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-amber-500 transition-colors" title="Sign in to unlock">
                    <LockIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Conversations / Chat History */}
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3">
            Chat History
          </h3>

          {!isAuthenticated ? (
            <div
              onClick={() => openAuthModal('signup', 'Sign in to save and synchronize your conversation history.')}
              className="p-4 bg-slate-500/[0.03] dark:bg-white/[0.02] rounded-2xl text-center space-y-2.5 cursor-pointer border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 transition-colors shadow-2xs"
            >
              <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
                <LockIcon className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">History Disabled</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                  Sign in to save, sync, and resume your financial discussions across devices.
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAuthModal('login');
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white rounded-xl text-[11px] font-bold cursor-pointer inline-block shadow-xs transition-all"
              >
                Sign In to Save
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-500/[0.03] dark:bg-white/[0.02] rounded-2xl text-center border border-slate-200/80 dark:border-white/10 shadow-2xs">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Current session active</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Your questions and AI responses are automatically preserved.</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <SparkleSmallIcon className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 animate-pulse" />
          DhanMITR AI Engine
        </span>
      </div>
    </aside>
  );
};
