"use client";

import React, { useRef, useEffect } from "react";

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = size;
    let height = size;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Generate 3D Spherical Fibonacci Particle System
    const numParticles = 420;
    const particles: Particle[] = [];
    const sphereRadius = size * 0.36;

    const colorPalette = [
      "rgba(16, 185, 129, ",   // Emerald
      "rgba(5, 150, 105, ",    // Deep Emerald
      "rgba(20, 184, 166, ",   // Teal
      "rgba(52, 211, 153, ",   // Mint
      "rgba(245, 158, 11, ",   // Warm Gold accent
      "rgba(14, 165, 233, ",   // Cyan
    ];

    for (let i = 0; i < numParticles; i++) {
      // Golden Spiral distribution on sphere surface
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
        radius: Math.random() * 2.2 + 1.2,
        color: colorPalette[i % colorPalette.length],
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
      });
    }

    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;
    let waveTime = 0;

    let targetRotSpeedX = 0.005;
    let targetRotSpeedY = 0.008;

    let currentScale = 1;
    let targetScale = 1;

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

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const currentState = stateRef.current;
      waveTime += 0.04;

      // Dynamic State Physics
      let stateScale = 1;
      let waveAmplitude = 0;
      let turbulence = 0;
      let glowColor = "rgba(16, 185, 129, 0.08)";

      if (currentState === "idle") {
        targetRotSpeedX = 0.004;
        targetRotSpeedY = 0.007;
        stateScale = 1 + Math.sin(waveTime * 0.8) * 0.04;
        waveAmplitude = 3;
        glowColor = "rgba(16, 185, 129, 0.06)";
      } else if (currentState === "listening") {
        // High reactive displacement & organic wave ripples
        targetRotSpeedX = 0.012;
        targetRotSpeedY = 0.018;
        stateScale = 1.12 + Math.sin(waveTime * 2.5) * 0.08;
        waveAmplitude = 18;
        turbulence = Math.sin(waveTime * 4) * 8;
        glowColor = "rgba(239, 68, 68, 0.12)"; // Vibrant listening ring
      } else if (currentState === "thinking") {
        // Swirling vortex mode
        targetRotSpeedX = 0.035;
        targetRotSpeedY = 0.055;
        stateScale = 0.95 + Math.sin(waveTime * 3) * 0.06;
        waveAmplitude = 8;
        turbulence = Math.cos(waveTime * 5) * 12;
        glowColor = "rgba(245, 158, 11, 0.14)"; // Golden vortex
      } else if (currentState === "speaking") {
        // Rhythmic pulsing harmonic waves
        targetRotSpeedX = 0.008;
        targetRotSpeedY = 0.014;
        stateScale = 1.15 + Math.abs(Math.sin(waveTime * 1.8)) * 0.12;
        waveAmplitude = 14;
        glowColor = "rgba(20, 184, 166, 0.15)"; // Teal speaking glow
      }

      currentScale += (stateScale - currentScale) * 0.1;

      // Rotation matrix updates with pointer steer
      rotX += targetRotSpeedX + (isHovered ? mouseY * 0.01 : 0);
      rotY += targetRotSpeedY + (isHovered ? mouseX * 0.01 : 0);
      rotZ += 0.002;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      // Central Ambient Radial Glow
      const centerGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        sphereRadius * currentScale * 1.3
      );
      centerGrad.addColorStop(0, glowColor);
      centerGrad.addColorStop(0.6, glowColor.replace(/[\d\.]+\)$/, "0.02)"));
      centerGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, sphereRadius * currentScale * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Transform & Project 3D particles onto 2D canvas
      const projectedParticles: {
        x2d: number;
        y2d: number;
        z3d: number;
        radius: number;
        alpha: number;
        color: string;
      }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Wave Displacement on surface
        const displacement =
          Math.sin(p.phase + waveTime * 2) * waveAmplitude +
          Math.cos(p.baseX * 0.05 + waveTime) * turbulence;

        const currentRadius = sphereRadius + displacement;
        const norm = Math.hypot(p.baseX, p.baseY, p.baseZ) || 1;
        const px = (p.baseX / norm) * currentRadius * currentScale;
        const py = (p.baseY / norm) * currentRadius * currentScale;
        const pz = (p.baseZ / norm) * currentRadius * currentScale;

        // 3D Rotations
        // Y-axis
        const x1 = px * cosY + pz * sinY;
        const y1 = py;
        const z1 = -px * sinY + pz * cosY;

        // X-axis
        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        // Z-axis
        const x3 = x2 * cosZ - y2 * sinZ;
        const y3 = x2 * sinZ + y2 * cosZ;
        const z3 = z2;

        // Perspective projection
        const fov = 340;
        const distance = fov / (fov + z3);
        const x2d = width / 2 + x3 * distance;
        const y2d = height / 2 + y3 * distance;

        // Depth-based alpha & sizing (front particles are larger & brighter)
        const depthNorm = (z3 + sphereRadius * 1.4) / (sphereRadius * 2.8);
        const alpha = Math.max(0.15, Math.min(1, depthNorm * 0.9 + 0.1));
        const pRadius = Math.max(0.8, p.radius * distance * 1.1);

        projectedParticles.push({
          x2d,
          y2d,
          z3d: z3,
          radius: pRadius,
          alpha,
          color: p.color,
        });
      }

      // Sort by Z for proper depth rendering
      projectedParticles.sort((a, b) => a.z3d - b.z3d);

      // Render Particles with Soft Luminous Halos
      for (let i = 0; i < projectedParticles.length; i++) {
        const p = projectedParticles[i];

        ctx.beginPath();
        ctx.arc(p.x2d, p.y2d, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // Extra specular glow on front-facing particles
        if (p.z3d > sphereRadius * 0.3) {
          ctx.beginPath();
          ctx.arc(p.x2d, p.y2d, p.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha * 0.25})`;
          ctx.fill();
        }
      }

      // Draw delicate dynamic connection filaments between nearby foreground points
      ctx.lineWidth = 0.6;
      for (let i = 0; i < projectedParticles.length; i += 3) {
        const p1 = projectedParticles[i];
        if (p1.z3d < 0) continue;

        for (let j = i + 1; j < projectedParticles.length; j += 4) {
          const p2 = projectedParticles[j];
          if (p2.z3d < 0) continue;

          const dist = Math.hypot(p1.x2d - p2.x2d, p1.y2d - p2.y2d);
          if (dist < 28) {
            const lineAlpha = (1 - dist / 28) * 0.18 * p1.alpha;
            ctx.strokeStyle = `rgba(16, 185, 129, ${lineAlpha})`;
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
  }, [size]);

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
