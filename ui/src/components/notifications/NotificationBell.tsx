'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { BellIcon } from '@/components/icons/CustomIcons';
import { CheckCircle2, X } from 'lucide-react';

type Severity = 'urgent' | 'warning' | 'info';

interface Notification {
  id: string;
  title: string;
  detail: string;
  daysLabel: string;
  severity: Severity;
}

const SEVERITY_STYLES: Record<Severity, { card: string; title: string; text: string; dot: string }> = {
  urgent: {
    card: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50',
    title: 'text-red-900 dark:text-red-300',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
  warning: {
    card: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50',
    title: 'text-amber-900 dark:text-amber-300',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  info: {
    card: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50',
    title: 'text-emerald-900 dark:text-emerald-300',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
};

export const NotificationBell: React.FC = () => {
  const { subscriptions, insurances, goals } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  // Current timestamp kept in state so render stays pure. Updated when the
  // bell is opened and refreshed periodically while mounted.
  const [now, setNow] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

    // Subscription renewals due within 10 days
    for (const s of subscriptions) {
      if (!s.is_active || s.days_remaining === undefined || s.days_remaining > 10) continue;
      items.push({
        id: `sub-${s.id}`,
        title: `${s.name} renewal`,
        detail: `₹${s.amount.toLocaleString('en-IN')} · ${s.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'} plan`,
        daysLabel: s.days_remaining <= 0 ? 'Due today' : `${s.days_remaining}d left`,
        severity: s.days_remaining <= 3 ? 'urgent' : 'warning',
      });
    }

    // Insurance premiums due within 10 days
    for (const i of insurances) {
      if (!i.is_active || i.days_remaining === undefined || i.days_remaining > 10) continue;
      items.push({
        id: `ins-${i.id}`,
        title: `${i.policy_name} premium`,
        detail: `₹${i.premium_amount.toLocaleString('en-IN')} · ${i.premium_frequency} premium`,
        daysLabel: i.days_remaining <= 0 ? 'Due today' : `${i.days_remaining}d left`,
        severity: i.days_remaining <= 3 ? 'urgent' : 'warning',
      });
    }

    // Goal deadlines within 30 days (needs a valid clock reading)
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
          title: `Goal deadline: ${g.title}`,
          detail: `${progress}% funded · ₹${g.target_amount.toLocaleString('en-IN')} target`,
          daysLabel: daysLeft <= 0 ? 'Past deadline' : `${daysLeft}d left`,
          severity: daysLeft <= 7 ? 'urgent' : 'info',
        });
      }
    }

    const severityRank: Record<Severity, number> = { urgent: 0, warning: 1, info: 2 };
    return items.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
  }, [subscriptions, insurances, goals, now]);

  const visibleNotifications = notifications.filter((n) => !dismissed.includes(n.id));
  const hasUrgent = visibleNotifications.some((n) => n.severity === 'urgent');

  const dismissNotification = (id: string) => {
    setDismissed((prev) => [...prev, id]);
  };

  const clearAll = () => {
    setDismissed((prev) => [...prev, ...visibleNotifications.map((n) => n.id)]);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggleOpen}
        aria-label={`Notifications${visibleNotifications.length ? `, ${visibleNotifications.length} active` : ''}`}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer relative group"
      >
        <BellIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:scale-105 transition-transform" />
        {visibleNotifications.length > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-mono font-black text-white rounded-full ring-2 ring-white dark:ring-[#070B14] ${
              hasUrgent ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
            }`}
          >
            {visibleNotifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="!absolute right-0 sm:-right-8 top-full mt-2.5 w-[min(92vw,360px)] fintech-card rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/40 z-50 overflow-hidden border border-slate-200/90 dark:border-white/15 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <BellIcon className="w-3.5 h-3.5 text-emerald-500" />
                Alerts & Reminders
              </span>
              {visibleNotifications.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {visibleNotifications.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {visibleNotifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[10px] font-mono font-bold text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Close notification panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto p-3 space-y-2.5">
            {visibleNotifications.length === 0 ? (
              <div className="py-6 px-4 flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-3 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  All Caught Up
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[240px] leading-relaxed">
                  No overdue renewals, policy expirations, or impending goal deadlines.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/5 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Telemetry active</span>
                </div>
              </div>
            ) : (
              visibleNotifications.map((n) => {
                const styles = SEVERITY_STYLES[n.severity];
                return (
                  <div
                    key={n.id}
                    className={`group relative p-3 pr-8 rounded-2xl border ${styles.card} transition-all shadow-2xs`}
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
                      className="absolute top-2.5 right-2.5 w-4 h-4 hidden group-hover:flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs leading-none transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
