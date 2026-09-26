'use client';

import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  Mic,
  Plus,
  Minus,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Wallet,
  Activity,
  ArrowRight,
  CreditCard,
  Clock,
  Layers,
  Store,
  Briefcase,
  PieChart,
} from 'lucide-react';
import {
  DhanMitrLogo,
  BellIcon,
  WalletIcon,
  ArrowDownOutflowIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  ProviderLogo,
  RocketIcon,
} from '@/components/icons/CustomIcons';
import { SubscriptionsTab } from '@/components/finance/SubscriptionsTab';
import { InsurancesTab } from '@/components/finance/InsurancesTab';
import { BudgetIncomeTab } from '@/components/finance/BudgetIncomeTab';
import { GoalsTab } from '@/components/finance/GoalsTab';
import { TaxRegimeComparator } from '@/components/finance/TaxRegimeComparator';
import { ProjectLoanSuite } from '@/components/calculator/ProjectLoanSuite';
import { BloomMenu } from '@/components/ui/BloomMenu';
import { ThemeToggle } from '@/components/motion/theme-toggle';
import { useLanguage } from '@/context/LanguageContext';

interface MobileFinanceHubProps {
  onOpenVoice: () => void;
  onOpenChat: () => void;
  onOpenAddModal: (type?: string) => void;
  onOpenTransactions?: () => void;
}

