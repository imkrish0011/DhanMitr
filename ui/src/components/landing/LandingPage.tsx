'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  DhanMitrLogo,
  SparkleSmallIcon,
  SparklesIcon,
  LockIcon,
  WalletIcon,
} from '@/components/icons/CustomIcons';
import {
  Mic,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon,
  BarChart3,
  Calendar,
  Layers,
  Scale,
  Zap,
  Calculator,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAi: (mode: 'voice' | 'chat') => void;
  onLaunchHub: () => void;
  onOpenCalculator?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAi, onLaunchHub, onOpenCalculator }) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, openAuthModal } = useAuth();

  // Interactive Intelligence Showcase State
  const [activeScenario, setActiveScenario] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const scenarios = [
    {
      id: 'voice_expense',
      tabLabel: 'Voice Expense Logging',
      badge: 'INDIC HINGLISH STT',
      icon: Mic,
      userQuery: '“Bhai, kal Sham ko doston ke sath ₹2,450 dinner aur ₹320 cab pe gaye. Update my budget cap.”',
      langTag: '🇮🇳 Spoken in Hinglish',
      audioDuration: '0:04s',
      aiResponse: 'Logged ₹2,450 under Dining and ₹320 under Transit. Your weekly dining budget cap is at 68% (₹4,230 buffer remaining).',
      metrics: [
        { label: 'Parsed Entities', value: 'Dining ₹2,450 • Cab ₹320', color: 'text-emerald-500' },
        { label: 'Weekly Cap Left', value: '₹4,230 Buffer (Safe)', color: 'text-teal-400' },
        { label: 'Runway Status', value: '6.0 Mos Intact', color: 'text-blue-400' },
      ],
      tag: 'Zero Manual Entry',
    },
    {
      id: 'zombie_subs',
      tabLabel: 'Zombie Subscriptions',
      badge: 'AUTONOMOUS RADAR',
      icon: Zap,
      userQuery: '“Detect all unused recurring subscriptions or zombie charges across my accounts.”',
      langTag: '🇬🇧 English Voice',
      audioDuration: '0:03s',
      aiResponse: 'Found 3 dormant subscriptions: SonyLIV (0 logins in 42 days), an annual gym auto-renew, and redundant cloud storage. Pausing them recovers ₹31,580/year.',
      metrics: [
        { label: 'Dormant Debits', value: '3 Active Auto-Debits', color: 'text-rose-400' },
        { label: 'Annual Drain', value: '₹31,580 / Year', color: 'text-amber-400' },
        { label: 'Autonomous Action', value: '1-Tap Pause Script Ready', color: 'text-emerald-500' },
      ],
      tag: 'Recovered Wealth',
    },
    {
      id: 'tax_arbitrage',
      tabLabel: 'FY 25-26 Tax Strategy',
      badge: 'UNION BUDGET FY 25-26',
      icon: Scale,
      userQuery: '“Meri gross income ₹18 Lakhs hai. Revised ₹75k standard deduction ke sath New ya Old regime lena chahiye?”',
      langTag: '🇮🇳 Spoken in Hindi',
      audioDuration: '0:05s',
      aiResponse: 'Under Section 115BAC (New Regime), revised slabs and the enhanced ₹75,000 standard deduction give you an exact net savings of ₹18,200 without locking money in 80C.',
      metrics: [
        { label: 'Optimal Choice', value: 'New Regime (115BAC)', color: 'text-emerald-500' },
        { label: 'Standard Ded.', value: '₹75,000 Applied', color: 'text-teal-400' },
        { label: 'Net Rupee Savings', value: '₹18,200 in Hand', color: 'text-emerald-400' },
      ],
      tag: 'Autonomous Tax Slabs',
    },
    {
      id: 'runway_guard',
      tabLabel: '6-Month Runway Guard',
      badge: 'LIQUIDITY DEFENSE',
      icon: ShieldCheck,
      userQuery: '“Can I comfortably purchase the new ₹1,19,900 laptop this weekend without breaking resilience?”',
      langTag: '🇬🇧 English Voice',
      audioDuration: '0:04s',
      aiResponse: 'Caution: This purchase lowers your liquid runway from 6.2 months down to 4.1 months (below your 6-month safety line). DhanMITR recommends deferring by 45 days.',
      metrics: [
        { label: 'Current Runway', value: '6.2 Mos (₹2.85L Reserves)', color: 'text-teal-400' },
        { label: 'Post-Spend Runway', value: '4.1 Mos (Safety Warning)', color: 'text-amber-400' },
        { label: 'Companion Advice', value: 'Defer 45 Days to Bonus', color: 'text-emerald-500' },
      ],
      tag: 'Financial Sovereignty',
    },
  ];

  const faqs = [
    {
      q: 'Can I test the Voice AI without signing up?',
      a: 'Yes. Voice and chat intelligence are completely open to test immediately in your browser. Signing in is only needed when you want to link your personal accounts, ledgers, and policies.',
    },
    {
      q: 'How is my financial data protected from third parties?',
      a: 'DhanMITR enforces cryptographic PostgreSQL Row-Level Security (RLS) via Supabase. We never sell, scrape, or share your financial records with advertising brokers or credit card marketers.',
    },
    {
      q: 'Are the tax calculations accurate for FY 2025-26?',
      a: 'Yes. It reflects the latest Union Budget provisions, including the enhanced ₹75,000 standard deduction under the New Tax Regime, revised slab rates, Section 87A rebate, and Chapter VI-A deductions (80C, 80D).',
    },
    {
      q: 'Which Indic languages are supported?',
      a: 'DhanMITR natively understands Hindi, conversational Hinglish (mixed Hindi and English), and English with sub-180ms streaming inference.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#FAFCFF] dark:bg-[#050811] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-500">
      {/* Ambient background glows with generous diffusion */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30 dark:opacity-50 bg-radial-mesh" />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-10 dark:opacity-20 bg-grid-subtle" />

      {/* ========================================================================= */}
      {/* 1. FLOATING LUXURY NAVBAR                                                 */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-white/5 bg-[#FAFCFF]/80 dark:bg-[#050811]/80 backdrop-blur-2xl transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Brand Emblem */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={onLaunchHub} title="DhanMitr AI Finance Hub">
              <DhanMitrLogo className="w-10 h-8 group-hover:scale-105 transition-transform shrink-0" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Dhan<span className="text-emerald-500 font-bold">Mitr</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  SOVEREIGN AI 2.0
                </span>
              </div>
              <span className="hidden sm:block text-[8px] font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                YOUR FINANCIAL FRIEND
              </span>
            </div>
          </div>

          {/* Clean Anchor Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <a href="#pillars" className="hover:text-emerald-500 dark:hover:text-white transition-colors">
              Pillars
            </a>
            <a href="#intelligence" className="hover:text-emerald-500 dark:hover:text-white transition-colors">
              AI Intelligence
            </a>
            <a href="#architecture" className="hover:text-emerald-500 dark:hover:text-white transition-colors">
              Architecture
            </a>
            <a href="#faq" className="hover:text-emerald-500 dark:hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/5 transition-colors cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              onClick={onOpenCalculator || onLaunchHub}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="10% Margin & Quarterly Moratorium MSME Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">MSME Calculator</span>
              <span className="sm:hidden">Loans</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold">New</span>
            </button>

            <button
              onClick={() => onOpenAi('voice')}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Copilot</span>
            </button>

            {isAuthenticated ? (
              <button
                onClick={onLaunchHub}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
              >
                <span>Enter Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-sm cursor-pointer transition-all"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION — SPACIOUS, CONFIDENT, BREATHING ROOM                     */}
      {/* ========================================================================= */}
      <section className="relative pt-24 sm:pt-32 pb-20 px-6 max-w-6xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto space-y-7"
        >
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full fintech-card text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-emerald-500/30 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-mono tracking-wide">BHARAT&apos;S SOVEREIGN WEALTH OS • FY 2025-26</span>
          </div>

          {/* Master Headline using new luxury font */}
          <h1 className="font-display text-5xl sm:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.04]">
            Financial Mastery.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Powered by Voice.
            </span>
          </h1>

          {/* 1 Crisp Value Proposition */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal max-w-xl mx-auto leading-relaxed">
            Real-time Indic voice AI for conversational cash flow analysis, automated tax regime optimization, and 6-month wealth runway.
          </p>

          {/* Action CTAs */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onOpenAi('voice')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Mic className="w-4 h-4 text-slate-950" />
              <span>Try Voice Copilot Free</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={onOpenCalculator || onLaunchHub}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm group"
            >
              <Calculator className="w-4 h-4 text-emerald-500 group-hover:rotate-12 transition-transform" />
              <span>MSME Project Loan Suite</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold">10% Margin</span>
            </button>

            <button
              onClick={onLaunchHub}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl fintech-card fintech-card-hover text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-200/80 dark:border-white/10 transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span>{isAuthenticated ? 'Open Hub' : 'Explore'}</span>
            </button>
          </div>

          {/* Micro Trust Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <button
              onClick={onOpenCalculator || onLaunchHub}
              className="px-3 py-1 rounded-full fintech-card border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1.5 hover:bg-emerald-500/10 transition-colors cursor-pointer"
            >
              <Calculator className="w-3 h-3 text-emerald-500" />
              10% Margin & Quarterly Moratorium
            </button>
            <span className="px-3 py-1 rounded-full fintech-card border border-slate-200/60 dark:border-white/5 font-mono">
              &lt;180ms Voice
            </span>
            <span className="px-3 py-1 rounded-full fintech-card border border-slate-200/60 dark:border-white/5 font-mono">
              Old vs New Tax Engine
            </span>
            <span className="px-3 py-1 rounded-full fintech-card border border-slate-200/60 dark:border-white/5 font-mono">
              Hyper-Local Feasibility
            </span>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 3. SHOWCASE TELEMETRY CARD — SPACIOUS & JITTER-FREE                       */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 max-w-4.5xl mx-auto"
        >
          <div className="p-2 sm:p-3 rounded-3xl bg-gradient-to-b from-slate-200/50 via-slate-100/20 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent shadow-2xl border border-slate-200/60 dark:border-white/10 backdrop-blur-2xl">
            <div className="fintech-card rounded-[22px] overflow-hidden p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <SparkleSmallIcon className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Live Financial Telemetry
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Salaried Professional • Gurugram • INR (₹)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAi('voice')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Speak</span>
                  </button>
                  <button
                    onClick={() => onOpenAi('chat')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200/70 dark:border-white/10 flex items-center gap-1.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                  >
                    <span>Chat</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 3 Metric Cards with Tabular Font */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070B16] border border-slate-200/80 dark:border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Monthly Surplus</span>
                    <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                      +57% Rate
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                    ₹82,600
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '57%' }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070B16] border border-slate-200/80 dark:border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Survival Runway</span>
                    <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                      Optimal
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                    6.0 <span className="text-xs text-slate-400 font-sans font-bold">Months</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div className="bg-teal-500 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070B16] border border-slate-200/80 dark:border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tax Optimization</span>
                    <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-mono">
                      New Regime
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-500 font-mono tabular-nums">
                    ₹18,200 <span className="text-xs text-slate-400 font-sans font-normal">saved</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
              </div>

              {/* Streaming Audio Visualizer — Strict Fixed Height (Zero Reflow) */}
              <div className="h-14 px-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex items-center justify-between gap-3 overflow-hidden">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                    <Mic className="w-3.5 h-3.5 text-slate-950" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                      &quot;मेरी बचत दर और अगले महीने के रिन्यूअल्स बताओ&quot;
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      Hindi STT • 142ms TTFT
                    </span>
                  </div>
                </div>

                <div className="h-8 w-28 flex items-center justify-end gap-1 shrink-0 overflow-hidden">
                  {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65].map((val, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-emerald-500 rounded-full origin-center shrink-0"
                      style={{ height: '22px' }}
                      animate={{ scaleY: [0.25, Math.max(0.3, val / 100), 0.25] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.15,
                        delay: i * 0.07,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THE 3 ICONIC PILLARS (UNCONGESTED, SPACIOUS 3-CARD LAYOUT)             */}
      {/* ========================================================================= */}
      <section id="pillars" className="py-24 px-6 max-w-6xl mx-auto relative z-10 border-t border-slate-200/60 dark:border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-xl mx-auto mb-16 space-y-2"
        >
          <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-500 uppercase">
            SOVEREIGN INTELLIGENCE
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Three Pillars of Wealth Control
          </h2>
        </motion.div>

        {/* 3 Spacious Monumental Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="fintech-card fintech-card-hover rounded-3xl p-7 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Mic className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-500">Sub-180ms Latency</span>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  Indic Voice Intelligence
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Speak naturally in Hindi, Hinglish, or English. Instant budget logging and conversational guidance.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/60 dark:border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Sample Queries</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                  &quot;ग्रॉसरी बजट अपडेट करो&quot;
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                  &quot;Netflix renew कब होगा?&quot;
                </span>
              </div>
            </div>
          </motion.div>

          {/* Pillar 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="fintech-card fintech-card-hover rounded-3xl p-7 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-teal-500" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-teal-500">Liquidity Guard</span>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  6-Month Wealth Runway
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Real-time burn calculation against liquid reserves to ensure complete debt-free resilience.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070B16] border border-slate-200/70 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">6.0 Mos</span>
                <span className="text-[10px] text-slate-400 block font-mono">₹2.7L Liquid Reserve</span>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                PROTECTED
              </span>
            </div>
          </motion.div>

          {/* Pillar 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="fintech-card fintech-card-hover rounded-3xl p-7 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Scale className="w-5 h-5 text-amber-500" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-500">Union Budget FY 25-26</span>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  Autonomous Tax Engine
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Instant side-by-side computation with standard deduction (₹75k) and Chapter VI-A deductions.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070B16] border border-slate-200/70 dark:border-white/5 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">New Regime</span>
                <span className="text-emerald-500 font-bold">₹67,600</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Old Regime</span>
                <span className="text-slate-500">₹85,800</span>
              </div>
              <div className="pt-2 border-t border-slate-200/80 dark:border-white/5 text-[10px] font-bold text-emerald-500 font-mono">
                ★ ₹18,200 Net Savings
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. UNIFIED WEALTH SIMULATOR (FOCUSED, SATISFYING, NO CLUTTER)              */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 5. INTERACTIVE DHANMITR INTELLIGENCE SHOWCASE                             */}
      {/* ========================================================================= */}
      <section id="intelligence" className="py-24 px-6 max-w-6xl mx-auto relative z-10 border-t border-slate-200/60 dark:border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-10 space-y-2.5"
        >
          <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
            LIVE INTELLIGENCE SHOWCASE
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Conversational Finance in Real Time
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Choose a real-world scenario to experience how DhanMITR parses natural voice, flags hidden drains, and defends your emergency runway.
          </p>
        </motion.div>

        {/* Scenario Pill Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {scenarios.map((sc, idx) => {
            const Icon = sc.icon;
            const isSelected = activeScenario === idx;
            return (
              <button
                key={sc.id}
                onClick={() => setActiveScenario(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-102'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{sc.tabLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Master Interactive Terminal Panel */}
        <motion.div
          key={activeScenario}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto fintech-card rounded-3xl p-6 sm:p-9 shadow-xl border border-slate-200/80 dark:border-white/10 space-y-6"
        >
          {/* Terminal Console Topbar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 ml-2 hidden sm:inline">
                dhanmitr-pipeline://sovereign-ai-v2.0
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {scenarios[activeScenario].badge}
              </span>
              <span className="text-[10px] font-mono text-slate-400">⚡ &lt;180ms</span>
            </div>
          </div>

          {/* User Voice Input Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#070B16] border border-slate-200/80 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  User Voice Input
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">
                  {scenarios[activeScenario].langTag}
                </span>
                {/* Jitter-Free GPU Accelerated Audio Waveform */}
                <div className="flex items-center gap-0.5 h-4 w-12 justify-center overflow-hidden">
                  {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8].map((scale, i) => (
                    <motion.span
                      key={i}
                      className="w-0.5 h-full bg-emerald-500 rounded-full origin-center"
                      animate={{ scaleY: [scale, 0.25, scale] }}
                      transition={{
                        duration: 0.75 + i * 0.15,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="font-display text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
              {scenarios[activeScenario].userQuery}
            </p>
          </div>

          {/* DhanMITR AI Autonomous Response Card */}
          <div className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/15 border border-emerald-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <DhanMitrLogo className="w-6 h-6 rounded-lg shadow-sm" />
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  DhanMITR Autonomous Intelligence
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {scenarios[activeScenario].tag}
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              {scenarios[activeScenario].aiResponse}
            </p>

            {/* Structured Telemetry Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {scenarios[activeScenario].metrics.map((m, mIdx) => (
                <div
                  key={mIdx}
                  className="p-3 rounded-xl bg-white/70 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 space-y-1"
                >
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    {m.label}
                  </span>
                  <span className={`text-xs sm:text-sm font-black font-mono ${m.color}`}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Action Launch Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Test this right now with your own voice or custom questions</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => onOpenAi('voice')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Try Voice AI</span>
              </button>
              <button
                onClick={() => onOpenAi('chat')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 font-mono text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Open Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 6. STATS & ENGINEERING MONOLITHS                                          */}
      {/* ========================================================================= */}
      <section id="architecture" className="py-24 px-6 max-w-6xl mx-auto relative z-10 border-t border-slate-200/60 dark:border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { metric: '<180ms', title: 'Voice Pipeline', subtitle: 'Indic Streaming STT', color: 'text-emerald-500' },
            { metric: '100%', title: 'Row-Level Security', subtitle: 'Cryptographic Vault', color: 'text-teal-400' },
            { metric: '14+', title: 'Financial Models', subtitle: 'Incomes, Caps & Policies', color: 'text-blue-400' },
            { metric: '0', title: 'Password Scrapes', subtitle: 'Zero Third-Party Risk', color: 'text-purple-400' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="fintech-card rounded-3xl p-6 text-center space-y-1.5"
            >
              <span className={`font-display text-4xl sm:text-5xl font-black font-mono tabular-nums ${item.color}`}>
                {item.metric}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.title}</span>
              <span className="text-[10px] text-slate-400 block font-mono">{item.subtitle}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CONCISE FAQ ACCORDION                                                  */}
      {/* ========================================================================= */}
      <section id="faq" className="py-24 px-6 max-w-3xl mx-auto relative z-10 border-t border-slate-200/60 dark:border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 space-y-2"
        >
          <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-500 uppercase">
            CLEAR ANSWERS
          </span>
          <h2 className="font-display text-3xl font-black text-slate-900 dark:text-white">Frequently Asked</h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="fintech-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/5 transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-emerald-500' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. LUXURY FLOATING CTA BANNER                                             */}
      {/* ========================================================================= */}
      <section className="py-24 px-6 max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden p-10 sm:p-14 bg-gradient-to-tr from-emerald-950/80 via-slate-900 to-[#050811] border border-emerald-500/25 text-center space-y-6 shadow-2xl"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
            <SparkleSmallIcon className="w-3.5 h-3.5 fill-current" />
            <span>SOVEREIGN WEALTH CONTROL</span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight max-w-xl mx-auto">
            Ready for Sovereign Wealth Intelligence?
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Experience conversational Indic voice budgeting and automated tax regime optimization.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onOpenAi('voice')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Try Voice AI Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onLaunchHub}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-mono font-bold text-xs uppercase tracking-wider border border-white/15 transition-all cursor-pointer"
            >
              <WalletIcon className="w-3.5 h-3.5" />
              <span>Launch Finance Hub</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 9. MINIMAL LUXURY FOOTER                                                  */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200/60 dark:border-white/5 bg-[#FAFCFF] dark:bg-[#050811] py-10 px-6 relative z-10 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2.5">
            <DhanMitrLogo className="w-8 h-6 shrink-0" />
            <span className="font-display font-extrabold text-slate-900 dark:text-white">
              Dhan<span className="text-emerald-500">Mitr</span>
            </span>
            <span>•</span>
            <span>Made in India for India</span>
          </div>

          <div className="flex items-center gap-5 text-[11px] font-mono">
            <button onClick={onOpenCalculator || onLaunchHub} className="hover:text-emerald-500 transition-colors cursor-pointer flex items-center gap-1">
              <Calculator className="w-3 h-3 text-emerald-500" />
              <span>MSME Calculators</span>
            </button>
            <button onClick={() => onOpenAi('voice')} className="hover:text-emerald-500 transition-colors cursor-pointer">
              Voice AI
            </button>
            <button onClick={() => onOpenAi('chat')} className="hover:text-emerald-500 transition-colors cursor-pointer">
              Intelligence Chat
            </button>
            <button onClick={onLaunchHub} className="hover:text-emerald-500 transition-colors cursor-pointer">
              Finance Hub
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
