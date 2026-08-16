"use client";

import React, { useRef, useState, useEffect, type CSSProperties, type ReactNode, type MouseEventHandler } from "react";

type ButtonSize = "sm" | "md" | "lg";

export interface SpecularButtonProps {
  children?: ReactNode;
  size?: ButtonSize;
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const SIZES: Record<ButtonSize, string> = {
  sm: "text-[0.82rem] px-4 py-2",
  md: "text-[0.92rem] px-5 py-2.5",
  lg: "text-[1.02rem] px-7 py-3.5",
};

export function SpecularButton({
  children = "Get Started",
  size = "md",
  radius = 14,
  tint = "#0f172a",
  tintOpacity = 1,
  blur = 0,
  textColor = "#ffffff",
  lineColor = "#10b981",
  baseColor = "#334155",
  intensity = 1.2,
  speed = 0.45,
  followMouse = true,
  proximity = 200,
  autoAnimate = true,
  disabled = false,
  onClick,
  className = "",
  type = "button",
}: SpecularButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!followMouse || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos(null);
  };

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden inline-flex cursor-pointer items-center justify-center font-bold tracking-tight outline-none transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] ${SIZES[size] || SIZES.md} ${className}`}
      style={{
        borderRadius: `${radius}px`,
        backgroundColor: tint,
        color: textColor,
        border: `1px solid ${isHovered ? lineColor : "rgba(255, 255, 255, 0.15)"}`,
      }}
    >
      {/* Specular Radial Glow Follower */}
      {mousePos && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            background: `radial-gradient(120px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.22), transparent 70%)`,
          }}
        />
      )}

      {/* Auto-animate Specular Shimmer Sweep */}
      {autoAnimate && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
        />
      )}

      {/* Subtle Bottom Rim Light */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

export default SpecularButton;
