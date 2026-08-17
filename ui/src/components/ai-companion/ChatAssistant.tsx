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
    <div className="flex-1 flex h-full max-h-full neumorph-card rounded-2xl md:rounded-3xl overflow-hidden transition-colors duration-300">
      {/* Main Chat Feed */}
      <div className="flex-1 flex flex-col justify-between h-full min-h-0 bg-[#EBF0F7] dark:bg-[#0F1626]">
        {/* Chat Top Header: Tactile Neumorphic Bar */}
        <div className="shrink-0 px-3.5 sm:px-5 py-2.5 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between bg-[#EBF0F7] dark:bg-[#0F1626]">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl neumorph-chip flex items-center justify-center">
              <DhanMitrLogo className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                DhanMITR AI Assistant
              </h2>
              <div className="flex items-center gap-1.5 text-[9.5px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span>Online • Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => openAuthModal('signup', 'Sign up to continue chatting and unlock the Finance Hub.')}
                  className="flex items-center gap-1 px-2.5 py-1 neumorph-chip text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-semibold cursor-pointer whitespace-nowrap"
                  title="Free trial chats remaining. Click to unlock unlimited."
                >
                  <SparkleSmallIcon className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                  <span>{remainingFreeChats}/3 Free</span>
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1 neumorph-btn-emerald text-white rounded-full text-[11px] sm:text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  Sign In
                </button>
              </>
            )}

            {/* Switch to Voice Mode */}
            <button
              onClick={onSwitchToVoice}
              className="flex items-center gap-1 px-2.5 py-1 neumorph-btn text-slate-700 dark:text-slate-200 rounded-full text-[11px] sm:text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              <MicIcon className="w-3 h-3 text-emerald-500" />
              <span>Voice</span>
            </button>

            {/* Clear/Reset Chat */}
            <button
              onClick={resetChat}
              title="Clear conversation"
              className="p-1.5 neumorph-chip text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-colors cursor-pointer"
            >
              <RefreshIcon className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Scrollable Conversation Stream: Deep Sunken Recessed Well */}
        <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-4 space-y-1.5 neumorph-inset-deep">
          {messages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))}

          {isGeneratingResponse && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full neumorph-chip flex items-center justify-center">
                <DhanMitrLogo className="w-3.5 h-3.5" />
              </div>
              <div className="px-3 py-2 neumorph-flat rounded-xl rounded-tl-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips & Chat Input Area: Pinned at bottom */}
        <div className="shrink-0 p-2.5 sm:p-3.5 border-t border-slate-200/60 dark:border-slate-800/60 bg-[#EBF0F7] dark:bg-[#0F1626]">
          {/* "You might ask" Header & Chips: ONLY shown on initial screen before user asks questions */}
          {messages.length <= 1 && (
            <div className="mb-2">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">
                You might ask:
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                {sampleSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => triggerPrompt(item.query, item.lang)}
                    className="px-2.5 py-1 neumorph-chip rounded-lg text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Input Bar: Smooth Debossed Sunken Well */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-1.5 p-1 sm:p-1.5 neumorph-inset rounded-xl border border-slate-200/40 dark:border-slate-800/40"
          >
            <input
              type="text"
              placeholder="Ask anything about your finances..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent px-2.5 py-1 text-xs sm:text-[13px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />

            {/* Microphone button */}
            <button
              type="button"
              onClick={startVoiceListening}
              className={`p-1.5 rounded-lg transition-colors ${
                voiceState === 'listening'
                  ? 'bg-red-500 text-white animate-pulse shadow-md'
                  : 'neumorph-btn text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
              title="Voice Input"
            >
              <MicIcon className="w-3.5 h-3.5" />
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim() || isGeneratingResponse}
              className="p-1.5 sm:p-2 neumorph-btn-emerald disabled:opacity-40 text-white rounded-lg cursor-pointer"
            >
              <SendIcon className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="text-[9.5px] text-center text-slate-400 dark:text-slate-500 mt-1 font-medium">
            DhanMITR can make mistakes. Always verify important financial decisions.
          </p>
        </div>
      </div>

      {/* Right Sidebar: Quick Actions & Recent Conversations */}
      <QuickActionsSidebar />
    </div>
  );
};
