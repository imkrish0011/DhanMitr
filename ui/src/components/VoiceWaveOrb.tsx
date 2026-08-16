"use client";

import React, { useRef, useEffect } from "react";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

interface VoiceWaveOrbProps {
  state: OrbState;
  size?: number;
  onClick?: () => void;
}

interface ConstellationParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  alpha: number;
  color: string;
}

export function VoiceWaveOrb({ state = "idle", size = 260, onClick }: VoiceWaveOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ConstellationParticle[]>([]);

  // Initialize constellation particles for the thinking / processing state
  useEffect(() => {
    const count = 90;
    const particles: ConstellationParticle[] = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = Math.random() * 85 + 15;
      particles.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.7 + 0.3,
        color: Math.random() > 0.3 ? "#34d399" : Math.random() > 0.5 ? "#6ee7b7" : "#a7f3d0",
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let phase = 0;
    let rotX = 0;
    let rotY = 0;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.42;

      phase += 0.04;

      if (state === "thinking") {
        // =========================================================================
        // MODE: PROCESSING / THINKING CONSTELLATION (Exact marked image in prompt!)
        // =========================================================================
        rotY += 0.015;
        rotX += 0.008;

        // 1. Soft radial cosmic ambient glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.3);
        glow.addColorStop(0, "rgba(16, 185, 129, 0.25)");
        glow.addColorStop(0.5, "rgba(5, 150, 105, 0.08)");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
        ctx.fill();

        // 2. Rotating 3D Particle Cloud
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

        const transformed = particlesRef.current.map((p) => {
          // Rotate Y
          let x1 = p.x * cosY - p.z * sinY;
          let z1 = p.x * sinY + p.z * cosY;
          // Rotate X
          let y2 = p.y * cosX - z1 * sinX;
          let z2 = p.y * sinX + z1 * cosX;

          const fov = 180;
          const scale = fov / (fov + z2);
          const px = cx + x1 * scale;
          const py = cy + y2 * scale;
          return { px, py, scale, alpha: p.alpha, radius: p.radius, color: p.color, z2 };
        });

        // Sort by Z for realistic depth
        transformed.sort((a, b) => b.z2 - a.z2);

        // Draw connecting constellation lines
        ctx.lineWidth = 0.6;
        for (let i = 0; i < transformed.length; i++) {
          for (let j = i + 1; j < transformed.length; j++) {
            const p1 = transformed[i];
            const p2 = transformed[j];
            const dx = p1.px - p2.px;
            const dy = p1.py - p2.py;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 28) {
              const lineAlpha = (1 - dist / 28) * 0.25;
              ctx.strokeStyle = `rgba(52, 211, 153, ${lineAlpha})`;
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.stroke();
            }
          }
        }

        // Draw twinkling particles
        transformed.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.radius * p.scale, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * Math.min(1, Math.max(0.2, p.scale));
          ctx.shadowColor = "#34d399";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        });

        // 3. Central 4-Point Radiant Sparkle Star (Iconic center emblem)
        const starSize = 22 + Math.sin(phase * 3) * 3;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(phase * 0.4);

        // Star outer glow
        ctx.shadowColor = "#34d399";
        ctx.shadowBlur = 18;

        // Draw 4-point star diamond polygon
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(0, -starSize);
        ctx.quadraticCurveTo(0, 0, starSize, 0);
        ctx.quadraticCurveTo(0, 0, 0, starSize);
        ctx.quadraticCurveTo(0, 0, -starSize, 0);
        ctx.quadraticCurveTo(0, 0, 0, -starSize);
        ctx.closePath();
        ctx.fill();

        // Star core diamond
        ctx.fillStyle = "#6ee7b7";
        ctx.beginPath();
        ctx.moveTo(0, -starSize * 0.45);
        ctx.lineTo(starSize * 0.45, 0);
        ctx.lineTo(0, starSize * 0.45);
        ctx.lineTo(-starSize * 0.45, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      } else if (state === "listening" || state === "speaking") {
        // =========================================================================
        // MODE: LISTENING / SPEAKING EQUALIZER ORB (Matching Reference Image)
        // =========================================================================

        // 1. Dark obsidian core sphere
        const sphereGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        sphereGrad.addColorStop(0, "#064e3b");
        sphereGrad.addColorStop(0.5, "#022c22");
        sphereGrad.addColorStop(0.85, "#0f172a");
        sphereGrad.addColorStop(1, "#020617");
        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // 2. Glowing outer emerald halo ring
        ctx.save();
        ctx.shadowColor = state === "listening" ? "#10b981" : "#34d399";
        ctx.shadowBlur = state === "listening" ? 28 : 20;
        ctx.strokeStyle = "rgba(52, 211, 153, 0.9)";
        ctx.lineWidth = state === "listening" ? 3.5 : 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 3. Central Vertical Audio Equalizer Waves
        const barsCount = 28;
        const barWidth = 2.6;
        const barGap = 3.2;
        const totalWidth = barsCount * (barWidth + barGap);
        const startX = cx - totalWidth / 2;

        for (let i = 0; i < barsCount; i++) {
          const x = startX + i * (barWidth + barGap);
          const normDist = (i - barsCount / 2) / (barsCount / 2);
          const bellCurve = Math.cos(normDist * (Math.PI / 2));

          let activity = 0.2;
          if (state === "listening") {
            activity =
              Math.sin(phase * 3 + i * 0.4) * 0.45 +
              Math.cos(phase * 2.2 + i * 0.3) * 0.4 +
              0.4;
          } else {
            activity =
              Math.sin(phase * 2 + i * 0.5) * 0.4 +
              Math.cos(phase * 1.8 + i * 0.2) * 0.35 +
              0.4;
          }

          const maxBarHeight = r * 1.15 * bellCurve;
          const currentHeight = Math.max(4, maxBarHeight * Math.abs(activity));

          const barGrad = ctx.createLinearGradient(
            x,
            cy - currentHeight / 2,
            x,
            cy + currentHeight / 2
          );
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

        // 4. Subtle top glass gloss
        const glossGrad = ctx.createLinearGradient(cx, cy - r, cx, cy);
        glossGrad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
        glossGrad.addColorStop(0.4, "rgba(255, 255, 255, 0.05)");
        glossGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glossGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 2, Math.PI * 1.1, Math.PI * 1.9);
        ctx.fill();
      } else {
        // =========================================================================
        // MODE: IDLE / TAP TO SPEAK (Circular Green Mic Portal with Soft Rings)
        // =========================================================================
        const sphereGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        sphereGrad.addColorStop(0, "#064e3b");
        sphereGrad.addColorStop(0.6, "#022c22");
        sphereGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Outer pulsing ring
        ctx.save();
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 14;
        ctx.strokeStyle = "rgba(52, 211, 153, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Idle floating 4-point star in center
        const idleStar = 16 + Math.sin(phase * 1.5) * 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.shadowColor = "#34d399";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(0, -idleStar);
        ctx.quadraticCurveTo(0, 0, idleStar, 0);
        ctx.quadraticCurveTo(0, 0, 0, idleStar);
        ctx.quadraticCurveTo(0, 0, -idleStar, 0);
        ctx.quadraticCurveTo(0, 0, 0, -idleStar);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

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
      {/* Outer atmospheric aura */}
      <div
        className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-300 pointer-events-none ${
          state === "thinking"
            ? "bg-emerald-400/35 opacity-100 animate-pulse"
            : state === "listening"
            ? "bg-emerald-500/30 opacity-100"
            : "bg-emerald-500/15 opacity-70 group-hover:opacity-100"
        }`}
      />

      <canvas ref={canvasRef} style={{ width: size, height: size }} className="relative z-10" />
    </div>
  );
}

export default VoiceWaveOrb;
