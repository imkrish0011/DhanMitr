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
  const numBars = 20;
  const displayFreqs = Array.from({ length: numBars }).map((_, i) => {
    const freqIndex = Math.floor((i / numBars) * (frequencies?.length || numBars));
    return frequencies?.[freqIndex] || 15;
  });

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none group w-52 h-52 sm:w-60 sm:h-60"
    >
      {/* LISTENING / SPEAKING Ripple Rings */}
      {(state === 'listening' || state === 'speaking') && (
        <>
          <div className={`absolute inset-0 rounded-full animate-ripple-1 ${state === 'listening' ? 'border-emerald-500 bg-emerald-500/20' : 'border-cyan-500 bg-cyan-500/20'} border-2`} />
          <div className={`absolute inset-0 rounded-full animate-ripple-2 ${state === 'listening' ? 'border-emerald-500 bg-emerald-500/10' : 'border-cyan-500 bg-cyan-500/10'} border-2`} />
          <div className={`absolute inset-0 rounded-full animate-ripple-3 ${state === 'listening' ? 'border-emerald-500 bg-emerald-500/5' : 'border-cyan-500 bg-cyan-500/5'} border-2`} />
        </>
      )}

      {/* PROCESSING Ring */}
      {state === 'processing' && (
        <div className="absolute inset-0 rounded-full animate-gradient-spin animate-breathe p-[3px] bg-[conic-gradient(from_0deg,transparent_0_120deg,#10B981_180deg,#06B6D4_240deg,transparent_360deg)]">
          <div className="w-full h-full rounded-full bg-[#070B12]" />
        </div>
      )}

      {/* IDLE Hover Outer Ring */}
      {state === 'idle' && (
        <div className="absolute inset-0 rounded-full animate-spin-slow p-[2px] bg-[conic-gradient(from_0deg,transparent_0_180deg,#10B981_270deg,transparent_360deg)] opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="w-full h-full rounded-full bg-transparent" />
        </div>
      )}

      {/* Inner Orb Container */}
      <div className={`absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#070B12] flex items-center justify-center overflow-hidden z-10 transition-shadow duration-500 ${
        state === 'listening' ? 'shadow-[0_0_35px_rgba(16,185,129,0.35)] border border-emerald-500/60' : 
        state === 'speaking' ? 'shadow-[0_0_35px_rgba(6,182,212,0.35)] border border-cyan-500/60' : 
        state === 'processing' ? 'border border-[#0f172a]' : 
        'border border-slate-700/80 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:border-emerald-500/50'
      }`}>

        {/* IDLE State */}
        {state === 'idle' && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-600 group-hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-lg transition-all duration-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 sm:w-9 sm:h-9">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </div>
        )}

        {/* PROCESSING State */}
        {state === 'processing' && (
          <div className="text-emerald-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '4s' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]">
              <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
            </svg>
          </div>
        )}

        {/* LISTENING / SPEAKING State (Equalizer Bars) */}
        {(state === 'listening' || state === 'speaking') && (
          <div className="flex items-center justify-center gap-[3px] sm:gap-[4px] h-full w-full">
            {displayFreqs.map((freq, i) => {
              const height = Math.max(8, freq * 0.95);
              return (
                <div
                  key={i}
                  className={`w-[3px] rounded-full transition-all duration-75 ${
                    state === 'listening' ? 'bg-gradient-to-t from-[#047857] via-[#10B981] to-[#6EE7B7]' : 'bg-gradient-to-t from-[#065F46] via-[#059669] to-[#34D399]'
                  }`}
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
