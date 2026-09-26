'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '@/context/FinanceContext';
import { useLanguage } from '@/context/LanguageContext';
import { calculateDaysRemaining } from '@/lib/utils';
import { BellIcon } from '@/components/icons/CustomIcons';
import { CheckCircle2, X, Sparkles, RotateCcw } from 'lucide-react';

type Severity = 'urgent' | 'warning' | 'info';

interface Notification {
  id: string;
  title: string;
  detail: string;
  daysLabel: string;
  severity: Severity;
}

export interface NotificationBellProps {
  isMobile?: boolean;
  triggerClassName?: string;
}

const SEVERITY_STYLES: Record<Severity, { card: string; title: string; text: string; dot: string }> = {
  urgent: {
    card: 'bg-red-50/90 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 shadow-red-500/5',
    title: 'text-red-900 dark:text-red-300',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
  warning: {
    card: 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 shadow-amber-500/5',
    title: 'text-amber-900 dark:text-amber-300',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  info: {
    card: 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 shadow-emerald-500/5',
    title: 'text-emerald-900 dark:text-emerald-300',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
};

const DISMISSED_STORAGE_KEY = 'dhanmitr_dismissed_notifications';

export const NotificationBell: React.FC<NotificationBellProps> = ({
  isMobile = false,
  triggerClassName,
}) => {
  const { subscriptions, insurances, goals, netSurplus, totalIncome } = useFinance();
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [lastDismissed, setLastDismissed] = useState<string[] | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [now, setNow] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load persisted dismissed IDs on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setDismissed(parsed);
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === DISMISSED_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setDismissed(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Save dismissed IDs helper
  const saveDismissed = useCallback((newDismissed: string[]) => {
    setDismissed(newDismissed);
    try {
      localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(newDismissed));
    } catch {
      // Ignore storage write errors
    }
  }, []);

  // Keep goal-deadline calculations fresh while mounted
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  // Close on click outside or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (!isOpen) setNow(Date.now());
    setIsOpen(!isOpen);
  };

  const notifications = useMemo<Notification[]>(() => {
    const items: Notification[] = [];

    // 1. Subscription renewals due within 30 days
    for (const s of subscriptions) {
      if (!s.is_active) continue;
      const days = s.days_remaining !== undefined ? s.days_remaining : calculateDaysRemaining(s.next_renewal_date, s.billing_cycle);
      if (days > 30) continue;

      const isUrgent = days <= 3;
      const isSoon = days <= 10;
      const severity: Severity = isUrgent ? 'urgent' : isSoon ? 'warning' : 'info';
      const daysLabel = days <= 0 
        ? (language === 'hi' ? 'आज देय' : 'Due today') 
        : (language === 'hi' ? `${days} दिन शेष` : `${days}d left`);

      items.push({
        id: `sub-${s.id}`,
        title: `${s.name} ${language === 'hi' ? 'नवीनीकरण' : 'renewal'}${isUrgent ? (language === 'hi' ? ' (ऑटो-डेबिट)' : ' (Auto-Debit)') : ''}`,
        detail: `₹${s.amount.toLocaleString('en-IN')} · ${s.billing_cycle === 'monthly' ? (language === 'hi' ? 'मासिक' : 'Monthly') : (language === 'hi' ? 'वार्षिक' : 'Yearly')} · ${s.next_renewal_date || (language === 'hi' ? 'आगामी' : 'Upcoming')}`,
        daysLabel,
        severity,
      });
    }

    // 2. Insurance premiums due within 45 days
    for (const i of insurances) {
      if (!i.is_active) continue;
      const days = i.days_remaining !== undefined ? i.days_remaining : calculateDaysRemaining(i.renewal_date, i.premium_frequency);
      if (days > 45) continue;

      const isUrgent = days <= 7;
      const isSoon = days <= 20;
      const severity: Severity = isUrgent ? 'urgent' : isSoon ? 'warning' : 'info';
      const daysLabel = days <= 0 
        ? (language === 'hi' ? 'आज देय' : 'Due today') 
        : (language === 'hi' ? `${days} दिन शेष` : `${days}d left`);

      items.push({
        id: `ins-${i.id}`,
        title: `${i.policy_name} ${language === 'hi' ? 'प्रीमियम' : 'Premium'}`,
        detail: `₹${i.premium_amount.toLocaleString('en-IN')} · ${i.premium_frequency} · ${days <= 0 ? (language === 'hi' ? 'आज देय' : 'Due today') : (language === 'hi' ? `${days} दिनों में देय` : `Due in ${days} days`)}`,
        daysLabel,
        severity,
      });
    }

    // 3. Smart Financial Surplus Alerts
    if (netSurplus < 0) {
      items.push({
        id: 'alert-cashflow-deficit',
        title: language === 'hi' ? 'मासिक घाटा चेतावनी' : 'Monthly Cash Flow Deficit',
        detail: language === 'hi'
          ? `खर्च आमदनी से ₹${Math.abs(netSurplus).toLocaleString('en-IN')} अधिक है। रनवे जोखिम में है।`
          : `Expenses exceed income by ₹${Math.abs(netSurplus).toLocaleString('en-IN')}. Runway at risk.`,
        daysLabel: language === 'hi' ? 'अति आवश्यक' : 'Urgent',
        severity: 'urgent',
      });
    } else if (netSurplus <= 5000 && totalIncome > 0) {
      items.push({
        id: 'alert-tight-buffer',
        title: language === 'hi' ? 'कम बचत चेतावनी' : 'Tight Cash Buffer Alert',
        detail: language === 'hi'
          ? `इस महीने केवल ₹${netSurplus.toLocaleString('en-IN')} की बचत बची है। अतिरिक्त खर्च सीमित रखें।`
          : `Only ₹${netSurplus.toLocaleString('en-IN')} surplus remaining this month. Limit discretionary spending.`,
        daysLabel: language === 'hi' ? 'सूचना' : 'Notice',
        severity: 'warning',
      });
    }

    // 4. Goal deadlines within 30 days
    if (now > 0) {
      for (const g of goals) {
        if (g.is_completed || !g.target_date) continue;
        const daysLeft = Math.ceil(
          (new Date(g.target_date).getTime() - now) / (1000 * 60 * 60 * 24)
        );
        if (daysLeft > 30) continue;
        const progress =
          g.target_amount > 0
            ? Math.min(100, Math.round((g.current_amount / g.target_amount) * 100))
            : 0;
        items.push({
          id: `goal-${g.id}`,
          title: `${language === 'hi' ? 'लक्ष्य अंतिम तिथि' : 'Goal deadline'}: ${g.title}`,
          detail: `${progress}% ${language === 'hi' ? 'पूरा' : 'funded'} · ₹${g.target_amount.toLocaleString('en-IN')} ${language === 'hi' ? 'लक्ष्य' : 'target'}`,
          daysLabel: daysLeft <= 0 
            ? (language === 'hi' ? 'समय समाप्त' : 'Past deadline') 
            : (language === 'hi' ? `${daysLeft} दिन शेष` : `${daysLeft}d left`),
          severity: daysLeft <= 7 ? 'urgent' : 'info',
        });
      }
    }

    const severityRank: Record<Severity, number> = { urgent: 0, warning: 1, info: 2 };
    return items.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
  }, [subscriptions, insurances, goals, netSurplus, totalIncome, now, language]);

  const visibleNotifications = useMemo(
    () => notifications.filter((n) => !dismissed.includes(n.id)),
    [notifications, dismissed]
  );
  const hasUrgent = visibleNotifications.some((n) => n.severity === 'urgent');

  // Trigger tactile haptics if supported
  const triggerHaptic = useCallback((pattern: number | number[] = 15) => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(pattern);
      } catch {}
    }
  }, []);

  // Dismiss an individual notification with spring layout
  const dismissNotification = useCallback((id: string) => {
    triggerHaptic(10);
    saveDismissed([...dismissed, id]);
  }, [dismissed, saveDismissed, triggerHaptic]);

  // Satisfying "Clear All" micro-interaction with cascade exit & celebration burst
  const clearAll = useCallback(async () => {
    if (visibleNotifications.length === 0 || isClearing) return;

    setIsClearing(true);
    triggerHaptic([15, 30, 20]);

    const idsToClear = visibleNotifications.map((n) => n.id);
    setLastDismissed(idsToClear);

    // Dynamic micro-confetti burst
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: isMobile ? 30 : 38,
        spread: 60,
        origin: isMobile ? { y: 0.16, x: 0.5 } : { y: 0.16, x: 0.85 },
        colors: ['#10B981', '#34D399', '#059669', '#6EE7B7', '#F59E0B'],
        ticks: 110,
        gravity: 1.15,
        scalar: 0.75,
        disableForReducedMotion: true,
      });
    } catch {
      // Graceful fallback
    }

    // Persist dismissed IDs
    saveDismissed([...dismissed, ...idsToClear]);

    // Reset clearing state after animation finishes
    setTimeout(() => {
      setIsClearing(false);
    }, 450);
  }, [visibleNotifications, isClearing, triggerHaptic, isMobile, saveDismissed, dismissed]);

  // Undo action to restore cleared notifications
  const handleUndo = useCallback(() => {
    if (!lastDismissed || lastDismissed.length === 0) return;
    triggerHaptic(15);
    const restored = dismissed.filter((id) => !lastDismissed.includes(id));
    saveDismissed(restored);
    setLastDismissed(null);
  }, [lastDismissed, dismissed, saveDismissed, triggerHaptic]);

  const defaultTriggerClasses = isMobile
    ? 'w-8 h-8 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-2xs flex items-center justify-center transition-all active:scale-95'
    : 'w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer relative group';

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={toggleOpen}
        aria-label={`Notifications${visibleNotifications.length ? `, ${visibleNotifications.length} active` : ''}`}
        className={triggerClassName || defaultTriggerClasses}
      >
        <BellIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:scale-105 transition-transform" />
        {visibleNotifications.length > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-mono font-black text-white rounded-full ring-2 ring-white dark:ring-[#070B14] ${
              hasUrgent
                ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse'
                : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
            }`}
          >
            {visibleNotifications.length}
          </span>
        )}
      </button>

      {/* Mobile Backdrop Overlay */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 sm:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={
              isMobile
                ? 'fixed inset-x-3.5 top-16 max-w-sm mx-auto fintech-card rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden border border-slate-200/90 dark:border-white/15 backdrop-blur-2xl'
                : '!absolute right-0 sm:-right-8 top-full mt-2.5 w-[min(92vw,360px)] fintech-card rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/40 z-50 overflow-hidden border border-slate-200/90 dark:border-white/15 backdrop-blur-2xl'
            }
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BellIcon className="w-3.5 h-3.5 text-emerald-500" />
                  {t.alerts.title}
                </span>
                {visibleNotifications.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    {visibleNotifications.length}
                  </motion.span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {visibleNotifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    disabled={isClearing}
                    className="group flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-500/10 active:scale-95 transition-all cursor-pointer"
                    title={t.alerts.clearAll}
                  >
                    <Sparkles className="w-3 h-3 group-hover:rotate-12 transition-transform text-emerald-500" />
                    <span>{t.alerts.clearAll}</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Close notification panel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List with PopLayout Cascade Physics */}
            <div className="max-h-80 overflow-y-auto p-3 space-y-2.5">
              <AnimatePresence mode="popLayout">
                {visibleNotifications.length === 0 ? (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0, scale: 0.92, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="py-6 px-4 flex flex-col items-center text-center"
                  >
                    {/* Animated Ripple Halo & Elastic Checkmark */}
                    <div className="relative mb-3 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0.7 }}
                        animate={{ scale: [0.7, 1.4, 1.7], opacity: [0.7, 0.25, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.8 }}
                        className="absolute inset-0 rounded-2xl bg-emerald-500/25"
                      />
                      <motion.div
                        initial={{ scale: 0, rotate: -25 }}
                        animate={{ scale: [0, 1.25, 0.95, 1], rotate: [-25, 10, -5, 0] }}
                        transition={{ duration: 0.5, times: [0, 0.6, 0.8, 1], ease: 'easeOut' }}
                        className="relative w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/15"
                      >
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </motion.div>
                    </div>

                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 }}
                      className="text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {t.alerts.allCaughtUp}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 }}
                      className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[240px] leading-relaxed"
                    >
                      {t.alerts.allCaughtUpSub}
                    </motion.p>

                    {/* Undo Action Pill */}
                    {lastDismissed && lastDismissed.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.22 }}
                        className="mt-3.5 flex items-center gap-2"
                      >
                        <button
                          onClick={handleUndo}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                        >
                          <RotateCcw className="w-3 h-3 text-emerald-500" />
                          <span>{t.alerts.undo} ({lastDismissed.length})</span>
                        </button>
                      </motion.div>
                    ) : (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/5 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{t.alerts.telemetryActive}</span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  visibleNotifications.map((n, index) => {
                    const styles = SEVERITY_STYLES[n.severity];
                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{
                          opacity: 0,
                          x: 80,
                          scale: 0.9,
                          filter: 'blur(6px)',
                          transition: {
                            duration: 0.28,
                            delay: isClearing ? index * 0.04 : 0,
                            ease: [0.32, 0.72, 0, 1],
                          },
                        }}
                        transition={{
                          layout: { duration: 0.25, ease: 'easeOut' },
                        }}
                        className={`group relative p-3 pr-8 rounded-2xl border ${styles.card} transition-all shadow-2xs hover:shadow-xs`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-extrabold leading-snug ${styles.title}`}>{n.title}</p>
                          <span
                            className={`flex-shrink-0 px-1.5 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider text-white rounded-md ${styles.dot}`}
                          >
                            {n.daysLabel}
                          </span>
                        </div>
                        <p className={`text-[11px] mt-1 font-mono ${styles.text}`}>{n.detail}</p>
                        <button
                          onClick={() => dismissNotification(n.id)}
                          aria-label="Dismiss notification"
                          className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover:opacity-100 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
