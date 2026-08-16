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
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const cols = 45;
    const rows = 55;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);
      time += 0.02;

      // Soft ambient background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, "#F8FAFC");
      bgGrad.addColorStop(0.5, "#E2E8F0");
      bgGrad.addColorStop(1, "#F1F5F9");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle cyan/emerald luminous glow pool
      const glowGrad = ctx.createRadialGradient(w * 0.4, h * 0.4, 20, w * 0.4, h * 0.4, w * 0.7);
      glowGrad.addColorStop(0, "rgba(52, 211, 153, 0.25)");
      glowGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.15)");
      glowGrad.addColorStop(1, "rgba(241, 245, 249, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      const cellW = w / cols;
      const cellH = h / rows;

      // 3D Halftone Undulating Particle Wave
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const u = i / cols;
          const v = j / rows;

          // Multi-frequency wave calculation
          const elevation =
            Math.sin(u * 5 + time + Math.cos(v * 4 + time * 0.7)) *
            Math.cos(v * 4 - time * 0.8 + Math.sin(u * 3));

          const normElev = (elevation + 1) / 2; // 0 to 1

          const x = i * cellW + Math.sin(v * 6 + time) * 3;
          const y = j * cellH + elevation * 14;

          const dotRadius = Math.max(0.6, normElev * 2.8 + 0.4);
          const alpha = Math.max(0.15, Math.min(0.9, normElev * 0.85 + 0.15));

          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);

          // Halftone color modulation (Obsidian -> Slate -> Silver -> Emerald accent)
          if (normElev > 0.75) {
            ctx.fillStyle = `rgba(5, 150, 105, ${alpha})`; // Emerald crest
          } else if (normElev > 0.45) {
            ctx.fillStyle = `rgba(14, 165, 233, ${alpha * 0.8})`; // Cyan/Blue depth
          } else {
            ctx.fillStyle = `rgba(15, 23, 42, ${alpha * 0.7})`; // Obsidian dot
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
