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
        <p key={lIdx} className={lIdx > 0 ? 'mt-1' : ''}>
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
    <div className={`flex items-start gap-2 sm:gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-2.5`}>
      {/* Compact Tactile Neumorphic Avatar */}
      {!isUser ? (
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full neumorph-chip flex items-center justify-center shrink-0 mt-0.5">
          <DhanMitrLogo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      ) : (
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full neumorph-btn-emerald text-white font-extrabold text-[10px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">
          R
        </div>
      )}

      {/* Message Bubble Content: Compact & Proportional */}
      <div
        className={`text-xs sm:text-[13px] leading-snug transition-all ${
          isUser
            ? 'max-w-[78%] sm:max-w-md px-3 py-1.5 sm:px-3.5 sm:py-2 neumorph-bubble-user text-white rounded-xl rounded-tr-xs'
            : 'max-w-[85%] sm:max-w-lg px-3.5 py-2 sm:px-4 sm:py-2.5 neumorph-bubble-assistant text-slate-800 dark:text-slate-100 rounded-xl rounded-tl-xs'
        }`}
      >
        {/* Formatted Text */}
        <div className="space-y-1">{renderFormattedText(message.text)}</div>

        {/* Embedded Interactive Expense Breakdown Widget: Compact Sunken Container */}
        {message.widgetType === 'expense_summary' && message.widgetData && (
          <div className="mt-2 p-2.5 neumorph-inset rounded-lg space-y-1.5 border border-slate-200/50 dark:border-slate-800/50">
            <div className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-300/40 dark:border-slate-700/60">
              श्रेणीवार मासिक खर्च सारांश (Category Breakdown):
            </div>
            <div className="space-y-1">
              {(message.widgetData as SpendingCategorySummary[]).map((cat) => (
                <div key={cat.id} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shadow-xs" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      ₹{cat.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium">({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
