import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ className = "", size = 36, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Custom Geometric DhanMITR SVG Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="dhanmitr-grad-1" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id="dhanmitr-grad-2" x1="16" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#10B981" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer squircle rounded badge */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="14"
          fill="url(#dhanmitr-grad-1)"
          filter="url(#glow)"
        />

        {/* Inner subtle glow rim */}
        <rect
          x="4.5"
          y="4.5"
          width="39"
          height="39"
          rx="12.5"
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="1.5"
        />

        {/* Stylized Modern "D / ₹" Growth Symbol */}
        <path
          d="M15 15H31C33.2 15 34.5 16.8 34.5 19C34.5 21.2 33.2 23 31 23H15"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 22H27"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M21 15V33"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M21 23L33 34"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Spark of Intelligence / Growth dot */}
        <circle cx="34.5" cy="14.5" r="2.5" fill="#FEF08A" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
            Dhan<span className="text-emerald-600">MITR</span>
          </span>
          <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase mt-0.5">
            AI Financial Assistant
          </span>
        </div>
      )}
    </div>
  );
}
