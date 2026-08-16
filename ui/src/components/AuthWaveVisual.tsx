"use client";

import React, { useRef, useEffect } from "react";

export function AuthWaveVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const cols = 30;
    const rows = 35;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);
      time += 0.015;

      // Dark rich gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, w * 0.3, h);
      bgGrad.addColorStop(0, "#0f172a");
      bgGrad.addColorStop(0.5, "#1e293b");
      bgGrad.addColorStop(1, "#0f172a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Soft emerald glow pool
      const glowGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.6);
      glowGrad.addColorStop(0, "rgba(16, 185, 129, 0.12)");
      glowGrad.addColorStop(0.6, "rgba(6, 182, 212, 0.06)");
      glowGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      const cellW = w / cols;
      const cellH = h / rows;

      // Halftone dot wave — in muted silver & emerald on dark background
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const u = i / cols;
          const v = j / rows;

          const elevation =
            Math.sin(u * 5 + time + Math.cos(v * 4 + time * 0.7)) *
            Math.cos(v * 4 - time * 0.8 + Math.sin(u * 3));

          const normElev = (elevation + 1) / 2;

          const x = i * cellW + cellW * 0.5 + Math.sin(v * 6 + time) * 2;
          const y = j * cellH + cellH * 0.5 + elevation * 10;

          const dotRadius = Math.max(0.5, normElev * 2.2 + 0.3);
          const alpha = Math.max(0.1, Math.min(0.7, normElev * 0.6 + 0.1));

          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);

          if (normElev > 0.72) {
            ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
          } else if (normElev > 0.4) {
            ctx.fillStyle = `rgba(148, 163, 184, ${alpha * 0.7})`;
          } else {
            ctx.fillStyle = `rgba(100, 116, 139, ${alpha * 0.4})`;
          }

          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block pointer-events-none"
    />
  );
}
