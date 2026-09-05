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
    stopVoiceListening,
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

  const sampleSuggestions = isAuthenticated
    ? [
        { label: 'मेरे खर्चों का विश्लेषण करें', query: 'मेरे खर्चों का विश्लेषण करें', lang: 'hi' as const },
        { label: 'मेरे OTT और सब्सक्रिप्शन दिखाएं', query: 'मेरे OTT और सब्सक्रिप्शन दिखाएं', lang: 'hi' as const },
        { label: 'मैं और ज्यादा कैसे बचत कर सकता हूँ?', query: 'मैं और ज्यादा कैसे बचत कर सकता हूँ?', lang: 'hi' as const },
        { label: 'मेरे निवेश के लिए सुझाव दें', query: 'मेरे निवेश के लिए सुझाव दें', lang: 'hi' as const },
      ]
    : [
        { label: '50/30/20 बजट नियम क्या है?', query: '50/30/20 बजट नियम क्या है और इसे कैसे लागू करें?', lang: 'hi' as const },
        { label: 'इमरजेंसी फंड कैसे बनाएं?', query: '6 महीने का इमरजेंसी फंड कैसे तैयार करें?', lang: 'hi' as const },
        { label: 'Old vs New Tax Regime', query: 'ओल्ड और न्यू टैक्स रिजीम में क्या अंतर है?', lang: 'hi' as const },
        { label: 'Smart Saving Tips', query: 'हर महीने फिजूलखर्ची रोकने के आसान तरीके बताएं', lang: 'hi' as const },
      ];

  return (
    <div className="flex-1 flex h-full max-h-full fintech-card rounded-2xl md:rounded-3xl shadow-xl overflow-hidden transition-colors duration-200">
      {/* Main Chat Feed */}
      <div className="flex-1 flex flex-col justify-between h-full min-h-0 bg-slate-50/40 dark:bg-[#070B14]">
        {/* Chat Top Header */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between bg-white/80 dark:bg-[#0E1526]/80 backdrop-blur-md">
          <button
            onClick={onNavigateToHub}
            className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer hover:opacity-90 transition-opacity"
            title="Return to Finance Hub"
          >
            <DhanMitrLogo className="w-9 h-7 group-hover:scale-105 transition-transform shrink-0" />
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-display">
                धन<span className="text-emerald-500 font-bold">Mitr</span> Console
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span>Online • Return to Hub ↗</span>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => openAuthModal('signup', 'Sign up to continue chatting and unlock the Finance Hub.')}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap shadow-2xs"
                  title="Free trial chats remaining. Click to unlock unlimited."
                >
                  <SparkleSmallIcon className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                  <span>{remainingFreeChats}/3 Free</span>
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold cursor-pointer whitespace-nowrap shadow-xs transition-all"
                >
                  Sign In
                </button>
              </>
            )}

            {/* Switch to Voice Mode */}
            <button
              onClick={onSwitchToVoice}
              className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 rounded-full text-xs font-bold cursor-pointer whitespace-nowrap shadow-2xs transition-all"
            >
              <MicIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>Voice</span>
            </button>

            {/* Clear/Reset Chat */}
            <button
              onClick={resetChat}
              title="Clear conversation"
              className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Conversation Stream */}
        <div className="flex-1 overflow-y-auto min-h-0 p-3.5 sm:p-5 space-y-2 bg-slate-50/50 dark:bg-[#090D16]">
          {messages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips & Chat Input Area */}
        <div className="shrink-0 p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0F172A]">
          {/* "You might ask" Header & Chips */}
          {messages.length <= 1 && (
            <div className="mb-2.5">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">
                You might ask:
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                {sampleSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => triggerPrompt(item.query, item.lang)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl text-xs font-medium border border-slate-200/60 dark:border-slate-700/60 transition-all cursor-pointer shadow-2xs"
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
            className="flex items-center gap-2 p-1.5 sm:p-2 bg-slate-50 dark:bg-[#0B101D] border border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 shadow-xs transition-all"
          >
            <input
              type="text"
              placeholder="Ask anything about your finances..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-[13px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />

            {/* Microphone button */}
            <button
              type="button"
              onClick={voiceState === 'listening' || voiceState === 'speaking' ? stopVoiceListening : startVoiceListening}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                voiceState === 'listening'
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400/50'
                  : voiceState === 'processing'
                  ? 'bg-amber-500 text-white animate-pulse shadow-md'
                  : voiceState === 'speaking'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse shadow-md'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-2xs'
              }`}
              title={
                voiceState === 'listening'
                  ? 'Tap to stop recording & submit'
                  : voiceState === 'speaking'
                  ? 'Tap to stop audio playback'
                  : voiceState === 'processing'
                  ? 'Processing your voice...'
                  : 'Voice Input'
              }
            >
              {voiceState === 'listening' ? (
                <span className="w-3.5 h-3.5 block bg-white rounded-2xs" />
              ) : (
                <MicIcon className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim() || isGeneratingResponse}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <SendIcon className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
            धनMitr can make mistakes. Always verify important financial decisions.
          </p>
        </div>
      </div>

      {/* Right Sidebar: Quick Actions & Recent Conversations */}
      <QuickActionsSidebar />
    </div>
  );
};
