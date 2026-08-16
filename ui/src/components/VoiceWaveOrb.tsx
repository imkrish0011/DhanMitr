"use client";

import React, { useRef, useEffect } from "react";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

interface VoiceWaveOrbProps {
  state: OrbState;
  size?: number;
  onClick?: () => void;
}

export function VoiceWaveOrb({ state = "idle", size = 220, onClick }: VoiceWaveOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.44;

      phase += state === "listening" ? 0.08 : state === "speaking" ? 0.06 : state === "thinking" ? 0.04 : 0.02;

      // 1. Dark glowing sphere core with emerald gradient
      const sphereGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      sphereGrad.addColorStop(0, "#064e3b"); // Deep emerald
      sphereGrad.addColorStop(0.5, "#022c22"); // Dark teal
      sphereGrad.addColorStop(0.85, "#0f172a"); // Dark slate
      sphereGrad.addColorStop(1, "#020617"); // Obsidian edge
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // 2. Outer glowing ring
      ctx.save();
      ctx.shadowColor = state === "listening" ? "#10b981" : state === "speaking" ? "#34d399" : "#059669";
      ctx.shadowBlur = state === "listening" ? 24 : state === "speaking" ? 20 : 12;
      ctx.strokeStyle = state === "listening" ? "rgba(52, 211, 153, 0.9)" : "rgba(16, 185, 129, 0.6)";
      ctx.lineWidth = state === "listening" ? 3 : 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 3. Central Vertical Audio Equalizer Waves (Matching the reference image!)
      const barsCount = 28;
      const barWidth = 2.4;
      const barGap = 3.2;
      const totalWidth = barsCount * (barWidth + barGap);
      const startX = cx - totalWidth / 2;

      for (let i = 0; i < barsCount; i++) {
        const x = startX + i * (barWidth + barGap);
        const normDist = (i - barsCount / 2) / (barsCount / 2);
        const bellCurve = Math.cos(normDist * (Math.PI / 2)); // Higher in center, tapered at edges

        let activity = 0.15;
        if (state === "listening") {
          activity = Math.sin(phase * 2 + i * 0.4) * 0.4 + Math.cos(phase * 1.5 + i * 0.3) * 0.4 + 0.4;
        } else if (state === "speaking") {
          activity = Math.sin(phase * 1.8 + i * 0.5) * 0.45 + Math.cos(phase * 2.2 + i * 0.2) * 0.35 + 0.4;
        } else if (state === "thinking") {
          activity = Math.sin(phase * 3 + i * 0.8) * 0.3 + 0.3;
        } else {
          activity = Math.sin(phase + i * 0.2) * 0.1 + 0.15;
        }

        const maxBarHeight = (r * 1.1) * bellCurve;
        const currentHeight = Math.max(4, maxBarHeight * Math.abs(activity));

        const barGrad = ctx.createLinearGradient(x, cy - currentHeight / 2, x, cy + currentHeight / 2);
        barGrad.addColorStop(0, "rgba(52, 211, 153, 0.15)");
        barGrad.addColorStop(0.3, "rgba(52, 211, 153, 0.95)");
        barGrad.addColorStop(0.5, "#ffffff");
        barGrad.addColorStop(0.7, "rgba(52, 211, 153, 0.95)");
        barGrad.addColorStop(1, "rgba(52, 211, 153, 0.15)");

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(x, cy - currentHeight / 2, barWidth, currentHeight, barWidth / 2);
        ctx.fill();
      }

      // 4. Subtle inner sphere gloss reflection
      const glossGrad = ctx.createLinearGradient(cx, cy - r, cx, cy);
      glossGrad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
      glossGrad.addColorStop(0.4, "rgba(255, 255, 255, 0.05)");
      glossGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glossGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 2, Math.PI * 1.1, Math.PI * 1.9);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [state, size]);

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer select-none group flex items-center justify-center transition-transform active:scale-95 touch-manipulation"
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow */}
      <div
        className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-300 pointer-events-none ${
          state === "listening"
            ? "bg-emerald-500/25 opacity-100 animate-pulse"
            : state === "speaking"
            ? "bg-emerald-400/20 opacity-100"
            : "bg-emerald-500/10 opacity-60 group-hover:opacity-100"
        }`}
      />

      <canvas ref={canvasRef} style={{ width: size, height: size }} className="relative z-10" />
    </div>
  );
}

export default VoiceWaveOrb;
