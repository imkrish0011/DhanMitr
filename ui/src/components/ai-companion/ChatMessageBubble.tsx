'use client';

import React, { useState } from 'react';
import { ChatMessage, SpendingCategorySummary, KnowledgeSource } from '@/types';
import { DhanMitrLogo } from '@/components/icons/CustomIcons';
import { useVoiceChat } from '@/context/VoiceChatContext';
import { SourceCitationModal } from './SourceCitationModal';
import {
  Copy,
  Check,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
} from 'lucide-react';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const { speakText } = useVoiceChat();

  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReplay = () => {
    speakText(message.text, message.language);
  };

  const handleOpenSource = (source: KnowledgeSource) => {
    setSelectedSource(source);
    setIsSourceModalOpen(true);
  };

  // Helper to render plain text with paragraph breaks and line-by-line layout
  const renderFormattedText = (text: string): React.ReactNode => {
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      if (!line.trim()) {
        return <div key={lIdx} className="h-1.5" />;
      }
      return (
        <p key={lIdx} className={lIdx > 0 ? 'mt-0.5' : ''}>
          {line}
        </p>
      );
    });
  };

  return (
    <>
      <div className={`flex items-start gap-2 sm:gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-3 group`}>
        {/* Compact Tactile Neumorphic Avatar */}
        {!isUser ? (
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full neumorph-chip flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <DhanMitrLogo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        ) : (
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full neumorph-btn-emerald text-white font-extrabold text-[10px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            U
          </div>
        )}

        {/* Message Bubble Content: Compact & Proportional */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-xl`}>
          <div
            className={`text-xs sm:text-[13px] leading-snug transition-all ${
              isUser
                ? 'px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl rounded-tr-xs shadow-md border border-emerald-400/20'
                : 'px-4 py-3 bg-[#111A2C] border border-slate-700/60 text-slate-100 rounded-2xl rounded-tl-xs shadow-md'
            }`}
          >
            {/* Formatted Text with Streaming Cursor */}
            {message.isStreaming && !message.text ? (
              <div className="flex items-center gap-1.5 py-1 text-slate-500 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[11px] font-medium ml-1">Analyzing...</span>
              </div>
            ) : (
              <div className="space-y-1">
                {renderFormattedText(message.text)}
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-3.5 bg-emerald-500 rounded-xs animate-pulse ml-0.5 align-middle" />
                )}
              </div>
            )}

            {/* Embedded Interactive Expense Breakdown Widget */}
            {message.widgetType === 'expense_summary' && Array.isArray(message.widgetData) && (
              <div className="mt-2.5 p-2.5 neumorph-inset rounded-xl space-y-1.5 border border-slate-200/50 dark:border-slate-800/50">
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

            {/* RAG Source Citation Badges / Pills (Only shown after response has finished generating) */}
            {!message.isStreaming && Boolean(message.text?.trim()) && message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  <BookOpen className="w-3 h-3 text-emerald-500" />
                  <span>Verified Citations & Guidelines:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {message.sources.map((source, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOpenSource(source)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:scale-102"
                      title="Click to view verified source and guidelines"
                    >
                      <span>📌</span>
                      <span className="truncate max-w-[200px]">{source.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Bar (Only for Assistant messages when completed) */}
          {!isUser && !message.isStreaming && Boolean(message.text?.trim()) && (
            <div className="flex items-center gap-1 mt-1 px-1 text-slate-400 dark:text-slate-500">
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title={copied ? 'Copied to clipboard' : 'Copy message text'}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {/* TTS Replay Button */}
              <button
                onClick={handleReplay}
                className="p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                title="Read message aloud"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>

              {/* Thumbs Up Feedback */}
              <button
                onClick={() => setFeedback(feedback === 'liked' ? null : 'liked')}
                className={`p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                  feedback === 'liked' ? 'text-emerald-500 font-bold' : 'hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Helpful response"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              {/* Thumbs Down Feedback */}
              <button
                onClick={() => setFeedback(feedback === 'disliked' ? null : 'disliked')}
                className={`p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                  feedback === 'disliked' ? 'text-rose-500 font-bold' : 'hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Not helpful response"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              {message.timestamp && (
                <span className="text-[9.5px] text-slate-400 ml-1.5 select-none">
                  {message.timestamp}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Source Citation Modal */}
      <SourceCitationModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        source={selectedSource}
      />
    </>
  );
};

