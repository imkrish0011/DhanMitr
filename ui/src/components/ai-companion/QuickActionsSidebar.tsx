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
    <aside className="w-72 shrink-0 bg-[#EBF0F7] dark:bg-[#0B101D] border-l border-slate-200/60 dark:border-slate-800/60 p-5 flex flex-col justify-between hidden lg:flex select-none transition-colors duration-300">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Quick Actions
            </h3>
            {!isAuthenticated && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5 neumorph-chip px-2 py-0.5 rounded-md">
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
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all text-left group cursor-pointer ${
                  isAuthenticated
                    ? 'neumorph-chip text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400'
                    : 'neumorph-chip text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 opacity-80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg neumorph-btn flex items-center justify-center">
                    {action.icon}
                  </div>
                  <span>{action.label}</span>
                </div>

                {!isAuthenticated && (
                  <div className="p-1 rounded-md neumorph-inset text-slate-400 group-hover:text-emerald-500 transition-colors" title="Sign in to unlock">
                    <LockIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Conversations / Chat History */}
        <div>
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-3">
            Chat History
          </h3>

          {!isAuthenticated ? (
            <div
              onClick={() => openAuthModal('signup', 'Sign in to save and synchronize your conversation history.')}
              className="p-4 neumorph-inset rounded-2xl text-center space-y-2.5 cursor-pointer border border-slate-200/50 dark:border-slate-800/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full neumorph-btn flex items-center justify-center mx-auto text-slate-400">
                <LockIcon className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">History Disabled</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                  Sign in to save, sync, and resume your financial discussions across devices.
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAuthModal('login');
                }}
                className="px-3.5 py-1.5 neumorph-btn-emerald text-white rounded-xl text-[11px] font-bold cursor-pointer inline-block"
              >
                Sign In to Save
              </button>
            </div>
          ) : (
            <div className="p-4 neumorph-inset rounded-2xl text-center border border-slate-200/50 dark:border-slate-800/50">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Current session active</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Your questions and AI responses are automatically preserved.</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
          <SparkleSmallIcon className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
          DhanMITR AI Engine
        </span>
      </div>
    </aside>
  );
};
