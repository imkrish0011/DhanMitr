import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

// ==========================================
// DhanMITR Brand & Core System SVG Icons
// ==========================================

export const DhanMitrLogo: React.FC<IconProps> = ({ className = 'w-7 h-7', ...props }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="40" height="40" rx="10" fill="url(#logo_grad)" />
    <path
      d="M20 9L29 14.5V25.5L20 31L11 25.5V14.5L20 9Z"
      stroke="white"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <path
      d="M16 15H24M16 19H23M16 23H20M20 15V25"
      stroke="#A7F3D0"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="20" cy="20" r="1.5" fill="#10B981" />
    <defs>
      <linearGradient id="logo_grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10B981" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
    </defs>
  </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" fillOpacity="0.15" />
  </svg>
);

export const SparkleSmallIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
  </svg>
);

export const HandWaveIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M6 14v-1.5a1.5 1.5 0 0 0-3 0v4a7.5 7.5 0 0 0 7.5 7.5h3a7.5 7.5 0 0 0 7.5-7.5V11a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3" />
  </svg>
);

export const CelebrationIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M4 22l6-14 10 10-16 4z" fill="currentColor" fillOpacity="0.15" />
    <path d="M18 4l1 2" />
    <path d="M21 9l-2-1" />
    <path d="M14 2l1 3" />
    <path d="M8 3l.5 2.5" />
    <circle cx="17" cy="10" r="1" fill="currentColor" />
    <circle cx="12" cy="5" r="1" fill="currentColor" />
  </svg>
);

export const RocketIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2.5 5-2.5" />
    <path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 2.5-5 2.5-5" />
  </svg>
);

export const WalletIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a2 2 0 0 1-2-2V5" />
    <path d="M16 14h.01" strokeWidth="3" />
    <rect x="14" y="11" width="7" height="6" rx="1.5" />
  </svg>
);

export const ArrowDownOutflowIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="8 12 12 16 16 12" />
    <line x1="12" y1="8" x2="12" y2="16" />
  </svg>
);

export const TrendingUpIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export const BellIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const MicIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

export const SendIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

export const StopIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <rect x="5" y="5" width="14" height="14" rx="2" />
  </svg>
);

export const HomeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const TransactionsIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="3.5" cy="6" r="1.5" fill="currentColor" />
    <circle cx="3.5" cy="12" r="1.5" fill="currentColor" />
    <circle cx="3.5" cy="18" r="1.5" fill="currentColor" />
  </svg>
);

export const InsightsIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 3v18h18" />
    <path d="M18 9l-5 5-3-3-4 4" />
    <circle cx="18" cy="9" r="1.5" fill="currentColor" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

export const BulbIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .39 1.97 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

// =========================================================
// Real Authentic Vector OTT & Corporate Subscription Logos
// =========================================================

export const NetflixLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`flex items-center justify-center bg-black rounded-xl p-1.5 shadow-sm ${className}`}>
    <svg viewBox="0 0 111 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M0 0H26V150H0V0Z" fill="#E50914" />
      <path d="M85 0H111V150H85V0Z" fill="#E50914" />
      <path d="M0 0L85 150H111L26 0H0Z" fill="#B81D24" />
    </svg>
  </div>
);

export const AmazonPrimeLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`flex items-center justify-center bg-[#0F172A] border border-slate-700/60 rounded-xl p-1.5 shadow-sm ${className}`}>
    <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <text x="60" y="32" textAnchor="middle" fill="#00A8E1" fontSize="28" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif">
        prime
      </text>
      <path
        d="M20 46 C 45 62, 75 62, 98 48"
        stroke="#FF9900"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M93 42 L 102 49 L 91 56"
        stroke="#FF9900"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export const SpotifyLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`flex items-center justify-center bg-[#1DB954] rounded-xl p-1.5 shadow-sm ${className}`}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path
        d="M4.5 9.5C10 7.8 16 8.5 20 11.5"
        stroke="#000000"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M5.5 13.5C10 12.2 14.8 12.8 18.5 15"
        stroke="#000000"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M6.5 17.5C10 16.5 13.5 17 16.8 18.8"
        stroke="#000000"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

export const HotstarLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`flex items-center justify-center bg-[#07132e] border border-blue-900 rounded-xl p-1.5 shadow-sm ${className}`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path
        d="M50 8L62 33L90 37L70 56L75 84L50 70L25 84L30 56L10 37L38 33L50 8Z"
        fill="url(#hotstar_grad_real)"
      />
      <text x="50%" y="95" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif">
        hotstar
      </text>
      <defs>
        <linearGradient id="hotstar_grad_real" x1="10" y1="8" x2="90" y2="84" gradientUnits="userSpaceOnUse">
          <stop stopColor="#30D68A" />
          <stop offset="0.5" stopColor="#00A2FF" />
          <stop offset="1" stopColor="#9C27B0" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

export const YouTubeLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`flex items-center justify-center bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm ${className}`}>
    <svg viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="100" height="70" rx="16" fill="#FF0000" />
      <polygon points="40,20 70,35 40,50" fill="white" />
    </svg>
  </div>
);

