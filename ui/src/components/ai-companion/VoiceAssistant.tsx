'use client';

import React, { useState } from 'react';
import { useVoiceChat } from '@/context/VoiceChatContext';
import { AudioVisualizerOrb } from './AudioVisualizerOrb';
import {
  DhanMitrLogo,
  SparklesIcon,
  ShieldCheckIcon,
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
    setVoiceState,
    selectedLanguage,
    setSelectedLanguage,
    startVoiceListening,
    stopVoiceListening,
    audioFrequencyData,
    activeTranscript,
    assistantVoiceReply,
    triggerPrompt,
  } = useVoiceChat();

  const [textInput, setTextInput] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const suggestedPrompts = [
    { label: 'How can I save more?', query: 'How can I save more money this month?', lang: 'en' as const },
    { label: 'Show my biggest expenses', query: 'Show my biggest expenses and spending breakdown', lang: 'en' as const },
    { label: 'Review my subscriptions', query: 'Review my OTT subscriptions and upcoming renewals', lang: 'en' as const },
    { label: 'Plan my investments', query: 'Plan my investments and review my monthly savings', lang: 'en' as const },
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
    <div className="min-h-screen bg-[#070B14] text-white flex flex-col justify-between p-6 sm:p-10 select-none transition-colors duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto w-full">
        {/* Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onNavigateToHub}>
          <DhanMitrLogo className="w-8 h-8" />
          <span className="text-lg font-bold tracking-tight text-white">
            Dhan<span className="text-emerald-400 font-extrabold">MITR</span>
          </span>
        </div>

        {/* Controls on Right */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            >
              <span>{selectedLanguage === 'hi' ? 'हिंदी (Hindi)' : 'English'}</span>
              <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-1.5 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-30">
                <button
                  onClick={() => {
                    setSelectedLanguage('en');
                    setShowLangMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-emerald-400"
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setSelectedLanguage('hi');
                    setShowLangMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-emerald-400"
                >
                  हिंदी (Hindi)
                </button>
              </div>
            )}
          </div>

          {/* Switch to Chat Button */}
          <button
            onClick={onSwitchToChat}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors"
            title="Open Chat Assistant"
          >
            <SparklesIcon className="w-4 h-4" />
          </button>

          {/* Jump to Finance Hub Button */}
          <button
            onClick={onNavigateToHub}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-semibold rounded-xl hover:bg-emerald-900/80 transition-all"
          >
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Finance Hub</span>
          </button>
        </div>
      </div>

      {/* Main Center Area: Title, Glowing Visualizer Orb, Control Button */}
      <div className="flex flex-col items-center justify-center my-auto py-8 text-center max-w-xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center justify-center gap-2">
          {getStatusHeadline()}
          {voiceState === 'listening' && (
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          )}
          {voiceState === 'processing' && (
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse" />
          )}
          {voiceState === 'speaking' && (
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" />
          )}
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 px-4">
          {getStatusSubtitle()}
        </p>



        {/* The Audio Visualizer Glowing Orb */}
        <div className="mb-6">
          <AudioVisualizerOrb
            state={voiceState}
            frequencies={audioFrequencyData}
            onClick={voiceState === 'listening' ? stopVoiceListening : startVoiceListening}
          />
        </div>

        {/* Primary Voice Action Button */}
        {voiceState === 'listening' ? (
          <button
            onClick={stopVoiceListening}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-xs font-semibold shadow-lg hover:border-slate-500 active:scale-95 transition-all"
          >
            <StopIcon className="w-3.5 h-3.5 text-red-400" />
            <span>Tap to stop</span>
          </button>
        ) : (
          <button
            onClick={startVoiceListening}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold shadow-lg shadow-emerald-900/40 active:scale-95 transition-all"
          >
            <MicIcon className="w-4 h-4" />
            <span>Tap to Speak</span>
          </button>
        )}

        {/* Live Audio Transcript Display */}
        {activeTranscript && (
          <div className="mt-6 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl max-w-md text-xs text-emerald-400 font-medium">
            "{activeTranscript}"
          </div>
        )}
      </div>

      {/* Bottom Area: Suggested Prompts & Input Bar */}
      <div className="max-w-2xl mx-auto w-full space-y-5">
        {/* Suggested Prompts Header & Chips */}
        <div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold mb-2">
            <SparkleSmallIcon className="w-3 h-3 text-slate-500" />
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
                className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 hover:text-white transition-all shadow-xs"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Bar Fallback */}
        <form
          onSubmit={handleSendText}
          className="flex items-center gap-2 p-2 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl"
        >
          <input
            type="text"
            placeholder="Or type your question..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />

          <button
            type="button"
            onClick={startVoiceListening}
            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Start Voice Recognition"
          >
            <MicIcon className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={!textInput.trim()}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-sm"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
