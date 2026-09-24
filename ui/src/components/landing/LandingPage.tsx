'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/motion/theme-toggle';
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
  Languages,
  Check,
  X,
  Shield,
  Lock,
  Activity,
  Coins,
  Sliders,
  RefreshCw,
  Coffee,
  Receipt,
  HeartHandshake,
  Play,
  Volume2,
  CalendarCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  AnimatedHandwrittenWord,
  HandDrawnArrow,
  HandDrawnUnderline,
  HandDrawnLoop,
  HandDrawnScrollIndicator,
  HandDrawnCross,
  HandDrawnCheck,
} from './HandwritingEffect';

interface LandingPageProps {
  onOpenAi: (mode: 'voice' | 'chat') => void;
  onLaunchHub: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAi, onLaunchHub }) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, openAuthModal } = useAuth();

  // Interactive Product Story State
  const [storyVoiceLang, setStoryVoiceLang] = useState<'hinglish' | 'hindi' | 'english' | 'marathi'>('hinglish');
  const [runwayKey, setRunwayKey] = useState<'laptop' | 'trip' | 'course'>('laptop');
  const [radarPaused, setRadarPaused] = useState<boolean>(false);
  const [taxRegime, setTaxRegime] = useState<'new' | 'old'>('new');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const storyVoices = {
    hinglish: {
      lang: 'Indic Hinglish',
      badge: 'Casual & Natural',
      audioDuration: '0:04s',
      speech: '“Bhai, kal Sham ko doston ke sath ₹2,450 dinner aur ₹320 cab pe gaye. Update my dining budget.”',
      categories: [
        { name: 'Dinner & Social', amount: '₹2,450', note: '68% of weekly dining cap', safe: true },
        { name: 'Late Night Cab', amount: '₹320', note: 'Within transit buffer', safe: true },
      ],
      bufferLeft: '₹4,230',
      handwrittenNote: 'Weekly dining buffer still has ₹4,230 left for Sunday brunch!',
      aiReply: 'Logged ₹2,450 under Dining & ₹320 under Transit. Your weekly dining buffer has ₹4,230 remaining for the weekend.',
    },
    hindi: {
      lang: 'शुद्ध हिंदी',
      badge: 'स्वाभाविक बोलचाल',
      audioDuration: '0:03s',
      speech: '“भाई, कल का बिजली बिल ₹3,200 भर दिया, बजट में जोड़ दो”',
      categories: [
        { name: 'बिजली व बिल', amount: '₹3,200', note: 'मासिक बिल समय पर भरा', safe: true },
      ],
      bufferLeft: '₹5,800',
      handwrittenNote: 'मासिक उपयोगिता बजट पूरी तरह सुरक्षित है।',
      aiReply: 'बिजली बिल ₹3,200 Utilities में दर्ज किया गया। आपकी मासिक बचत दर 42% पर सुरक्षित बनी हुई है।',
    },
    english: {
      lang: 'Indian English',
      badge: 'Professional & Fast',
      audioDuration: '0:04s',
      speech: '“Booked a client dinner for ₹3,850 and paid ₹650 for airport parking.”',
      categories: [
        { name: 'Client Dinner', amount: '₹3,850', note: 'Tax-deductible expense', safe: true },
        { name: 'Airport Parking', amount: '₹650', note: 'Reimbursable trip ledger', safe: true },
      ],
      bufferLeft: '₹14,500',
      handwrittenNote: 'Flagged for monthly reimbursement automatically.',
      aiReply: 'Logged ₹3,850 and ₹650 under Business Reimbursables. Receipt reminder scheduled for Monday.',
    },
    marathi: {
      lang: 'मराठी व्हॉइस',
      badge: 'सहज आणि सोपे',
      audioDuration: '0:04s',
      speech: '“या महिन्याचा किराणा सामान ₹4,500 झाला आहे, नोंद करा”',
      categories: [
        { name: 'किराणा सामान', amount: '₹4,500', note: 'घरगुती बजेटमध्ये', safe: true },
      ],
      bufferLeft: '₹6,500',
      handwrittenNote: 'किराणा बजेट मर्यादेत आहे, काळजी नको!',
      aiReply: 'किराणा खर्च ₹4,500 Grocery मध्ये नोंदवला गेला. चालू महिन्याचे बजेट उत्तम चालू आहे.',
    },
  };

  const runwayScenarios = {
    laptop: {
      name: 'MacBook Pro M3 Max',
      cost: '₹1,19,900',
      beforeMonths: 6.2,
      afterMonths: 4.1,
      status: 'caution',
      statusBadge: 'Drops Below 6m Safety Line',
      advice: 'Caution: This purchase lowers your emergency buffer from 6.2 months to 4.1 months. धनMitr recommends deferring 35 days until your quarterly bonus arrives.',
      handwrittenTip: 'Waiting 35 days keeps your peace of mind wall intact.',
    },
    trip: {
      name: 'Goa Long Weekend',
      cost: '₹24,500',
      beforeMonths: 6.2,
      afterMonths: 5.8,
      status: 'safe',
      statusBadge: 'Safe & Guilt-Free',
      advice: 'Safe to book! Your runway remains comfortably at 5.8 months (well above your 5.5m threshold). Spend with joy, zero anxiety.',
      handwrittenTip: 'Go enjoy! Your buffer handles this cleanly.',
    },
    course: {
      name: 'Executive AI Bootcamp',
      cost: '₹48,000',
      beforeMonths: 6.2,
      afterMonths: 5.3,
      status: 'safe',
      statusBadge: 'High ROI Investment',
      advice: 'Approved. Absorbed cleanly by your liquid surplus. Post-spend runway of 5.3 months preserves financial sovereignty.',
      handwrittenTip: 'Investments in your skills pay compound interest.',
    },
  };

  const zombieDebits = [
    {
      name: 'SonyLIV Annual Plan',
      amount: '₹999',
      period: '/year',
      detail: '0 logins in 42 days • Auto-renews next Tuesday',
      category: 'OTT Streaming',
    },
    {
      name: 'Gym Annual Auto-Renewal',
      amount: '₹18,000',
      period: '/year',
      detail: 'Dormant for 78 days • Card auto-debit primed',
      category: 'Fitness Club',
    },
    {
      name: 'Duplicate Cloud SaaS Tier',
      amount: '₹650',
      period: '/mo',
      detail: 'Redundant with Google One • ₹7,800/yr leak',
      category: 'Cloud Storage',
    },
    {
      name: 'OTT Music Family Tier',
      amount: '₹399',
      period: '/mo',
      detail: 'Duplicate tier • Only 1 active device (₹4,788/yr)',
      category: 'Audio Media',
    },
  ];

  const faqs = [
    {
      q: 'Can I test the Voice AI without signing up?',
      a: 'Yes. Voice and chat intelligence are completely open to test immediately in your browser. Signing in is only needed when you want to link your personal accounts, ledgers, and policies.',
    },
    {
      q: 'How is my financial data protected from third parties?',
      a: 'धनMitr enforces cryptographic PostgreSQL Row-Level Security (RLS) via Supabase. We never sell, scrape, or share your financial records with advertising brokers or credit card marketers.',
    },
    {
      q: 'Are the tax calculations accurate for FY 2025-26?',
      a: 'Yes. It reflects the latest Union Budget provisions, including the enhanced ₹75,000 standard deduction under the New Tax Regime, revised slab rates, Section 87A rebate, and Chapter VI-A deductions (80C, 80D).',
    },
    {
      q: 'Which Indic languages are supported?',
      a: 'धनMitr natively understands Hindi, conversational Hinglish (mixed Hindi and English), and English with sub-180ms streaming inference.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#FAFCFF] dark:bg-[#050811] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-500">
      {/* Ambient background glows with generous diffusion */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full" />
        <div className="absolute top-2/3 -right-48 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      {/* ========================================================================= */}
      {/* 1. FLOATING DYNAMIC ISLAND NAVBAR — ULTRA-COOL, AESTHETIC, MINIMAL        */}
      {/* ========================================================================= */}
      <div className="sticky top-3.5 sm:top-5 z-50 px-4 sm:px-6 w-full max-w-5xl mx-auto">
        <header className="relative flex items-center justify-between px-3.5 sm:px-5 h-14 sm:h-16 rounded-full bg-white/75 dark:bg-[#070B16]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_40px_-6px_rgba(0,0,0,0.6)] transition-all duration-300">
          {/* Subtle Ambient Emerald Aura beneath the pill */}
          <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 blur-xl opacity-70 pointer-events-none" />

          {/* Left: Brand Emblem + Micro Pulse */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
            onClick={onLaunchHub}
            title="धनMitr Sovereign Finance Hub"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              <DhanMitrLogo className="w-8 h-6 relative z-10 group-hover:scale-105 transition-transform shrink-0" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                धन<span className="text-emerald-500 font-bold">Mitr</span>
              </span>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
            </div>
          </div>

          {/* Center: Interactive Capsule Nav Links with Smooth Sliding Hover */}
          <nav
            onMouseLeave={() => setHoveredNav(null)}
            className="hidden md:flex items-center gap-1 p-1 rounded-full bg-slate-100/60 dark:bg-white/[0.04] border border-slate-200/50 dark:border-white/5"
          >
            {[
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'runway', label: 'Runway' },
              { id: 'faq', label: 'FAQ' },
            ].map((item) => {
              const isHovered = hoveredNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    const el = document.getElementById(item.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer select-none ${
                    isHovered
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isHovered && (
                    <motion.div
                      layoutId="navHoverCapsule"
                      className="absolute inset-0 rounded-full bg-white dark:bg-white/10 shadow-xs border border-slate-200/60 dark:border-white/10"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Theme Toggle + Glowing Shimmer CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <ThemeToggle
              variant="circle"
              start="top-right"
              className="p-2 sm:p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/5 transition-colors cursor-pointer"
              iconClassName="w-3.5 h-3.5 sm:w-4 sm:h-4"
              title="Toggle theme"
            />

            {isAuthenticated ? (
              <button
                onClick={onLaunchHub}
                className="relative group overflow-hidden px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 select-none"
              >
                <span className="relative z-10">Enter Hub</span>
                <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out" />
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="relative group overflow-hidden px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-slate-900/10 dark:shadow-white/10 cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 select-none"
              >
                <span className="relative z-10">Sign In</span>
                <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 dark:via-black/10 to-transparent transition-transform duration-700 ease-in-out" />
              </button>
            )}
          </div>
        </header>
      </div>

      {/* ========================================================================= */}
      {/* 2. MINIMAL HANDWRITING INTRO — BREATHABLE, POETIC, CALM (TIGHT TOP GAP)   */}
      {/* ========================================================================= */}
      <section className="relative flex flex-col justify-center items-center text-center max-w-5xl mx-auto px-6 pt-5 sm:pt-7 pb-10 z-10">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="w-full max-w-4xl mx-auto space-y-5 sm:space-y-6 pt-2">
          {/* Poetic Minimal Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium shadow-2xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Indic Voice AI • Sovereign Wealth</span>
          </motion.div>

          {/* Master Headline with Live Handwriting Animation */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-medium tracking-tight text-slate-900 dark:text-white leading-[1.08]"
          >
            Managing wealth should feel{' '}
            <br className="hidden sm:inline" />
            <AnimatedHandwrittenWord
              words={['effortless.', 'human.', 'peaceful.', 'personal.']}
              intervalMs={4200}
              className="text-emerald-500 text-5xl sm:text-7xl md:text-8xl lg:text-[5.75rem]"
            />
          </motion.h1>

          {/* 1 Calm, Human Sentence */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base sm:text-xl text-slate-600 dark:text-slate-400 font-normal max-w-xl mx-auto leading-relaxed pt-1"
          >
            No cluttered spreadsheets. No financial jargon to decode. Just speak naturally in Hindi, Hinglish, or English — धनMitr takes care of the rest.
          </motion.p>

          {/* Clean Action Buttons + Handwritten Doodle Arrow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="relative pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto"
          >
            <button
              onClick={() => onOpenAi('voice')}
              className="group relative w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-slate-950/15 flex items-center justify-center">
                <Mic className="w-3.5 h-3.5 text-slate-950" />
              </div>
              <span>Try Voice Copilot</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={onLaunchHub}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-slate-100/90 hover:bg-slate-200/90 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-200/80 dark:border-white/10 transition-all cursor-pointer backdrop-blur-md"
            >
              <span>{isAuthenticated ? 'Open Finance Hub' : 'Explore Platform'}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {/* Handwritten Doodle Arrow pointing to Voice Button */}
            <div className="hidden lg:flex absolute -right-48 -top-7 flex-col items-start pointer-events-none select-none">
              <span className="font-handwriting text-lg text-emerald-500 -rotate-6">
                talk in your mother tongue!
              </span>
              <HandDrawnArrow className="w-16 h-10 text-emerald-500 -rotate-12 mt-0.5" delay={0.8} />
            </div>
          </motion.div>

          {/* Minimal Interactive Prompt Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="pt-4 flex flex-col items-center gap-2"
          >
            <span className="font-handwriting text-base text-slate-400 dark:text-slate-500">
              or click a sample prompt to try:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
              {[
                { text: '“Bhai, kal Sham ka ₹2,450 dinner log karo”', tag: 'Expense' },
                { text: '“Is my 6-month runway safe for buying a laptop?”', tag: 'Runway' },
                { text: '“New vs Old tax regime me kitna bachega?”', tag: 'Tax' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => onOpenAi('voice')}
                  className="px-3.5 py-1.5 rounded-full text-xs font-normal text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all cursor-pointer shadow-2xs backdrop-blur-sm"
                >
                  <span className="text-[10px] text-slate-400 mr-1.5 font-mono">
                    [{item.tag}]
                  </span>
                  <span>{item.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Handwritten Scroll Indicator at the base of Hero */}
        <div className="pt-6">
          <HandDrawnScrollIndicator
            onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THE PROGRESSIVE PRODUCT STORY — 4 COMFY EDITORIAL CHAPTERS             */}
      {/* ========================================================================= */}

      {/* STORY PROLOGUE: PHILOSOPHY */}
      <section id="how-it-works" className="py-24 px-6 max-w-6xl mx-auto relative z-10 border-t border-slate-200/60 dark:border-white/5 scroll-mt-20 sm:scroll-mt-24">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-20 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>THE धनMitr JOURNEY</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 dark:text-white leading-[1.18]">
            Money isn’t just numbers on a screen. <br className="hidden sm:inline" />
            It’s how you <span className="italic font-serif text-emerald-600 dark:text-emerald-400">sleep at night.</span>
          </h2>

          <div className="relative inline-block max-w-2xl mx-auto pt-1">
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Most finance apps treat you like an unpaid accountant. We built धनMitr for real Indian lives—where money flows through evening chai, impromptu dinners with college friends, and quiet dreams for family security.
            </p>
            <div className="pt-2">
              <span className="font-handwriting text-xl sm:text-2xl text-emerald-600 dark:text-emerald-400">
                “No guilt trips. No dropdown menus. Just peace of mind.”
              </span>
              <HandDrawnUnderline className="w-64 max-w-full mx-auto -mt-1" delay={0.2} color="text-emerald-500" />
            </div>
          </div>
        </motion.div>

        {/* ------------------------------------------------------------------------- */}
        {/* CHAPTER 01: THE 5-SECOND VOICE RITUAL (REAL-LIFE LOGGING)                */}
        {/* ------------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-32">
          {/* Narrative Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                CHAPTER 01
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Real-Life Voice Capture
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-4xl text-slate-900 dark:text-white font-normal leading-snug">
              Speak naturally. <br />
              <span className="italic text-emerald-600 dark:text-emerald-400 font-serif">
                Done before your cab arrives.
              </span>
            </h3>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              You just finished dinner with your friends or bought groceries at the local mandi.
              Who wants to unlock their phone, open an app, navigate three nested menus, and categorize &apos;Food &amp; Dining &gt; Social&apos;?
              Nobody. That&apos;s why 92% of people abandon traditional expense apps within a week.
            </p>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              With धनMitr, you simply hold the mic for four seconds and speak like you&apos;re sending a voice note to your best friend.
              Hindi, Hinglish, English, or Marathi—our Indic acoustic engine parses amounts, merchant tags, and weekly buffers instantly.
            </p>

            {/* Language Selector Chips */}
            <div className="space-y-2 pt-2">
              <span className="font-handwriting text-base text-slate-500 dark:text-slate-400 block">
                Tap to hear real everyday voice logs:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {(['hinglish', 'hindi', 'english', 'marathi'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setStoryVoiceLang(lang)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                      storyVoiceLang === lang
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/5'
                    }`}
                  >
                    {storyVoices[lang].lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Handwritten Margin Note with Doodle Arrow */}
            <div className="relative pt-3 pl-4 border-l-2 border-emerald-500/40 hidden sm:block">
              <span className="font-handwriting text-lg text-emerald-600 dark:text-emerald-400 block">
                “No dropdowns. No category tags. It just understands.”
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                // Sub-180ms streaming STT with zero cloud audio storage
              </span>
            </div>
          </motion.div>

          {/* Interactive Voice Journal Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-[#070B16] border border-slate-200/80 dark:border-white/10 shadow-xl space-y-6 relative overflow-hidden backdrop-blur-xl">
              {/* Soft ambient ink glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

              {/* Journal Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                      {storyVoices[storyVoiceLang].badge}
                    </span>
                    <span className="font-serif text-base font-bold text-slate-900 dark:text-white">
                      Instant Voice Diary
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{storyVoices[storyVoiceLang].audioDuration}</span>
                </div>
              </div>

              {/* Spoken Audio Note Bubble */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    Voice Note Transcript
                  </span>
                  {/* Gentle Audio Waveform */}
                  <div className="flex items-center gap-1 h-4">
                    {[0.3, 0.8, 0.5, 0.9, 0.4, 0.7, 0.6, 0.3].map((val, i) => (
                      <motion.span
                        key={i}
                        className="w-0.5 bg-emerald-500 rounded-full"
                        animate={{ height: [`${val * 16}px`, `${(1 - val) * 16 + 4}px`, `${val * 16}px`] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                </div>
                <p className="font-serif text-base sm:text-lg italic text-slate-800 dark:text-slate-100 leading-relaxed">
                  {storyVoices[storyVoiceLang].speech}
                </p>
              </div>

              {/* Live Parsed Entities Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Auto-Parsed Breakdown (0ms effort)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <HandDrawnCheck className="w-3.5 h-3.5 text-emerald-500 inline" />
                    <span>Categorized</span>
                  </span>
                </div>

                <div className="space-y-2">
                  {storyVoices[storyVoiceLang].categories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-black/30 border border-slate-200/80 dark:border-white/5 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                          {cat.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-sans">
                          {cat.note}
                        </span>
                      </div>
                      <span className="font-mono text-sm sm:text-base font-black text-slate-900 dark:text-white tabular-nums">
                        {cat.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Handwritten Sticky Note on the Card */}
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-400/5 border border-amber-500/25 relative">
                <div className="flex items-start gap-2.5">
                  <span className="text-amber-500 text-sm">✦</span>
                  <div className="space-y-1">
                    <span className="font-handwriting text-lg sm:text-xl text-amber-900 dark:text-amber-300 block leading-tight">
                      {storyVoices[storyVoiceLang].handwrittenNote}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                      Remaining Safe Weekly Buffer: <strong className="text-emerald-500 font-mono">{storyVoices[storyVoiceLang].bufferLeft}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button to launch Voice AI */}
              <button
                onClick={() => onOpenAi('voice')}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Try Voice AI With Your Own Words</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* CHAPTER 02: THE 6-MONTH PEACE OF MIND WALL (GUILT-FREE SPENDING)          */}
        {/* ------------------------------------------------------------------------- */}
        <div id="runway" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-32 pt-12 border-t border-slate-200/60 dark:border-white/5 scroll-mt-20 sm:scroll-mt-24">
          {/* Interactive Runway Visual Column (Left on Desktop) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 order-2 lg:order-1"
          >
            <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-[#070B16] border border-slate-200/80 dark:border-white/10 shadow-xl space-y-6 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/5 blur-3xl pointer-events-none rounded-full" />

              {/* Reservoir Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                      Peace of Mind Defense
                    </span>
                    <span className="font-serif text-base font-bold text-slate-900 dark:text-white">
                      Liquid Survival Runway
                    </span>
                  </div>
                </div>

                <div className="relative inline-flex items-center justify-center px-4 py-1.5">
                  <span className="relative z-10 font-mono text-xl sm:text-2xl font-black tabular-nums transition-colors">
                    <span className={runwayScenarios[runwayKey].status === 'caution' ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'}>
                      {runwayScenarios[runwayKey].afterMonths}
                    </span>{' '}
                    <span className="text-xs font-sans text-slate-500 dark:text-slate-400 font-normal">Months</span>
                  </span>
                  <HandDrawnLoop
                    key={runwayKey}
                    className="absolute -inset-x-2 -inset-y-1.5 w-[calc(100%+16px)] h-[calc(100%+12px)] pointer-events-none"
                    delay={0.15}
                    color={runwayScenarios[runwayKey].status === 'caution' ? 'text-amber-500/80 dark:text-amber-400/80' : 'text-emerald-500/80 dark:text-emerald-400/80'}
                  />
                </div>
              </div>

              {/* Interactive Purchase Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Test a Real-Life Purchase:
                  </span>
                  <span className="font-handwriting text-sm text-slate-500">
                    click to test impact
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['laptop', 'trip', 'course'] as const).map((key) => {
                    const sc = runwayScenarios[key];
                    const isSelected = runwayKey === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setRunwayKey(key)}
                        className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
                        }`}
                      >
                        <span className="text-[10px] font-mono text-slate-400 block truncate">
                          {sc.cost}
                        </span>
                        <span className="text-xs font-bold block truncate mt-0.5">
                          {sc.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Animated Liquid Gauge */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Current Runway: 6.2 Months</span>
                  <span className={runwayScenarios[runwayKey].status === 'caution' ? 'text-amber-500 font-bold' : 'text-emerald-500 font-bold'}>
                    {runwayScenarios[runwayKey].statusBadge}
                  </span>
                </div>

                {/* Progress bar with 6-month safety marker */}
                <div className="relative w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      runwayScenarios[runwayKey].status === 'caution'
                        ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    animate={{ width: `${(runwayScenarios[runwayKey].afterMonths / 8) * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                  {/* 6.0 month safety guideline */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white/60 z-10"
                    style={{ left: `${(6.0 / 8) * 100}%` }}
                    title="6.0 Month Safety Line"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>0 Months</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    6.0m Safety Threshold
                  </span>
                  <span>8.0+ Months</span>
                </div>
              </div>

              {/* Copilot Reassurance Advice */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    धनMitr Companion Advice
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                  {runwayScenarios[runwayKey].advice}
                </p>
                <div className="pt-1">
                  <span className="font-handwriting text-base text-emerald-600 dark:text-emerald-400">
                    “{runwayScenarios[runwayKey].handwrittenTip}”
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Narrative Column (Right on Desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 order-1 lg:order-2"
          >
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                CHAPTER 02
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Runway-First Intelligence
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-4xl text-slate-900 dark:text-white font-normal leading-snug">
              Never ask <span className="italic font-serif text-teal-600 dark:text-teal-400">“Can I afford this?”</span> <br />
              with a knot in your stomach.
            </h3>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Looking at your bank balance never tells you the truth. That ₹3,00,000 sitting in your savings account might already be promised to next month&apos;s term insurance, rent, SIPs, and credit card bill.
            </p>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Instead of showing confusing pie charts, धनMitr translates your liquidity into something deeply human: <strong className="font-semibold text-slate-900 dark:text-white">Survival Runway</strong>.
              If all income ceased tomorrow, exactly how many months could you and your family live with dignity?
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-2">
              <span className="font-serif text-sm font-bold text-slate-900 dark:text-white block">
                The 6-Month Peace of Mind Standard:
              </span>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                When your runway is above 6.0 months, every dinner, flight ticket, or gadget is 100% guilt-free. When a purchase threatens your runway, धनMitr kindly suggests deferring until your next bonus.
              </p>
            </div>

            <div className="relative pt-2">
              <span className="font-handwriting text-xl text-emerald-600 dark:text-emerald-400 block">
                “Spend joyfully on what matters, without the lingering guilt.”
              </span>
              <HandDrawnUnderline className="w-72 max-w-full -bottom-1" delay={0.3} color="text-teal-500" />
            </div>
          </motion.div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* CHAPTER 03: THE SILENT WATCHDOG (ZOMBIE DEBIT RECOVERY)                   */}
        {/* ------------------------------------------------------------------------- */}
        <div id="radar" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-32 pt-12 border-t border-slate-200/60 dark:border-white/5">
          {/* Narrative Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                CHAPTER 03
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Autonomous Radar
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-4xl text-slate-900 dark:text-white font-normal leading-snug">
              Your money shouldn’t <br />
              <span className="italic font-serif text-rose-500">
                quietly bleed away
              </span> in the dark.
            </h3>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Wealth rarely disappears from one massive mistake. It leaks through quiet ₹499s and ₹1,499s—the streaming service you watched for one weekend four months ago, the annual gym auto-debit you forgot about, the duplicate cloud storage tier.
            </p>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Alone, they look too small to care. Together, they quietly drain over <span className="font-mono font-bold text-rose-500">₹31,580 every single year</span>.
              धनMitr’s autonomous radar monitors these silent recurring charges and lets you halt them before they debit.
            </p>

            <div className="relative pt-2 pl-4 border-l-2 border-rose-500/40">
              <span className="font-handwriting text-lg text-rose-500 dark:text-rose-400 block">
                “Money you worked hard to earn, saved back automatically.”
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                // 1-tap pause scripts generated for UPI autopay and card mandates
              </span>
            </div>
          </motion.div>

          {/* Interactive Radar Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-[#070B16] border border-slate-200/80 dark:border-white/10 shadow-xl space-y-6 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-3xl pointer-events-none rounded-full" />

              {/* Radar Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-wider block">
                      Autonomous Radar
                    </span>
                    <span className="font-serif text-base font-bold text-slate-900 dark:text-white">
                      4 Dormant Auto-Debits Flagged
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">Annual Leakage</span>
                  <span className={`font-mono text-base font-black ${radarPaused ? 'text-emerald-500 line-through' : 'text-rose-500'}`}>
                    ₹31,580/yr
                  </span>
                </div>
              </div>

              {/* List of 4 Dormant Zombie Subscriptions */}
              <div className="space-y-2.5">
                {zombieDebits.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      radarPaused
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                        : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/5 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        {radarPaused ? (
                          <HandDrawnCheck className="w-4 h-4 text-emerald-500 shrink-0 inline" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        )}
                        <span className={`text-xs sm:text-sm font-bold truncate ${radarPaused ? 'line-through text-slate-400' : ''}`}>
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-sans block truncate pl-4">
                        {radarPaused ? 'Paused — Auto-debit cancelled' : item.detail}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono text-xs sm:text-sm font-black tabular-nums ${radarPaused ? 'text-emerald-500 font-bold' : 'text-slate-900 dark:text-white'}`}>
                        {radarPaused ? 'Recovered' : item.amount}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {radarPaused ? '' : item.period}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 1-Tap Pause Interactive Action */}
              <div className="pt-2 space-y-3">
                <button
                  onClick={() => setRadarPaused(!radarPaused)}
                  className={`w-full py-3.5 rounded-2xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                    radarPaused
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
                      : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                  }`}
                >
                  {radarPaused ? (
                    <>
                      <HandDrawnCheck className="w-4 h-4 text-slate-950" />
                      <span>✓ ₹31,580 Successfully Recovered (Click to Reset)</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>1-Tap Pause All 4 Zombie Debits</span>
                    </>
                  )}
                </button>

                {radarPaused && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center"
                  >
                    <span className="font-handwriting text-lg text-emerald-600 dark:text-emerald-400">
                      “₹31,580 added straight back into your 6-month safety wall! 🎉”
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* CHAPTER 04: TAX CLARITY WITHOUT THE MARCH PANIC (UNION BUDGET FY 25-26)   */}
        {/* ------------------------------------------------------------------------- */}
        <div id="taxes" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-24 pt-12 border-t border-slate-200/60 dark:border-white/5">
          {/* Interactive Tax Ledger Card (Left on Desktop) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 order-2 lg:order-1"
          >
            <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-[#070B16] border border-slate-200/80 dark:border-white/10 shadow-xl space-y-6 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />

              {/* Tax Ledger Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                      Union Budget FY 2025-26
                    </span>
                    <span className="font-serif text-base font-bold text-slate-900 dark:text-white">
                      Regime Arbitrage Calculator
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <button
                    onClick={() => setTaxRegime('new')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      taxRegime === 'new'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    New (115BAC)
                  </button>
                  <button
                    onClick={() => setTaxRegime('old')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      taxRegime === 'old'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Old Regime
                  </button>
                </div>
              </div>

              {/* Side-by-side Ledger Comparison Table */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5 text-xs font-mono text-slate-400">
                  <span>SALARIED LEDGER (₹18,00,000 GROSS)</span>
                  <span className="font-bold text-emerald-500">
                    {taxRegime === 'new' ? '✓ OPTIMAL CHOICE' : 'HIGHER BURDEN'}
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Standard Deduction</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {taxRegime === 'new' ? '₹75,000 (Revised Slabs)' : '₹50,000'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Mandatory 80C Lock-In</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {taxRegime === 'new' ? '₹0 (100% Free Liquidity)' : '₹1,50,000 locked for 3-5 yrs'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Taxable Net Base</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {taxRegime === 'new' ? '₹17,25,000' : '₹15,50,000'}
                    </span>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-slate-200/60 dark:border-white/5 font-bold">
                    <span className="text-slate-900 dark:text-white">Total Tax Payable (with Cess)</span>
                    <span className="font-mono text-base text-slate-900 dark:text-white">
                      {taxRegime === 'new' ? '₹2,10,600' : '₹2,28,800'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net In-Hand Rupee Savings Callout */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/25 border border-emerald-500/25 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                    Net Take-Home Difference
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-emerald-500 tabular-nums">
                    ₹18,200 More In Hand
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-handwriting text-base sm:text-lg text-emerald-600 dark:text-emerald-400 block">
                    keep cash liquid!
                  </span>
                  <HandDrawnUnderline className="w-28 -mt-1 ml-auto" delay={0.3} color="text-emerald-500" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Narrative Column (Right on Desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 order-1 lg:order-2"
          >
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                CHAPTER 04
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                FY 2025-26 Tax Clarity
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-4xl text-slate-900 dark:text-white font-normal leading-snug">
              No March tax panic. <br />
              <span className="italic font-serif text-emerald-600 dark:text-emerald-400">
                Just clear, exact rupee savings.
              </span>
            </h3>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Every year, millions of Indian professionals scramble during the last two weeks of March, drowning in HR declarations, Section 80C, 80D health insurance caps, and HRA slips.
            </p>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              धनMitr continuously benchmarks your numbers against the latest Union Budget provisions—including the enhanced ₹75,000 standard deduction under Section 115BAC and Section 87A rebate. You know your exact optimal regime 365 days a year, with zero last-minute rush.
            </p>

            <div className="relative pt-2">
              <span className="font-handwriting text-xl text-emerald-600 dark:text-emerald-400 block">
                “Keep ₹18,200 in your pocket without locking money into 3-year ELSS lock-ins.”
              </span>
              <HandDrawnUnderline className="w-80 max-w-full -bottom-1" delay={0.3} color="text-emerald-500" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THE SOVEREIGN PRIVACY VAULT                                            */}
      {/* ========================================================================= */}
      <section id="vault" className="py-24 px-6 max-w-6xl mx-auto relative z-10 border-t border-slate-200/60 dark:border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span>SOVEREIGN VAULT</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-slate-900 dark:text-white">
            Your wealth is your private business. <br className="hidden sm:inline" />
            <span className="italic font-serif text-emerald-600 dark:text-emerald-400">We keep it that way.</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed font-sans">
            Protected with PostgreSQL Row-Level Security. We never sell, scrape, or broker your records to banks, loan agents, or insurance callers.
          </p>
          <div className="pt-1">
            <span className="font-handwriting text-lg text-emerald-600 dark:text-emerald-400">
              “Zero ads. Zero credit card telemarketers. Ever.”
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Lock,
              metric: '100% RLS',
              title: 'Row-Level Isolation',
              desc: 'Cryptographic partition ensures only your authenticated session can decrypt your financial ledger.',
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10',
              border: 'border-emerald-500/25',
            },
            {
              icon: ShieldCheck,
              metric: 'Zero Brokering',
              title: 'Ad-Free Privacy Pledge',
              desc: 'We never sell your phone number, portfolio, or expenses to insurance brokers, telemarketers, or loan agents.',
              color: 'text-teal-400',
              bg: 'bg-teal-500/10',
              border: 'border-teal-500/25',
            },
            {
              icon: Activity,
              metric: '<180ms TTFT',
              title: 'Local Indic Voice STT',
              desc: 'High-speed audio streaming pipeline with ephemeral in-memory tokenization and zero audio recordings.',
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
              border: 'border-blue-500/25',
            },
            {
              icon: Scale,
              metric: 'FY 2025-26',
              title: 'Union Budget Verified',
              desc: 'Algorithmic tax slabs calibrated directly to CBDT notifications and revised Section 115BAC rates.',
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
              border: 'border-amber-500/25',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 sm:p-7 rounded-3xl bg-white/80 dark:bg-[#070B16] border border-slate-200/80 dark:border-white/5 flex flex-col justify-between space-y-4 shadow-md backdrop-blur-xl"
              >
                <div className="space-y-3">
                  <div className={`w-11 h-11 rounded-2xl ${item.bg} border ${item.border} flex items-center justify-center ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`font-mono text-2xl font-black tabular-nums ${item.color}`}>
                      {item.metric}
                    </span>
                    <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white mt-1">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
      {/* ========================================================================= */}
      {/* 8. EDITORIAL FAQ ACCORDION                                                */}
      {/* ========================================================================= */}
      <section id="faq" className="py-24 px-6 max-w-3xl mx-auto relative z-10 border-t border-slate-200/60 dark:border-white/5 scroll-mt-20 sm:scroll-mt-24">
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
          <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
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
                className="fintech-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/5 transition-all shadow-sm"
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
      {/* 9. LUXURY FLOATING CTA BANNER WITH SIGNATURE ACCENT                       */}
      {/* ========================================================================= */}
      <section className="py-24 px-6 max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden p-10 sm:p-14 bg-gradient-to-tr from-emerald-950/80 via-slate-900 to-[#050811] border border-emerald-500/25 text-center space-y-7 shadow-2xl"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
            <SparkleSmallIcon className="w-3.5 h-3.5 fill-current" />
            <span>SOVEREIGN WEALTH CONTROL</span>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight max-w-xl mx-auto">
              Your Financial Friend is Ready.
            </h2>
            <div className="relative inline-block">
              <span className="font-handwriting text-2xl sm:text-3xl text-emerald-400 italic">
                Aapka Sachha धनMitr
              </span>
              <HandDrawnUnderline className="w-full -bottom-2" delay={0.2} color="text-emerald-400" />
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Experience real-time conversational Indic voice budgeting and automated FY 2025-26 tax regime optimization.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onOpenAi('voice')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Try Voice AI Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLaunchHub}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/15 transition-all cursor-pointer backdrop-blur-md"
            >
              <WalletIcon className="w-4 h-4" />
              <span>{isAuthenticated ? 'Open Finance Hub' : 'Explore Platform'}</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 10. MINIMAL LUXURY FOOTER                                                 */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200/60 dark:border-white/5 bg-[#FAFCFF] dark:bg-[#050811] py-10 px-6 relative z-10 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2.5">
            <DhanMitrLogo className="w-8 h-6 shrink-0" />
            <span className="font-display font-extrabold text-slate-900 dark:text-white">
              धन<span className="text-emerald-500">Mitr</span>
            </span>
            <span>•</span>
            <span>Made in India for India</span>
          </div>

          <div className="flex items-center gap-5 text-[11px] font-mono">
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