export const AppleLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`flex items-center justify-center bg-black text-white rounded-xl p-1.5 shadow-sm ${className}`}>
    <svg viewBox="0 0 170 170" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.85-12.03-14.31-6.73-10.15-12.03-21.84-15.89-35.08-3.86-13.23-5.79-25.54-5.79-36.91 0-14.5 3.65-26.68 10.96-36.56 7.31-9.88 16.48-14.92 27.5-15.12 4.12 0 9.07 1.15 14.85 3.44 5.78 2.29 9.58 3.47 11.4 3.56 1.83 0 5.78-1.24 11.85-3.73 6.07-2.49 11.06-3.6 14.97-3.34 14.5.78 25.59 5.86 33.27 15.24-12.97 7.84-19.34 18.57-19.11 32.18.23 10.66 4.3 19.54 12.21 26.64 3.96 3.55 8.44 6.22 13.44 8.01-2.9 8.44-6.39 16.89-10.45 25.35zM119.22 33.09c0-7.39 2.68-14.43 8.04-21.13 5.36-6.7 11.96-10.96 19.8-12.79.88 7.39-1.63 14.5-7.53 21.32-5.9 6.82-12.66 11.03-20.31 12.6z" />
    </svg>
  </div>
);

export const OpenAILogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`flex items-center justify-center bg-[#10A37F] text-white rounded-xl p-1.5 shadow-sm ${className}`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  </div>
);

export const ClaudeLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`flex items-center justify-center bg-[#D97757] text-white rounded-xl p-1.5 shadow-sm ${className}`}>
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9" />
    </svg>
  </div>
);

export const SonyLivLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`flex items-center justify-center bg-black rounded-xl p-1.5 shadow-sm ${className}`}>
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="40" cy="40" r="36" stroke="url(#liv_grad_real)" strokeWidth="8" />
      <text x="40" y="47" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900" fontFamily="sans-serif">
        LIV
      </text>
      <defs>
        <linearGradient id="liv_grad_real" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF5722" />
          <stop offset="0.5" stopColor="#FFEB3B" />
          <stop offset="1" stopColor="#00BCD4" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

export const InsuranceShieldLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-200 rounded-xl p-1.5 shadow-sm ${className}`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#DBEAFE" />
      <path d="M9 12l2 2 4-4" stroke="#2563EB" strokeWidth="2.5" />
    </svg>
  </div>
);

export const HdfcLifeLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`flex items-center justify-center bg-white border border-red-200 rounded-xl p-1 shadow-sm ${className}`}>
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#004C8F] text-white rounded-lg font-bold text-[9px] leading-none p-0.5">
      <span className="text-[#ED1C24] font-extrabold text-[10px]">HDFC</span>
      <span className="text-[7px] tracking-tighter">LIFE</span>
    </div>
  </div>
);

export const StarHealthLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`flex items-center justify-center bg-white border border-blue-200 rounded-xl p-1 shadow-sm ${className}`}>
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#006BB6] text-white rounded-lg font-bold text-[8px] leading-tight p-0.5">
      <span className="text-[#FDB913] text-[9px]">★ STAR</span>
      <span className="text-[7px]">HEALTH</span>
    </div>
  </div>
);

export const IciciLombardLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <div className={`flex items-center justify-center bg-white border border-orange-200 rounded-xl p-1 shadow-sm ${className}`}>
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#84191C] text-white rounded-lg font-bold text-[8px] leading-tight p-0.5">
      <span className="text-[#F37021] text-[9px]">ICICI</span>
      <span className="text-[6px] tracking-tighter">LOMBARD</span>
    </div>
  </div>
);

/**
 * Universal Real Provider Logo Resolver
 */
export const ProviderLogo: React.FC<{ logoKey: string; className?: string; altName?: string }> = ({
  logoKey,
  className = 'w-10 h-10',
  altName,
}) => {
  switch (logoKey?.toLowerCase()) {
    case 'netflix':
      return <NetflixLogo className={className} />;
    case 'amazon_prime':
    case 'prime':
      return <AmazonPrimeLogo className={className} />;
    case 'spotify':
      return <SpotifyLogo className={className} />;
    case 'hotstar':
    case 'disney_plus':
      return <HotstarLogo className={className} />;
    case 'youtube':
      return <YouTubeLogo className={className} />;
    case 'apple':
    case 'apple_one':
    case 'apple_tv':
      return <AppleLogo className={className} />;
    case 'chatgpt':
    case 'openai':
      return <OpenAILogo className={className} />;
    case 'claude':
    case 'anthropic':
      return <ClaudeLogo className={className} />;
    case 'sonyliv':
      return <SonyLivLogo className={className} />;
    case 'hdfc_life':
      return <HdfcLifeLogo className={className} />;
    case 'star_health':
      return <StarHealthLogo className={className} />;
    case 'icici_lombard':
      return <IciciLombardLogo className={className} />;
    case 'term_life':
    case 'insurance':
    default:
      return <InsuranceShieldLogo className={className} />;
  }
};
