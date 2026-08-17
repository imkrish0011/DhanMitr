'use client';

import React, { useEffect, useRef } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotationAngle = 0;
    let pulseAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 95;

      pulseAngle += 0.05;

      if (state === 'processing') {
        // High-fidelity Dual-Constellation Particle Orbit Animation
        rotationAngle += 0.035;
        ctx.save();
        ctx.translate(centerX, centerY);

        // Ring 1
        ctx.save();
        ctx.rotate(rotationAngle);
        for (let i = 0; i < 42; i++) {
          const angle = (i / 42) * Math.PI * 2;
          const dist = radius + Math.sin(rotationAngle * 3 + i * 0.4) * 14;
          const x = Math.cos(angle) * dist;
          const y = Math.sin(angle) * dist;
          const particleSize = (Math.sin(rotationAngle * 2 + i * 0.5) + 1.5) * 1.6;

          ctx.beginPath();
          ctx.arc(x, y, Math.max(1, particleSize), 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? '#10B981' : '#06B6D4';
          ctx.shadowBlur = 8;
          ctx.shadowColor = i % 2 === 0 ? '#10B981' : '#06B6D4';
          ctx.fill();
        }
        ctx.restore();

        // Ring 2 Counter-rotation
        ctx.save();
        ctx.rotate(-rotationAngle * 0.7);
        for (let i = 0; i < 24; i++) {
          const angle = (i / 24) * Math.PI * 2;
          const dist = (radius * 0.65) + Math.cos(rotationAngle * 2 + i) * 10;
          const x = Math.cos(angle) * dist;
          const y = Math.sin(angle) * dist;

          ctx.beginPath();
          ctx.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = '#34D399';
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#34D399';
          ctx.fill();
        }
        ctx.restore();

        ctx.restore();
      } else if (state === 'listening' || state === 'speaking') {
        // Frequency wave bars inside glowing sphere
        const barWidth = 4;
        const totalBars = frequencies.length || 24;
        const totalWidth = totalBars * (barWidth + 4.5);
        const startX = centerX - totalWidth / 2;

        for (let i = 0; i < totalBars; i++) {
          const barHeight = Math.max(8, (frequencies[i] || 15) * 0.95);
          const x = startX + i * (barWidth + 4.5);
          const y = centerY - barHeight / 2;

          const grad = ctx.createLinearGradient(x, y, x, y + barHeight);
          if (state === 'listening') {
            grad.addColorStop(0, '#6EE7B7');
            grad.addColorStop(0.5, '#10B981');
            grad.addColorStop(1, '#047857');
          } else {
            grad.addColorStop(0, '#34D399');
            grad.addColorStop(0.5, '#059669');
            grad.addColorStop(1, '#065F46');
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2.5);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, frequencies]);

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none group"
    >
      {/* Outer Glowing Boundary Ring */}
      <div
        className={`w-64 h-64 sm:w-72 sm:h-72 rounded-full flex items-center justify-center transition-all duration-500 relative ${
          state === 'listening'
            ? 'animate-pulse bg-emerald-950/50 border-2 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.35)]'
            : state === 'processing'
            ? 'bg-slate-900/90 border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.3)]'
            : state === 'speaking'
            ? 'bg-emerald-950/60 border-2 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.4)]'
            : 'bg-slate-900/80 border border-slate-700/80 hover:border-emerald-500/80 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
        }`}
      >
        {/* Inner Dark Sphere Canvas Container */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-[#070B12] flex items-center justify-center relative overflow-hidden border border-emerald-900/40">
          <canvas
            ref={canvasRef}
            width={240}
            height={240}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Idle State Microphone Icon */}
          {state === 'idle' && (
            <div className="w-20 h-20 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-9 h-9">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </div>
          )}

          {/* Center 4-Point Sparkle for Processing State */}
          {state === 'processing' && (
            <div className="text-emerald-400 animate-spin" style={{ animationDuration: '3s' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]">
                <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
