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
import { Sparkles, Globe, Languages } from 'lucide-react';

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
    <div className={`w-full ${isAuthenticated ? 'h-[calc(100dvh-5.75rem)] md:min-h-screen' : 'h-[100dvh] md:h-screen'} bg-transparent text-slate-800 dark:text-slate-100 flex flex-col justify-between px-4 sm:px-10 pt-4 pb-6 select-none relative overflow-hidden transition-colors duration-200`}>
      {/* Subtle Background Glow behind Orb */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl -z-10" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto w-full shrink-0 z-10">
        {/* Brand Pill */}
        <div
          className={`flex ${isAuthenticated ? 'md:hidden' : 'flex'} items-center gap-2.5 px-3.5 py-1.5 fintech-card rounded-2xl cursor-pointer shrink-0 transition-transform active:scale-95`}
          onClick={onNavigateToHub}
          title={isAuthenticated ? "Go to Finance Hub" : "Return to Landing Page"}
        >
          <DhanMitrLogo className="w-6 h-5 sm:w-7 sm:h-6 shrink-0" />
          <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dhan<span className="text-emerald-500 font-bold">Mitr</span>
          </span>
        </div>

        {/* Center Intelligence Beacon on Desktop */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Multilingual Voice AI Online</span>
        </div>

        {/* Controls on Right */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
          {!isAuthenticated && (
            <>
              {/* Free Chat Quota Pill */}
              <button
                onClick={() => openAuthModal('signup', 'Sign in or create an account for unlimited AI assistance and full financial hub.')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap shadow-2xs"
                title="Free trial chats remaining. Click to unlock unlimited."
              >
                <SparkleSmallIcon className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                <span>{remainingFreeChats}/3 Free</span>
              </button>

              {/* Sign In Button */}
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-full text-xs font-bold cursor-pointer whitespace-nowrap shadow-xs transition-all"
              >
                Sign In
              </button>
            </>
          )}

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap cursor-pointer shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all"
            >
              <span className="flex items-center gap-1.5">
                {selectedLanguage === 'auto' ? (
                  <>
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>Auto</span>
                  </>
                ) : selectedLanguage === 'hi' ? (
                  <>
                    <Languages className="w-3 h-3 text-emerald-500" />
                    <span>HI</span>
                  </>
                ) : selectedLanguage === 'hinglish' ? (
                  <>
                    <Languages className="w-3 h-3 text-teal-500" />
                    <span>Hinglish</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 text-blue-500" />
                    <span>EN</span>
                  </>
                )}
              </span>
              <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl py-1.5 z-30 overflow-hidden text-xs shadow-xl">
                <button
                  onClick={() => {
                    setSelectedLanguage('auto');
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    selectedLanguage === 'auto'
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Auto Detect (स्वतः)</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedLanguage('en');
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    selectedLanguage === 'en'
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>English</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedLanguage('hi');
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                    selectedLanguage === 'hi'
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5 text-emerald-500" />
                  <span>हिंदी (Hindi)</span>
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
              className="flex items-center gap-2.5 px-7 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-red-500/30 active:scale-95 transition-all cursor-pointer ring-4 ring-red-500/20"
            >
              <StopIcon className="w-4 h-4 text-white" />
              <span>Tap to Finish</span>
            </button>
          ) : (
            <button
              onClick={startVoiceListening}
              className="flex items-center gap-2.5 px-8 sm:px-9 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full text-xs sm:text-sm font-bold cursor-pointer shadow-lg shadow-emerald-600/30 active:scale-95 transition-all border border-white/20"
            >
              <MicIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span>Tap to Speak</span>
            </button>
          )}

          <button
            onClick={onSwitchToChat}
            className="flex items-center gap-2 px-5 sm:px-6 py-3.5 fintech-card text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-full text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
            title="Switch to Chat Mode"
          >
            <SparklesIcon className="w-4 h-4 text-emerald-500" />
            <span>Chat Console</span>
          </button>
        </div>

        {/* Live Audio Transcript Display */}
        {activeTranscript && (
          <div className="mt-5 px-5 py-3 fintech-card rounded-2xl max-w-lg text-xs sm:text-sm text-slate-800 dark:text-emerald-300 font-semibold shadow-md animate-in fade-in flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-ping" />
            <span className="italic">&ldquo;{activeTranscript}&rdquo;</span>
          </div>
        )}
      </div>

      {/* Bottom Area: Suggested Prompts & Input Box */}
      <div className="shrink-0 max-w-2xl mx-auto w-full space-y-3 pb-2 sm:pb-3 z-10">
        {/* Suggested Prompts Header & Chips */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-400 text-[11px] font-semibold tracking-wider uppercase mb-2 px-1">
            <SparkleSmallIcon className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            <span>Recommended Inquiries</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  triggerPrompt(p.query, p.lang);
                  onSwitchToChat();
                }}
                className="px-3.5 py-1.5 fintech-card fintech-card-hover rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer shadow-2xs transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Bar */}
        <form
          onSubmit={handleSendText}
          className="flex items-center gap-2 p-2 fintech-card rounded-2xl shadow-md focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
        >
          <input
            type="text"
            placeholder="Or type a question for institutional analysis..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="flex-1 bg-transparent px-3 py-1 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
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
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
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
            className="p-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

