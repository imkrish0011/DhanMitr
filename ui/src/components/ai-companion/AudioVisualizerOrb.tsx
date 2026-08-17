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
  const numBars = 22;
  const displayFreqs = Array.from({ length: numBars }).map((_, i) => {
    const freqIndex = Math.floor((i / numBars) * (frequencies?.length || numBars));
    return frequencies?.[freqIndex] || 15;
  });

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none group w-52 h-52 sm:w-60 sm:h-60"
    >
      {/* LISTENING / SPEAKING Ambient Ripple Rings */}
      {(state === 'listening' || state === 'speaking') && (
        <>
          <div className={`absolute inset-0 rounded-full animate-ripple-1 ${state === 'listening' ? 'border-emerald-500/80 bg-emerald-500/15' : 'border-cyan-500/80 bg-cyan-500/15'} border-2`} />
          <div className={`absolute inset-0 rounded-full animate-ripple-2 ${state === 'listening' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-cyan-500/50 bg-cyan-500/10'} border-2`} />
          <div className={`absolute inset-0 rounded-full animate-ripple-3 ${state === 'listening' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-cyan-500/30 bg-cyan-500/5'} border-2`} />
        </>
      )}

      {/* PROCESSING Conic Glowing Gradient Ring */}
      {state === 'processing' && (
        <div className="absolute inset-0 rounded-full animate-gradient-spin animate-breathe p-[4px] bg-[conic-gradient(from_0deg,transparent_0_120deg,#10B981_180deg,#06B6D4_240deg,transparent_360deg)]">
          <div className="w-full h-full rounded-full bg-transparent" />
        </div>
      )}

      {/* IDLE Subtle Hover Shimmer Ring */}
      {state === 'idle' && (
        <div className="absolute -inset-1 rounded-full animate-spin-slow p-[2px] bg-[conic-gradient(from_0deg,transparent_0_180deg,#10B981_270deg,transparent_360deg)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="w-full h-full rounded-full bg-transparent" />
        </div>
      )}

      {/* Sculpted Outer Neumorphic Housing Bevel */}
      <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full neumorph-orb-housing p-2 sm:p-2.5 flex items-center justify-center transition-all duration-300">
        {/* Recessed Inner Acoustic Dish / Chamber */}
        <div className={`w-full h-full rounded-full neumorph-orb-dish flex items-center justify-center relative overflow-hidden transition-all duration-500 ${
          state === 'listening' ? 'shadow-[inset_0_0_24px_rgba(16,185,129,0.3)]' :
          state === 'speaking' ? 'shadow-[inset_0_0_24px_rgba(6,182,212,0.3)]' : ''
        }`}>

          {/* IDLE State: Raised Tactile Mic Button Core */}
          {state === 'idle' && (
            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full neumorph-mic-core text-white flex items-center justify-center transition-all duration-300 group-hover:scale-105 active:scale-95">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-sm">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </div>
          )}

          {/* PROCESSING State: Glowing Rotating Star Element */}
          {state === 'processing' && (
            <div className="text-emerald-500 dark:text-emerald-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3.5s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_12px_rgba(52,211,153,0.85)]">
                <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
              </svg>
            </div>
          )}

          {/* LISTENING / SPEAKING State: Animated Neumorphic Equalizer Bars */}
          {(state === 'listening' || state === 'speaking') && (
            <div className="flex items-center justify-center gap-[3px] sm:gap-[4px] h-full w-full px-4">
              {displayFreqs.map((freq, i) => {
                const height = Math.max(10, freq * 1.05);
                return (
                  <div
                    key={i}
                    className={`w-[3.5px] rounded-full transition-all duration-75 ${
                      state === 'listening'
                        ? 'bg-gradient-to-t from-emerald-600 via-emerald-400 to-teal-200 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : 'bg-gradient-to-t from-cyan-600 via-cyan-400 to-emerald-300 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
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
