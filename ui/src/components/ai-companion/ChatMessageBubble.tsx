'use client';

import React, { useState } from 'react';
import { ChatMessage, SpendingCategorySummary, KnowledgeSource } from '@/types';
import { DhanMitrLogo } from '@/components/icons/CustomIcons';
import { useVoiceChat } from '@/context/VoiceChatContext';
import { SourceCitationModal } from './SourceCitationModal';
import { LatticeLoader } from '@/components/ui/LatticeLoader';
import { StreamingResponse } from '@/components/agents/streaming-response';
import { CitationItem } from '@/components/agents/citations';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const { speakText } = useVoiceChat();

  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

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

  // Map backend KnowledgeSources to CitationItems for StreamingResponse
  const citationItems: CitationItem[] = (message.sources || []).map((source, idx) => ({
    id: `source-${idx}-${source.title.replace(/\s+/g, '-').toLowerCase()}`,
    title: source.title,
    domain: source.source_type,
    url: source.url,
    snippet: source.snippet,
  }));

  // Show thinking header for assistant messages that are currently streaming or completed with recorded elapsed time
  const showThinking = !isUser && (message.isStreaming || message.elapsed != null);

  return (
    <>
      <div className={`flex items-start gap-2 sm:gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-3 group w-full max-w-full min-w-0`}>
        {/* Modern Avatar */}
        {!isUser ? (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <DhanMitrLogo className="w-5 h-4" />
          </div>
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            U
          </div>
        )}

        {/* Message Bubble Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-xl min-w-0 flex-1`}>
          <div
            className={`text-xs sm:text-[13px] leading-relaxed break-words [overflow-wrap:anywhere] min-w-0 transition-all ${
              isUser
                ? 'px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl rounded-tr-xs shadow-sm font-medium'
                : 'px-3.5 sm:px-5 py-3 sm:py-3.5 fintech-card text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-xs shadow-sm w-full max-w-full'
            }`}
          >
            {isUser ? (
              <div className="space-y-1 break-words [overflow-wrap:anywhere] min-w-0">
                {renderFormattedText(message.text)}
              </div>
            ) : (
              <>
                {/* LatticeLoader Thinking Animation Header */}
                {showThinking && (
                  <div className={`flex items-center text-slate-500 dark:text-slate-400 ${message.text ? 'pb-2.5 mb-2.5 border-b border-slate-200/60 dark:border-slate-800/60' : 'py-0.5'}`}>
                    <LatticeLoader
                      status={message.isStreaming ? 'working' : message.isError ? 'error' : 'done'}
                      label="Thinking"
                      doneLabel="Done in"
                      errorLabel="Failed after"
                      pattern="orbit"
                      grid={3}
                      shape="round"
                      doneColor="#10B981"
                      errorColor="#ef4444"
                      cellSize={5.5}
                      gap={2}
                      fontSize={12.5}
                      step={90}
                      idleOpacity={0.16}
                      glow={false}
                      showTimer
                      elapsed={message.elapsed}
                    />
                  </div>
                )}

                {/* Streaming Response Content & Action Footer */}
                {Boolean(message.text) && (
                  <StreamingResponse
                    status={message.isStreaming ? 'streaming' : message.isError ? 'error' : 'complete'}
                    copyText={message.text}
                    onRetry={handleReplay}
                    sources={citationItems}
                    feedback={feedback === 'liked' ? 'up' : feedback === 'disliked' ? 'down' : null}
                    onFeedbackChange={(fb) => setFeedback(fb === 'up' ? 'liked' : fb === 'down' ? 'disliked' : null)}
                  >
                    <div className="space-y-1 break-words [overflow-wrap:anywhere] min-w-0 max-w-full">
                      {renderFormattedText(message.text)}
                      {message.isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 bg-emerald-500 rounded-xs animate-pulse ml-0.5 align-middle" />
                      )}
                    </div>

                    {/* Embedded Interactive Expense Breakdown Widget */}
                    {message.widgetType === 'expense_summary' && Array.isArray(message.widgetData) && (
                      <div className="mt-2.5 p-3 bg-slate-50 dark:bg-[#0B101D] rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-800">
                        <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-200 dark:border-slate-800">
                          श्रेणीवार मासिक खर्च सारांश (Category Breakdown):
                        </div>
                        <div className="space-y-1">
                          {(message.widgetData as SpendingCategorySummary[]).map((cat) => (
                            <div key={cat.id} className="flex items-center justify-between text-xs">
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
                  </StreamingResponse>
                )}
              </>
            )}
          </div>

          {/* Timestamp for user messages or legacy messages */}
          {message.timestamp && isUser && (
            <span className="text-[9.5px] text-slate-400 mt-1 px-1 select-none">
              {message.timestamp}
            </span>
          )}
        </div>
      </div>

      {/* Source Citation Modal for deep-dive reading */}
      <SourceCitationModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        source={selectedSource}
      />
    </>
  );
};
