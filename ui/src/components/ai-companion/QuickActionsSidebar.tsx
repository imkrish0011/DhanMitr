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
import { Plus, MessageSquare, Trash2, Clock } from 'lucide-react';

export const QuickActionsSidebar: React.FC = () => {
  const {
    triggerPrompt,
    sessions,
    activeSessionId,
    createNewChat,
    loadChatSession,
    deleteChatSession,
  } = useVoiceChat();
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
        <div className="flex-1 min-h-0 flex flex-col pt-1">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-mono font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Chat History</span>
              {sessions.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                  {sessions.length}
                </span>
              )}
            </h3>
            <button
              onClick={createNewChat}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
              title="Start a new chat conversation"
            >
              <Plus className="w-3 h-3" />
              <span>New</span>
            </button>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-56 pr-0.5 no-scrollbar">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const userMsgs = session.messages ? session.messages.filter((m) => m.sender === 'user').length : 0;
              const dateLabel = new Date(session.updatedAt || session.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={session.id}
                  onClick={() => loadChatSession(session.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
                      : 'bg-slate-500/[0.02] dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1 flex-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs leading-tight font-medium">
                        {session.title || 'New Conversation'}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block mt-0.5">
                        {dateLabel} {userMsgs > 0 ? `• ${userMsgs} Qs` : ''}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChatSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-500 rounded transition-all cursor-pointer shrink-0"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-bold">
          <SparkleSmallIcon className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 animate-pulse" />
          धनMitr AI Engine
        </span>
      </div>
    </aside>
  );
};
