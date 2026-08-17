'use client';

import React from 'react';
import { ChatMessage, SpendingCategorySummary } from '@/types';
import { DhanMitrLogo } from '@/components/icons/CustomIcons';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  // Helper to format text with bold spans and custom SVGs
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      // Replace bold markers **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={lIdx} className={lIdx > 0 ? 'mt-2' : ''}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-extrabold text-slate-900 dark:text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      {/* Avatar */}
      {!isUser ? (
        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
          <DhanMitrLogo className="w-5 h-5" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
          R
        </div>
      )}

      {/* Message Bubble Content */}
      <div
        className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
          isUser
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-slate-900 dark:text-emerald-100 rounded-tr-xs'
            : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs rounded-tl-xs'
        }`}
      >
        {/* Text */}
        <div className="space-y-1">{renderFormattedText(message.text)}</div>

        {/* Embedded Interactive Expense Breakdown Widget */}
        {message.widgetType === 'expense_summary' && message.widgetData && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 rounded-xl space-y-2">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-200/60 dark:border-slate-700">
              श्रेणीवार मासिक खर्च सारांश (Category Breakdown):
            </div>
            <div className="space-y-1.5">
              {(message.widgetData as SpendingCategorySummary[]).map((cat) => (
                <div key={cat.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{cat.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400">({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-[10px] mt-2 font-medium text-slate-400 dark:text-slate-500 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {message.timestamp}
        </div>
      </div>
    </div>
  );
};
