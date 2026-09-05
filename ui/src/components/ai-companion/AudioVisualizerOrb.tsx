'use client';

import React from 'react';
import { VoiceState } from '@/types';

interface AudioVisualizerOrbProps {
  state: VoiceState;
  frequencies: number[];
  onClick?: () => void;
}

export const AudioVisualizerOrb: React.FC<AudioVisualizerOrbProps> = ({
  state,
  frequencies,
  onClick,
}) => {
  const numBars = 24;
  const displayFreqs = Array.from({ length: numBars }).map((_, i) => {
    const freqIndex = Math.floor((i / numBars) * (frequencies?.length || numBars));
    return frequencies?.[freqIndex] || 18;
  });

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none group w-56 h-56 sm:w-64 sm:h-64 animate-holo-glow"
    >
      {/* Outer Ethereal Halo Ambient Glow */}
      <div className={`absolute -inset-4 rounded-full blur-2xl transition-opacity duration-700 pointer-events-none ${
        state === 'listening' ? 'bg-emerald-500/25 opacity-100' :
        state === 'speaking' ? 'bg-cyan-500/25 opacity-100' :
        state === 'processing' ? 'bg-purple-500/25 opacity-100' :
        'bg-emerald-500/10 opacity-70 group-hover:opacity-100'
      }`} />

      {/* Orbiting Subtle Conic Ring */}
      <div className="absolute -inset-2 rounded-full border border-dashed border-emerald-500/20 dark:border-emerald-400/20 animate-spin-slow pointer-events-none" />

      {/* LISTENING / SPEAKING Ambient Ripple Rings */}
      {(state === 'listening' || state === 'speaking') && (
        <>
          <div className={`absolute inset-0 rounded-full animate-ripple-1 ${state === 'listening' ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-cyan-400/60 bg-cyan-500/10'} border-2`} />
          <div className={`absolute inset-0 rounded-full animate-ripple-2 ${state === 'listening' ? 'border-emerald-400/40 bg-emerald-500/5' : 'border-cyan-400/40 bg-cyan-500/5'} border-2`} />
          <div className={`absolute inset-0 rounded-full animate-ripple-3 ${state === 'listening' ? 'border-emerald-400/20 bg-emerald-500/5' : 'border-cyan-400/20 bg-cyan-500/5'} border-2`} />
        </>
      )}

      {/* PROCESSING Conic Glowing Gradient Ring */}
      {state === 'processing' && (
        <div className="absolute inset-0 rounded-full animate-gradient-spin animate-breathe p-[3px] bg-[conic-gradient(from_0deg,transparent_0_90deg,#10B981_180deg,#06B6D4_270deg,transparent_360deg)]">
          <div className="w-full h-full rounded-full bg-transparent" />
        </div>
      )}

      {/* Holographic Orb Housing */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-white/40 dark:border-emerald-500/30 bg-white/80 dark:bg-[#070B14]/85 backdrop-blur-2xl shadow-2xl dark:shadow-[0_0_40px_rgba(16,185,129,0.25)] p-3 flex items-center justify-center transition-all duration-300 group-hover:scale-[1.02] active:scale-[0.98]">
        {/* Glass Glare Highlight Pill */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none blur-[1px]" />

        {/* Inner Chamber */}
        <div className={`w-full h-full rounded-full bg-slate-50/90 dark:bg-[#050811]/90 border border-slate-200/80 dark:border-white/10 flex items-center justify-center relative overflow-hidden transition-all duration-500 ${
          state === 'listening' ? 'shadow-[inset_0_0_30px_rgba(16,185,129,0.3)] border-emerald-500/40' :
          state === 'speaking' ? 'shadow-[inset_0_0_30px_rgba(6,182,212,0.3)] border-cyan-500/40' :
          state === 'processing' ? 'shadow-[inset_0_0_30px_rgba(168,85,247,0.3)] border-purple-500/40' :
          'group-hover:border-emerald-500/30'
        }`}>

          {/* IDLE State: Holographic Glowing Mic Core */}
          {state === 'idle' && (
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center transition-all duration-200 shadow-lg shadow-emerald-500/30 border border-white/30 group-hover:scale-105">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-md">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </div>
              <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[9px] font-mono text-emerald-300 border border-emerald-500/30 uppercase tracking-widest">
                Tap to speak
              </span>
            </div>
          )}

          {/* PROCESSING State: Glowing Rotating Starburst Element */}
          {state === 'processing' && (
            <div className="flex flex-col items-center justify-center gap-2 text-emerald-400">
              <div className="animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-[0_0_18px_rgba(52,211,153,0.9)]">
                  <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
                </svg>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-emerald-300 font-bold uppercase animate-pulse">
                Thinking...
              </span>
            </div>
          )}

          {/* LISTENING / SPEAKING State: Spectral Soundwave Visualizer Bars */}
          {(state === 'listening' || state === 'speaking') && (
            <div className="flex items-center justify-center gap-[3px] sm:gap-[3.5px] h-full w-full px-5">
              {displayFreqs.map((freq, i) => {
                const height = Math.min(100, Math.max(12, freq * 1.15));
                return (
                  <div
                    key={i}
                    className={`w-[3px] sm:w-[3.5px] rounded-full transition-all duration-75 ${
                      state === 'listening'
                        ? 'bg-gradient-to-t from-emerald-600 via-emerald-400 to-teal-200 shadow-[0_0_10px_rgba(16,185,129,0.7)]'
                        : 'bg-gradient-to-t from-cyan-600 via-cyan-400 to-emerald-200 shadow-[0_0_10px_rgba(6,182,212,0.7)]'
                    }`}
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
