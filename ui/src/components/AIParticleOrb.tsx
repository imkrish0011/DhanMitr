"use client";

import React, { useRef, useEffect, useState } from "react";

export type AIOrbState = "idle" | "listening" | "thinking" | "speaking";

interface AIParticleOrbProps {
  state: AIOrbState;
  className?: string;
  size?: number;
  onClick?: () => void;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  radius: number;
  color: string;
  specular: boolean;
  phase: number;
  speed: number;
}

export function AIParticleOrb({
  state = "idle",
  className = "",
  size = 280,
  onClick,
}: AIParticleOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<AIOrbState>(state);
  stateRef.current = state;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const width = size;
    const height = size;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // 3D Spherical Fibonacci Particle System in Premium Silver & Black Palette
    const numParticles = 460;
    const particles: Particle[] = [];
    const sphereRadius = size * 0.36;

    // Monochrome Silver, Chrome, Platinum, and Obsidian Black palette
    const silverBlackPalette = [
      "rgba(15, 23, 42, ",     // Deep Obsidian Black
      "rgba(30, 41, 59, ",     // Gunmetal Slate
      "rgba(51, 65, 85, ",     // Charcoal Graphite
      "rgba(100, 116, 139, ",   // Silver Slate
      "rgba(148, 163, 184, ",  // Cool Platinum
      "rgba(203, 213, 225, ",  // Bright Silver Chrome
      "rgba(226, 232, 240, ",  // Luminous White Silver
      "rgba(2, 6, 23, ",       // True Black
    ];

    for (let i = 0; i < numParticles; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / numParticles);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = sphereRadius * Math.sin(phi) * Math.cos(theta);
      const y = sphereRadius * Math.sin(phi) * Math.sin(theta);
      const z = sphereRadius * Math.cos(phi);

      particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        radius: Math.random() * 2.4 + 1.1,
        color: silverBlackPalette[i % silverBlackPalette.length],
        specular: i % 3 === 0,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
      });
    }

    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;
    let waveTime = 0;

    let targetRotSpeedX = 0.004;
    let targetRotSpeedY = 0.007;

    let currentScale = 1;

    // Mouse / Touch interaction
    let mouseX = 0;
    let mouseY = 0;
    let isHovered = false;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      mouseY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      isHovered = true;
    };

    const handlePointerLeave = () => {
      isHovered = false;
      mouseX = 0;
      mouseY = 0;
    };

    canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const currentState = stateRef.current;
      waveTime += 0.04;

      // Dynamic State Physics
      let stateScale = 1;
      let waveAmplitude = 0;
      let turbulence = 0;
      let glowColor = "rgba(15, 23, 42, 0.05)";

      if (currentState === "idle") {
        targetRotSpeedX = 0.003;
        targetRotSpeedY = 0.006;
        stateScale = 1 + Math.sin(waveTime * 0.8) * 0.035;
        waveAmplitude = 2.5;
        glowColor = "rgba(100, 116, 139, 0.06)";
      } else if (currentState === "listening") {
        // High reactive displacement & organic wave ripples
        targetRotSpeedX = 0.012;
        targetRotSpeedY = 0.018;
        stateScale = 1.12 + Math.sin(waveTime * 2.5) * 0.08;
        waveAmplitude = 16;
        turbulence = Math.sin(waveTime * 4) * 8;
        glowColor = "rgba(15, 23, 42, 0.12)"; // Deep obsidian pulse
      } else if (currentState === "thinking") {
        // Swirling vortex mode
        targetRotSpeedX = 0.035;
        targetRotSpeedY = 0.055;
        stateScale = 0.95 + Math.sin(waveTime * 3) * 0.06;
        waveAmplitude = 7;
        turbulence = Math.cos(waveTime * 5) * 11;
        glowColor = "rgba(71, 85, 105, 0.14)"; // Silver graphite vortex
      } else if (currentState === "speaking") {
        // Rhythmic pulsing harmonic waves
        targetRotSpeedX = 0.007;
        targetRotSpeedY = 0.014;
        stateScale = 1.14 + Math.abs(Math.sin(waveTime * 1.8)) * 0.1;
        waveAmplitude = 12;
        glowColor = "rgba(148, 163, 184, 0.15)"; // Luminous silver speaking glow
      }

      currentScale += (stateScale - currentScale) * 0.1;

      // Rotation matrix updates with pointer steer
      rotX += targetRotSpeedX + (isHovered ? mouseY * 0.008 : 0);
      rotY += targetRotSpeedY + (isHovered ? mouseX * 0.008 : 0);
      rotZ += 0.0015;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      // Central Ambient Radial Silver/Obsidian Glow
      const centerGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        8,
        width / 2,
        height / 2,
        sphereRadius * currentScale * 1.35
      );
      centerGrad.addColorStop(0, glowColor);
      centerGrad.addColorStop(0.6, "rgba(203, 213, 225, 0.04)");
      centerGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, sphereRadius * currentScale * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Project 3D particles onto 2D canvas
      const projectedParticles: {
        x2d: number;
        y2d: number;
        z3d: number;
        radius: number;
        alpha: number;
        color: string;
        specular: boolean;
      }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const displacement =
          Math.sin(p.phase + waveTime * 2) * waveAmplitude +
          Math.cos(p.baseX * 0.05 + waveTime) * turbulence;

        const currentRadius = sphereRadius + displacement;
        const norm = Math.hypot(p.baseX, p.baseY, p.baseZ) || 1;
        const px = (p.baseX / norm) * currentRadius * currentScale;
        const py = (p.baseY / norm) * currentRadius * currentScale;
        const pz = (p.baseZ / norm) * currentRadius * currentScale;

        // 3D Rotations
        const x1 = px * cosY + pz * sinY;
        const y1 = py;
        const z1 = -px * sinY + pz * cosY;

        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        const x3 = x2 * cosZ - y2 * sinZ;
        const y3 = x2 * sinZ + y2 * cosZ;
        const z3 = z2;

        const fov = 340;
        const distance = fov / (fov + z3);
        const x2d = width / 2 + x3 * distance;
        const y2d = height / 2 + y3 * distance;

        const depthNorm = (z3 + sphereRadius * 1.4) / (sphereRadius * 2.8);
        const alpha = Math.max(0.18, Math.min(1, depthNorm * 0.88 + 0.12));
        const pRadius = Math.max(0.8, p.radius * distance * 1.1);

        projectedParticles.push({
          x2d,
          y2d,
          z3d: z3,
          radius: pRadius,
          alpha,
          color: p.color,
          specular: p.specular,
        });
      }

      // Sort by Z for proper depth
      projectedParticles.sort((a, b) => a.z3d - b.z3d);

      // Render Silver & Obsidian Particles
      for (let i = 0; i < projectedParticles.length; i++) {
        const p = projectedParticles[i];

        ctx.beginPath();
        ctx.arc(p.x2d, p.y2d, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // Extra specular platinum sheen on highlighted foreground particles
        if (p.specular && p.z3d > sphereRadius * 0.2) {
          ctx.beginPath();
          ctx.arc(p.x2d, p.y2d, p.radius * 2.0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.4})`;
          ctx.fill();
        }
      }

      // Render delicate silver metallic filament lines
      ctx.lineWidth = 0.5;
      for (let i = 0; i < projectedParticles.length; i += 3) {
        const p1 = projectedParticles[i];
        if (p1.z3d < -10) continue;

        for (let j = i + 1; j < projectedParticles.length; j += 4) {
          const p2 = projectedParticles[j];
          if (p2.z3d < -10) continue;

          const dist = Math.hypot(p1.x2d - p2.x2d, p1.y2d - p2.y2d);
          if (dist < 26) {
            const lineAlpha = (1 - dist / 26) * 0.16 * p1.alpha;
            ctx.strokeStyle = `rgba(100, 116, 139, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x2d, p1.y2d);
            ctx.lineTo(p2.x2d, p2.y2d);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [mounted, size]);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="w-full h-full block"
      />
    </div>
  );
}

export default AIParticleOrb;
