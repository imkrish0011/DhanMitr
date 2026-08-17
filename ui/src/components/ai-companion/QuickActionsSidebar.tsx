'use client';

import React from 'react';
import { useVoiceChat } from '@/context/VoiceChatContext';
import {
  InsightsIcon,
  TransactionsIcon,
  ShieldCheckIcon,
  BulbIcon,
} from '@/components/icons/CustomIcons';

export const QuickActionsSidebar: React.FC = () => {
  const { triggerPrompt } = useVoiceChat();

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

  const recentConversations = [
    { id: '1', title: 'Savings plan', time: 'Today', active: true },
    { id: '2', title: 'Subscription review', time: 'Yesterday', active: false },
    { id: '3', title: 'Tax saving options', time: '2 days ago', active: false },
    { id: '4', title: 'Emergency fund', time: '3 days ago', active: false },
  ];

  return (
    <aside className="w-72 shrink-0 bg-white dark:bg-[#0B101B] border-l border-slate-200/80 dark:border-slate-800/80 p-5 flex flex-col justify-between hidden lg:flex select-none">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => triggerPrompt(action.query, action.lang)}
                className="w-full flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/70 dark:border-slate-700/60 hover:border-emerald-200 dark:hover:border-emerald-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-2xs transition-transform">
                  {action.icon}
                </div>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3">
            Recent Conversations
          </h3>
          <div className="space-y-1.5">
            {recentConversations.map((item) => (
              <div
                key={item.id}
                onClick={() => triggerPrompt(`Review our discussion about ${item.title}`)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                  item.active
                    ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{item.title}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.time}</p>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
        <button
          onClick={() => alert('Viewing conversation archives')}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          View all conversations
        </button>
      </div>
    </aside>
  );
};