export const MobileFinanceHub: React.FC<MobileFinanceHubProps> = ({
  onOpenVoice,
  onOpenChat,
  onOpenAddModal,
  onOpenTransactions,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { profile, user } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const {
    activeSubTab,
    setActiveSubTab,
    totalIncome,
    totalOutflow,
    netSurplus,
    savingsRate,
    emergencyRunwayMonths,
    spendingCategories,
    activeSubscriptionsCount,
    activeInsurancesCount,
    activeGoalsCount,
    subscriptions,
    insurances,
  } = useFinance();

  const [showNotifications, setShowNotifications] = React.useState(false);

  const userName = profile?.name?.trim() || user?.user_metadata?.full_name?.trim() || 'Partner';
  const firstName = userName.split(' ')[0];

  // Dynamic alerts strictly from user's actual database & calculations
  const activeAlerts = [
    ...(netSurplus < 0
      ? [
          {
            id: 'alert-deficit',
            title: language === 'hi' ? 'मासिक घाटा चेतावनी' : 'Monthly Deficit Warning',
            sub: language === 'hi' ? `खर्च आमदनी से ₹${Math.abs(netSurplus).toLocaleString('en-IN')} अधिक` : `Outflow exceeds Inflow by ₹${Math.abs(netSurplus).toLocaleString('en-IN')}`,
            type: 'urgent' as const,
          },
        ]
      : netSurplus <= 5000 && totalIncome > 0
      ? [
          {
            id: 'alert-tight',
            title: language === 'hi' ? 'कम बचत चेतावनी' : 'Tight Buffer Warning',
            sub: language === 'hi' ? `केवल ₹${netSurplus.toLocaleString('en-IN')} शेष` : `Only ₹${netSurplus.toLocaleString('en-IN')} surplus remaining`,
            type: 'warning' as const,
          },
        ]
      : []),
    ...subscriptions
      .filter((s) => s.is_active && (s.is_urgent || (s.days_remaining !== undefined && s.days_remaining <= 30)))
      .map((s) => {
        const days = s.days_remaining !== undefined ? s.days_remaining : 10;
        return {
          id: s.id,
          title: `${s.name} ${language === 'hi' ? 'नवीनीकरण' : 'Renewal'}`,
          sub: `₹${s.amount.toLocaleString('en-IN')} · ${days <= 0 ? (language === 'hi' ? 'आज देय' : 'Due Today') : `${days}d left`} (${s.next_renewal_date || 'Upcoming'})`,
          type: days <= 3 ? ('urgent' as const) : ('warning' as const),
        };
      }),
    ...insurances
      .filter((i) => i.is_active && (i.is_urgent || (i.days_remaining !== undefined && i.days_remaining <= 45)))
      .map((i) => {
        const days = i.days_remaining !== undefined ? i.days_remaining : 20;
        return {
          id: i.id,
          title: `${i.policy_name} ${language === 'hi' ? 'पॉलिसी किस्त' : 'Premium'}`,
          sub: `₹${i.premium_amount.toLocaleString('en-IN')} · ${days <= 0 ? (language === 'hi' ? 'आज देय' : 'Due Today') : `${days}d left`} (${i.renewal_date || 'Upcoming'})`,
          type: days <= 7 ? ('urgent' as const) : ('warning' as const),
        };
      }),
  ];

  const tabs = [
    { id: 'overview' as const, label: t.tabs.overview, shortLabel: t.tabs.overview },
    { id: 'msme_tools' as const, label: t.tabs.msme, shortLabel: t.tabs.msme },
    { id: 'budget' as const, label: t.tabs.budget, shortLabel: t.tabs.budget },
    { id: 'goals' as const, label: t.tabs.goals(activeGoalsCount), shortLabel: t.tabs.goals(activeGoalsCount) },
    { id: 'tax_calculator' as const, label: t.tabs.tax, shortLabel: t.tabs.tax },
    { id: 'subscriptions' as const, label: t.tabs.subs(activeSubscriptionsCount), shortLabel: t.tabs.subs(activeSubscriptionsCount) },
    { id: 'insurances' as const, label: t.tabs.ins(activeInsurancesCount), shortLabel: t.tabs.ins(activeInsurancesCount) },
  ];

  // Dynamic visual theme based on surplus state:
  // Red = Negative (Deficit)
  // Orange = Close to Negative (Tight buffer / Low Surplus)
  // Green = Healthy Surplus
  const surplusStatus = React.useMemo<'healthy' | 'warning' | 'negative'>(() => {
    if (netSurplus < 0) return 'negative';
    if (netSurplus <= Math.max(5000, totalIncome * 0.15) || savingsRate <= 15) {
      return 'warning';
    }
    return 'healthy';
  }, [netSurplus, totalIncome, savingsRate]);

  const heroCardConfig = React.useMemo(() => {
    if (surplusStatus === 'negative') {
      return {
        cardBg: 'bg-gradient-to-br from-[#2e090f] via-[#1a0508] to-[#0d0204]',
        borderColor: 'border-rose-500/35',
        shadowColor: 'shadow-[0_24px_50px_-12px_rgba(225,29,72,0.4)]',
        glow1: 'bg-rose-500/25',
        glow2: 'bg-rose-600/15',
        highlightLine: 'via-rose-400/50',
        logoColor: 'text-rose-400',
        label: language === 'hi' ? 'मासिक घाटा (Deficit)' : 'Monthly Deficit',
        subLabel: language === 'hi' ? '(खर्च आमदनी से अधिक)' : '(Outflow exceeds Inflow)',
        badgeBg: 'bg-rose-500/20 border-rose-400/30 text-rose-300',
        badgePulse: 'bg-rose-400',
        badgeText: `▼ ${Math.abs(savingsRate)}% ${language === 'hi' ? 'घाटा' : 'Deficit'}`,
        currencyColor: 'text-rose-400 font-mono',
        bufferText: language === 'hi' ? '⚠️ सावधान: इस महीने बचत समाप्त होकर घाटा है' : '⚠️ Warning: Deficit balance this month',
        bufferColor: 'text-rose-200/80',
      };
    }

    if (surplusStatus === 'warning') {
      return {
        cardBg: 'bg-gradient-to-br from-[#2b1704] via-[#1a0d02] to-[#0d0601]',
        borderColor: 'border-amber-500/35',
        shadowColor: 'shadow-[0_24px_50px_-12px_rgba(245,158,11,0.35)]',
        glow1: 'bg-amber-500/20',
        glow2: 'bg-orange-500/15',
        highlightLine: 'via-amber-400/50',
        logoColor: 'text-amber-400',
        label: language === 'hi' ? 'सीमित बचत (Low Surplus)' : 'Low Surplus (Tight Buffer)',
        subLabel: language === 'hi' ? '(शून्य के करीब)' : '(Close to Deficit)',
        badgeBg: 'bg-amber-500/20 border-amber-400/30 text-amber-300',
        badgePulse: 'bg-amber-400',
        badgeText: `▲ ${Math.max(0, savingsRate)}% ${language === 'hi' ? 'कम बचत' : 'Tight Buffer'}`,
        currencyColor: 'text-amber-400 font-mono',
        bufferText: language === 'hi' ? `सीमित बचत शेष • ${emergencyRunwayMonths} माह की सुरक्षा` : `Low buffer remaining • ${emergencyRunwayMonths} mo safety buffer`,
        bufferColor: 'text-amber-200/80',
      };
    }

    // Default: Healthy / Green
    return {
      cardBg: 'bg-gradient-to-br from-[#06291d] via-[#041d14] to-[#02100b]',
      borderColor: 'border-emerald-500/25',
      shadowColor: 'shadow-[0_24px_50px_-12px_rgba(5,150,105,0.35)]',
      glow1: 'bg-emerald-500/20',
      glow2: 'bg-teal-500/15',
      highlightLine: 'via-emerald-400/40',
      logoColor: 'text-emerald-400',
      label: t.hero.surplusLabel,
      subLabel: t.hero.surplusSub,
      badgeBg: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300',
      badgePulse: 'bg-emerald-400',
      badgeText: t.hero.savingsRate(savingsRate),
      currencyColor: 'text-emerald-400/80 font-mono',
      bufferText: t.hero.safeBuffer(emergencyRunwayMonths),
      bufferColor: 'text-emerald-200/60',
    };
  }, [surplusStatus, netSurplus, totalIncome, savingsRate, emergencyRunwayMonths, language, t]);

  return (
    <div className="w-full bg-transparent pb-2 text-slate-900 dark:text-white transition-colors duration-200">
      {/* Top Mobile App Bar */}
      <div className="sticky top-0 z-30 px-4 py-2.5 bg-white/90 dark:bg-[#070B14]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <DhanMitrLogo className="w-8 h-8" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#070B14]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black tracking-tight text-sm text-slate-900 dark:text-white">
                धन<span className="text-emerald-500">Mitr</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
              {t.greeting(firstName, new Date().getHours())}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Language Selector Toggle */}
          <button
            onClick={toggleLanguage}
            className="h-8 px-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs transition-all flex items-center gap-1 active:scale-95 select-none"
            title={language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
            aria-label="Toggle language"
          >
            <span className="text-[11px]">🌐</span>
            <span className={language === 'hi' ? 'text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]' : 'text-slate-400 font-medium text-[10px]'}>हि</span>
            <span className="text-slate-300 dark:text-slate-700 text-[9px]">/</span>
            <span className={language === 'en' ? 'text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]' : 'text-slate-400 font-medium text-[10px]'}>EN</span>
          </button>

          {/* Mobile Theme Toggle */}
          <ThemeToggle
            variant="rectangle"
            start="bottom-up"
            className="w-8 h-8 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-2xs flex items-center justify-center p-0 transition-all active:scale-95"
            iconClassName="w-3.5 h-3.5"
            title="Toggle theme"
          />

          {/* Mobile BloomMenu for Adding Records */}
          <BloomMenu
            compact
            triggerLabel={language === 'hi' ? 'जोड़ें' : 'Add'}
            triggerClassName="h-8 px-2.5 text-xs rounded-xl shadow-xs"
            onSelect={(id) => onOpenAddModal(id)}
          />

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-8 h-8 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-2xs flex items-center justify-center transition-all active:scale-95"
              aria-label="Notifications"
            >
              <BellIcon className="w-3.5 h-3.5" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#070B14] animate-pulse" />
              )}
            </button>

            {/* Mobile Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-white">{t.alerts.title}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {t.alerts.active(activeAlerts.length)}
                  </span>
                </div>
                <div className="space-y-2">
                  {activeAlerts.length === 0 ? (
                    <p className="text-slate-400 text-center py-2 text-[11px]">{t.alerts.empty}</p>
                  ) : (
                    activeAlerts.map((alt) => {
                      const isUrgent = alt.type === 'urgent';
                      return (
                        <div
                          key={alt.id}
                          className={`p-2.5 rounded-xl border ${
                            isUrgent
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50'
                              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50'
                          }`}
                        >
                          <p className={`font-bold text-xs ${isUrgent ? 'text-rose-900 dark:text-rose-300' : 'text-amber-900 dark:text-amber-300'}`}>
                            {alt.title}
                          </p>
                          <p className={`text-[10px] ${isUrgent ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'}`}>
                            {alt.sub}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Smooth Horizontally Scrollable Sub-Tabs */}
      {activeSubTab !== 'msme_tools' && (
        <div className="px-4 pt-2.5 pb-2 select-none">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-[#0c1220]/90 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-white/5 overflow-x-auto no-scrollbar shadow-inner">
            {tabs.map((tab) => {
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all text-center whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold shadow-xs border border-slate-200/50 dark:border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Contents */}
      {activeSubTab === 'overview' && (
        <div className="px-4 space-y-3.5 pt-1">
          {/* Hero Surplus Card (Apple Card / Jupiter Inspired Luxury Obsidian Card) */}
          <div className={`relative p-6 sm:p-7 rounded-3xl ${heroCardConfig.cardBg} text-white ${heroCardConfig.shadowColor} overflow-hidden border ${heroCardConfig.borderColor} transition-all duration-300`}>
            {/* Ambient diffuse decorative glow & subtle metallic shimmer */}
            <div className={`absolute -top-10 -right-10 w-48 h-48 ${heroCardConfig.glow1} rounded-full blur-3xl pointer-events-none transition-all duration-300`} />
            <div className={`absolute -bottom-10 -left-10 w-44 h-44 ${heroCardConfig.glow2} rounded-full blur-3xl pointer-events-none transition-all duration-300`} />
            <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${heroCardConfig.highlightLine} to-transparent pointer-events-none`} />

            {/* Subtle background brand watermark */}
            <div className="absolute right-2 bottom-12 opacity-[0.04] pointer-events-none select-none">
              <DhanMitrLogo className={`w-44 h-44 ${heroCardConfig.logoColor}`} />
            </div>

            {/* Top Row: Reassuring Label & Live Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-white/90 flex items-center gap-1.5">
                  <span>{heroCardConfig.label}</span>
                  <span className="text-white/60 font-normal text-xs">{heroCardConfig.subLabel}</span>
                </p>
              </div>

              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${heroCardConfig.badgeBg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${heroCardConfig.badgePulse} animate-pulse`} />
                <span>{heroCardConfig.badgeText}</span>
              </div>
            </div>

            {/* Hero Balance: Big, bold amount with generous breathing room */}
            <div className="relative z-10 my-5">
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-sans tabular-nums flex items-baseline gap-1">
                <span className={`text-2xl sm:text-3xl font-bold ${heroCardConfig.currencyColor}`}>
                  {netSurplus < 0 ? '-' : ''}₹
                </span>
                <span>{Math.abs(netSurplus).toLocaleString('en-IN')}</span>
              </h2>
              <p className={`text-xs ${heroCardConfig.bufferColor} mt-1 font-medium flex items-center gap-2`}>
                <span>{heroCardConfig.bufferText}</span>
              </p>
            </div>

            {/* Two Big Tactile Action Pills (+ आया & - गया) */}
            <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 pt-1">
              {/* + आया (Green Pill / Money In) */}
              <button
                onClick={() => onOpenAddModal('income')}
                className="flex-1 min-w-0 flex items-center justify-center gap-2 sm:gap-2.5 py-3 px-3 sm:px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.97] transition-all duration-150 text-slate-950 font-bold shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)] cursor-pointer group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-950/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="text-left leading-tight min-w-0">
                  <span className="block text-xs sm:text-sm font-black tracking-tight text-slate-950 whitespace-nowrap truncate">
                    {t.hero.moneyIn}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] font-bold text-slate-900/75 uppercase tracking-wider whitespace-nowrap truncate">
                    {t.hero.moneyInSub}
                  </span>
                </div>
              </button>

              {/* - गया (Coral Rose Pill / Money Out) */}
              <button
                onClick={() => onOpenAddModal('expense')}
                className="flex-1 min-w-0 flex items-center justify-center gap-2 sm:gap-2.5 py-3 px-3 sm:px-4 rounded-2xl bg-rose-500 hover:bg-rose-400 active:scale-[0.97] transition-all duration-150 text-white font-bold shadow-[0_8px_20px_-4px_rgba(244,63,94,0.4)] cursor-pointer group"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Minus className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="text-left leading-tight min-w-0">
                  <span className="block text-xs sm:text-sm font-black tracking-tight text-white whitespace-nowrap truncate">
                    {t.hero.moneyOut}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] font-bold text-white/80 uppercase tracking-wider whitespace-nowrap truncate">
                    {t.hero.moneyOutSub}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 1-Tap Quick Action Dock for Mobile */}
          <div className="grid grid-cols-4 gap-2 py-0.5">
            <button
              onClick={onOpenVoice}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-emerald-500/40 active:scale-95 transition-all text-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{t.actions.voiceLog}</span>
              <span className="text-[9px] text-slate-400">{t.actions.voiceLogSub}</span>
            </button>

            <button
              onClick={() => onOpenAddModal()}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-emerald-500/40 active:scale-95 transition-all text-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{t.actions.addEntry}</span>
              <span className="text-[9px] text-slate-400">{t.actions.addEntrySub}</span>
            </button>

            <button
              onClick={() => setActiveSubTab('msme_tools')}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-teal-500/40 active:scale-95 transition-all text-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{t.actions.msmeHub}</span>
              <span className="text-[9px] text-slate-400">{t.actions.msmeHubSub}</span>
            </button>

            <button
              onClick={() => {
                if (onOpenTransactions) onOpenTransactions();
              }}
              className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-blue-500/40 active:scale-95 transition-all text-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{t.actions.passbook}</span>
              <span className="text-[9px] text-slate-400">{t.actions.passbookSub}</span>
            </button>
          </div>

          {/* 2x2 Bento KPI Tiles */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Monthly Inflow */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center">
                  <WalletIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="inline-flex items-center text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                  {t.bento.inflowBadge}
                </span>
              </div>
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">{t.bento.monthlyIncome}</p>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
                ₹{totalIncome.toLocaleString('en-IN')}
              </h4>
              <span className="text-[9px] text-slate-500 block mt-0.5">{t.bento.incomeSub}</span>
            </div>

            {/* Total Outflow */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-amber-500/30 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-500/20 flex items-center justify-center">
                  <ArrowDownOutflowIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="inline-flex items-center text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                  {t.bento.outflowBadge}
                </span>
              </div>
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">{t.bento.totalOutflow}</p>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono tabular-nums mt-0.5">
                ₹{totalOutflow.toLocaleString('en-IN')}
              </h4>
              <span className="text-[9px] text-slate-500 block mt-0.5">{t.bento.outflowSub}</span>
            </div>

            {/* Active Commitments (Tap to switch) */}
            <div
              onClick={() => setActiveSubTab('subscriptions')}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-purple-500/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-purple-400 transition-colors" />
              </div>
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">{t.bento.commitments}</p>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                {t.bento.commitmentsSub(activeSubscriptionsCount, activeInsurancesCount)}
              </h4>
              <span className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold block mt-0.5">
                {t.bento.tapToInspect}
              </span>
            </div>

            {/* Emergency Runway Cushion */}
            <div
              onClick={() => setActiveSubTab('budget')}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs hover:border-teal-500/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                </div>
                <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded-full">
                  {t.bento.runwayBadge}
                </span>
              </div>
              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">{t.bento.runwayTitle}</p>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
                {t.bento.runwayMonths(emergencyRunwayMonths)}
              </h4>
              <span className="text-[9px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1 mt-0.5">
                {t.bento.runwaySub} <ChevronRight className="w-2.5 h-2.5 inline" />
              </span>
            </div>
          </div>

          {/* Streamlined Spending Snapshot Card (Clean & Compact) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-white/5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <PieChart className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {t.spending.title}
                </span>
              </div>
              <button
                onClick={() => setActiveSubTab('budget')}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>{t.spending.viewAll}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Proportional Multi-color Bar */}
            <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
              {spendingCategories
                .filter((c) => c.amount > 0)
                .map((c) => (
                  <div
                    key={c.id}
                    style={{
                      width: `${c.percentage}%`,
                      backgroundColor: c.color || '#10B981',
                    }}
                    title={`${c.category}: ${c.percentage}%`}
                    className="h-full transition-all"
                  />
                ))}
            </div>

            {/* Top Categories Pills */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5 text-[11px]">
              {spendingCategories
                .filter((c) => c.amount > 0)
                .slice(0, 3)
                .map((c) => (
                  <div key={c.id} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color || '#10B981' }} />
                    <span className="font-medium truncate max-w-[90px]">{c.category}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">₹{c.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* AI Sovereign Insight Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-transparent border border-emerald-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 fill-emerald-500/30" />
                </div>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  {t.aiCard.title}
                </span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">
                {t.aiCard.badge}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {netSurplus > 0
                ? t.aiCard.surplusInsight(netSurplus.toLocaleString('en-IN'), savingsRate, emergencyRunwayMonths)
                : t.aiCard.emptyInsight}
            </p>
            <button
              onClick={onOpenChat}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/20"
            >
              <span>{t.aiCard.button}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Upcoming Renewals */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t.renewals.title}
              </h3>
              <button
                onClick={() => setActiveSubTab('subscriptions')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 cursor-pointer"
              >
                {t.renewals.viewAll}
              </button>
            </div>

            <div className="space-y-2">
              {subscriptions.length === 0 ? (
                <div className="p-4 bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200/80 dark:border-white/5 text-center shadow-2xs">
                  <p className="text-xs text-slate-400">{t.renewals.empty}</p>
                </div>
              ) : (
                subscriptions.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200/80 dark:border-white/5 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <ProviderLogo logoKey={s.logoKey} className="w-9 h-9 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</h4>
                          {s.is_urgent && (
                            <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 rounded">
                              {t.renewals.urgentBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {t.renewals.dueIn(s.next_renewal_date, s.days_remaining)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block font-mono">
                        ₹{s.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] text-slate-400 capitalize">{s.billing_cycle}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'msme_tools' && (
        <div className="px-4 pt-3.5 space-y-4">
          <ProjectLoanSuite />
        </div>
      )}

      {activeSubTab === 'goals' && (
        <div className="px-4 pt-2">
          <GoalsTab />
        </div>
      )}

      {activeSubTab === 'tax_calculator' && (
        <div className="px-4 pt-2">
          <TaxRegimeComparator />
        </div>
      )}

      {activeSubTab === 'subscriptions' && (
        <div className="px-4 pt-2">
          <SubscriptionsTab onOpenAddModal={() => onOpenAddModal('subscription')} />
        </div>
      )}

      {activeSubTab === 'insurances' && (
        <div className="px-4 pt-2">
          <InsurancesTab onOpenAddModal={() => onOpenAddModal('insurance')} />
        </div>
      )}

      {activeSubTab === 'budget' && (
        <div className="px-4 pt-2">
          <BudgetIncomeTab onOpenAddModal={() => onOpenAddModal('income')} />
        </div>
      )}
    </div>
  );
};
