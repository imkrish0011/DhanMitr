'use client';

import React, { useState } from 'react';
import { useVoiceChat } from '@/context/VoiceChatContext';
import { useAuth } from '@/context/AuthContext';
import { AudioVisualizerOrb } from './AudioVisualizerOrb';
import {
  DhanMitrLogo,
  SparklesIcon,
  MicIcon,
  SendIcon,
  StopIcon,
  SparkleSmallIcon,
} from '@/components/icons/CustomIcons';

interface VoiceAssistantProps {
  onSwitchToChat: () => void;
  onNavigateToHub: () => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onSwitchToChat,
  onNavigateToHub,
}) => {
  const {
    voiceState,
    selectedLanguage,
    setSelectedLanguage,
    startVoiceListening,
    stopVoiceListening,
    audioFrequencyData,
    activeTranscript,
    assistantVoiceReply,
    triggerPrompt,
  } = useVoiceChat();

  const { isAuthenticated, remainingFreeChats, openAuthModal } = useAuth();

  const [textInput, setTextInput] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const suggestedPrompts = isAuthenticated
    ? [
        { label: 'How can I save more?', query: 'How can I save more money this month?', lang: 'en' as const },
        { label: 'Show my biggest expenses', query: 'Show my biggest expenses and spending breakdown', lang: 'en' as const },
        { label: 'Review my subscriptions', query: 'Review my OTT subscriptions and upcoming renewals', lang: 'en' as const },
        { label: 'Plan my investments', query: 'Plan my investments and review my monthly savings', lang: 'en' as const },
      ]
    : [
        { label: '50/30/20 Budget Rule', query: 'How does the 50/30/20 budgeting rule work?', lang: 'en' as const },
        { label: 'Build Emergency Fund', query: 'How to build an emergency fund for 6 months?', lang: 'en' as const },
        { label: 'Old vs New Tax Regime', query: 'Explain difference between Old and New Tax regime in India', lang: 'en' as const },
        { label: 'Money Saving Habits', query: 'What are the top practical habits to save money every month?', lang: 'en' as const },
      ];

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    triggerPrompt(textInput, selectedLanguage);
    setTextInput('');
    onSwitchToChat();
  };

  const getStatusHeadline = () => {
    switch (voiceState) {
      case 'listening':
        return "I'm listening...";
      case 'processing':
        return 'Processing...';
      case 'speaking':
        return 'DhanMITR Speaking...';
      case 'idle':
      default:
        return 'Tap to speak';
    }
  };

  const getStatusSubtitle = () => {
    switch (voiceState) {
      case 'listening':
        return selectedLanguage === 'hi' ? 'अपनी वित्तीय स्थिति के बारे में बोलें...' : 'Speak naturally about your finances...';
      case 'processing':
        return 'DhanMITR is analyzing your financial records & generating insights';
      case 'speaking':
        return assistantVoiceReply || 'Explaining your financial insights';
      case 'idle':
      default:
        return 'Speak naturally about your finances in Hindi or English';
    }
  };

  return (
    <div className={`w-full ${isAuthenticated ? 'h-[calc(100dvh-5.75rem)] md:min-h-screen' : 'h-[100dvh] md:h-screen'} bg-[#EBF0F7] dark:bg-[#0B101D] text-slate-800 dark:text-slate-100 flex flex-col justify-between px-3.5 sm:px-8 pt-4 pb-4 select-none transition-colors duration-300`}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 max-w-5xl mx-auto w-full shrink-0">
        {/* Brand: Tactile Neumorphic Pill */}
        <div
          className={`flex ${isAuthenticated ? 'md:hidden' : 'flex'} items-center gap-2.5 px-3.5 py-2 neumorph-chip rounded-2xl cursor-pointer shrink-0 transition-transform active:scale-95`}
          onClick={isAuthenticated ? onNavigateToHub : undefined}
        >
          <DhanMitrLogo className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dhan<span className="text-emerald-500 font-black">MITR</span>
          </span>
        </div>

        {/* Controls on Right: Sleek Neumorphic Pill Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
          {!isAuthenticated && (
            <>
              {/* Tactile Free Chat Quota Pill */}
              <button
                onClick={() => openAuthModal('signup', 'Sign in or create an account for unlimited AI assistance and full financial hub.')}
                className="flex items-center gap-1.5 px-3 py-1.5 neumorph-chip text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap"
                title="Free trial chats remaining. Click to unlock unlimited."
              >
                <SparkleSmallIcon className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                <span>{remainingFreeChats}/3 Free</span>
              </button>

              {/* Tactile Sign In Button */}
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-1.5 neumorph-btn-emerald text-white rounded-full text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                Sign In
              </button>
            </>
          )}

          {/* Tactile Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 neumorph-chip rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap cursor-pointer shadow-2xs hover:scale-102 transition-all"
            >
              <span>
                {selectedLanguage === 'auto'
                  ? '✨ Auto'
                  : selectedLanguage === 'hi'
                  ? '🇮🇳 HI'
                  : selectedLanguage === 'hinglish'
                  ? '🇮🇳 Hinglish'
                  : '🌐 EN'}
              </span>
              <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-44 neumorph-card rounded-2xl py-1.5 z-30 overflow-hidden text-xs shadow-lg border border-slate-200/50 dark:border-slate-800/50">
                <button
                  onClick={() => {
                    setSelectedLanguage('auto');
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 font-medium transition-colors cursor-pointer ${
                    selectedLanguage === 'auto'
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  ✨ Auto Detect (स्वतः)
                </button>
                <button
                  onClick={() => {
                    setSelectedLanguage('en');
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 font-medium transition-colors cursor-pointer ${
                    selectedLanguage === 'en'
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  🌐 English
                </button>
                <button
                  onClick={() => {
                    setSelectedLanguage('hi');
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 font-medium transition-colors cursor-pointer ${
                    selectedLanguage === 'hi'
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  🇮🇳 हिंदी (Hindi)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Center Area: Centered with Tactile Neumorphic Dial */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-2 text-center max-w-xl mx-auto w-full">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1 flex items-center justify-center gap-2.5">
          {getStatusHeadline()}
          {voiceState === 'listening' && (
            <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
          )}
          {voiceState === 'processing' && (
            <span className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
          )}
          {voiceState === 'speaking' && (
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" />
          )}
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4 px-4 font-medium">
          {getStatusSubtitle()}
        </p>

        {/* The Neumorphic Audio Visualizer Dial */}
        <div className="mb-5">
          <AudioVisualizerOrb
            state={voiceState}
            frequencies={audioFrequencyData}
            onClick={voiceState === 'listening' ? stopVoiceListening : startVoiceListening}
          />
        </div>

        {/* Primary Voice Action and Switch to Chat Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {voiceState === 'listening' ? (
            <button
              onClick={stopVoiceListening}
              className="flex items-center gap-2 px-6 py-3 neumorph-btn text-red-600 dark:text-red-400 rounded-full text-xs font-bold"
            >
              <StopIcon className="w-4 h-4 text-red-500" />
              <span>Tap to stop</span>
            </button>
          ) : (
            <button
              onClick={startVoiceListening}
              className="flex items-center gap-2.5 px-7 sm:px-8 py-3.5 neumorph-btn-emerald text-white rounded-full text-xs sm:text-sm font-bold cursor-pointer"
            >
              <MicIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Tap to Speak</span>
            </button>
          )}

          <button
            onClick={onSwitchToChat}
            className="flex items-center gap-2 px-5 py-3 neumorph-btn text-slate-700 dark:text-slate-200 rounded-full text-xs font-bold cursor-pointer"
            title="Switch to Chat Mode"
          >
            <SparklesIcon className="w-4 h-4 text-emerald-500" />
            <span>Chat Mode</span>
          </button>
        </div>

        {/* Live Audio Transcript Display: Sunken Debossed Capsule */}
        {activeTranscript && (
          <div className="mt-4 px-5 py-2 neumorph-inset rounded-2xl max-w-md text-xs text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
            &ldquo;{activeTranscript}&rdquo;
          </div>
        )}
      </div>

      {/* Bottom Area: Tactile Suggested Prompts & Sunken Input Box */}
      <div className="shrink-0 max-w-2xl mx-auto w-full space-y-2.5 sm:space-y-3.5 pb-2 sm:pb-3">
        {/* Suggested Prompts Header & Chips */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2 px-1">
            <SparkleSmallIcon className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            <span>Suggested prompts</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  triggerPrompt(p.query, p.lang);
                  onSwitchToChat();
                }}
                className="px-3.5 py-1.5 neumorph-chip rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Bar: Smooth Debossed Sunken Well */}
        <form
          onSubmit={handleSendText}
          className="flex items-center gap-2 p-1.5 sm:p-2 neumorph-inset rounded-2xl border border-slate-200/40 dark:border-slate-800/40"
        >
          <input
            type="text"
            placeholder="Or type your question..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />

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
                : 'neumorph-btn text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
            title={
              voiceState === 'listening'
                ? 'Tap to stop recording & submit'
                : voiceState === 'speaking'
                ? 'Tap to stop playback'
                : 'Start Voice Recognition'
            }
          >
            {voiceState === 'listening' ? (
              <span className="w-4 h-4 block bg-white rounded-2xs" />
            ) : (
              <MicIcon className="w-4 h-4" />
            )}
          </button>

          <button
            type="submit"
            disabled={!textInput.trim()}
            className="p-2 neumorph-btn-emerald disabled:opacity-40 text-white rounded-xl"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

