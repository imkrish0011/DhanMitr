'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useVoiceChat } from '@/context/VoiceChatContext';
import { useAuth } from '@/context/AuthContext';
import { ChatMessageBubble } from './ChatMessageBubble';
import { QuickActionsSidebar } from './QuickActionsSidebar';
import {
  DhanMitrLogo,
  RefreshIcon,
  MicIcon,
  SendIcon,
  SparkleSmallIcon,
} from '@/components/icons/CustomIcons';

interface ChatAssistantProps {
  onSwitchToVoice: () => void;
  onNavigateToHub: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  onSwitchToVoice,
  onNavigateToHub,
}) => {
  const {
    messages,
    sendMessage,
    resetChat,
    isGeneratingResponse,
    triggerPrompt,
    startVoiceListening,
    voiceState,
  } = useVoiceChat();

  const { isAuthenticated, remainingFreeChats, openAuthModal } = useAuth();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGeneratingResponse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGeneratingResponse) return;
    sendMessage(input);
    setInput('');
  };

  const sampleSuggestions = [
    { label: 'मेरे खर्चों का विश्लेषण करें', query: 'मेरे खर्चों का विश्लेषण करें', lang: 'hi' as const },
    { label: 'मेरे OTT और सब्सक्रिप्शन दिखाएं', query: 'मेरे OTT और सब्सक्रिप्शन दिखाएं', lang: 'hi' as const },
    { label: 'मैं और ज्यादा कैसे बचत कर सकता हूँ?', query: 'मैं और ज्यादा कैसे बचत कर सकता हूँ?', lang: 'hi' as const },
    { label: 'मेरे निवेश के लिए सुझाव दें', query: 'मेरे निवेश के लिए सुझाव दें', lang: 'hi' as const },
  ];

  return (
    <div className="flex-1 flex h-full max-h-full bg-[#F8FAFC] dark:bg-[#090D16] rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
      {/* Main Chat Feed */}
      <div className="flex-1 flex flex-col justify-between h-full min-h-0 bg-white dark:bg-[#0F172A]">
        {/* Chat Top Header */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0F172A]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <DhanMitrLogo className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                DhanMITR AI Assistant
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online • Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => openAuthModal('signup', 'Sign up to continue chatting and unlock the Finance Hub.')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                  title="Free trial chats remaining. Click to unlock unlimited."
                >
                  <SparkleSmallIcon className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                  <span>{remainingFreeChats}/3 Free</span>
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-full text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-xs"
                >
                  Sign In
                </button>
              </>
            )}

            {/* Switch to Voice Mode */}
            <button
              onClick={onSwitchToVoice}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap"
            >
              <MicIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Voice</span>
            </button>

            {/* Clear/Reset Chat */}
            <button
              onClick={resetChat}
              title="Clear conversation"
              className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <RefreshIcon className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Scrollable Conversation Stream */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))}

          {isGeneratingResponse && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                <DhanMitrLogo className="w-5 h-5" />
              </div>
              <div className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips & Chat Input Area: Pinned at bottom */}
        <div className="shrink-0 p-3 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          {/* "You might ask" Header & Chips: ONLY shown on initial screen before user asks questions */}
          {messages.length <= 1 && (
            <div className="mb-2.5">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                You might ask:
              </p>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {sampleSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => triggerPrompt(item.query, item.lang)}
                    className="px-2.5 sm:px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-800 rounded-xl text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 shadow-2xs transition-all cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs"
          >
            <input
              type="text"
              placeholder="Ask anything about your finances..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />

            {/* Microphone button */}
            <button
              type="button"
              onClick={startVoiceListening}
              className={`p-2 rounded-xl transition-colors ${
                voiceState === 'listening'
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Voice Input"
            >
              <MicIcon className="w-4 h-4" />
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim() || isGeneratingResponse}
              className="p-2 sm:p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-1.5">
            DhanMITR can make mistakes. Always verify important financial decisions.
          </p>
        </div>
      </div>

      {/* Right Sidebar: Quick Actions & Recent Conversations */}
      <QuickActionsSidebar />
    </div>
  );
};
