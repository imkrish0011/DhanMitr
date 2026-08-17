'use client';
// beui.dev/components/blocks/bloom-menu

import {
  Bell,
  CreditCard,
  FileText,
  Plus,
  ShieldCheck,
  TrendingUp,
  Tv,
  Wallet,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { type ComponentType, useEffect, useId, useRef, useState } from 'react';
import { EASE_OUT } from '@/lib/ease';
import { cn } from '@/lib/utils';

export type MenuItem = { label: string; icon: ComponentType<{ className?: string }>; description?: string; id?: string };

const DEFAULT_FINANCE_ITEMS: MenuItem[] = [
  { id: 'subscription', label: 'Subscription', icon: Tv, description: 'OTT & memberships' },
  { id: 'insurance', label: 'Insurance', icon: ShieldCheck, description: 'Health & life cover' },
  { id: 'income', label: 'Income', icon: Wallet, description: 'Salary & freelance' },
  { id: 'expense', label: 'Expense', icon: CreditCard, description: 'Daily transactions' },
  { id: 'investment', label: 'Investment', icon: TrendingUp, description: 'SIP & stocks' },
  { id: 'reminder', label: 'Alert / Bill', icon: Bell, description: 'Renewal reminders' },
];

const SPRING_FOLDER = {
  type: 'spring',
  stiffness: 300,
  damping: 32,
  mass: 0.9,
} as const;

export interface BloomMenuProps {
  items?: MenuItem[];
  onSelect?: (idOrLabel: string) => void;
  className?: string;
  triggerLabel?: string;
}

export function BloomMenu({
  items = DEFAULT_FINANCE_ITEMS,
  onSelect,
  className,
  triggerLabel = 'Add Info',
}: BloomMenuProps) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const layoutId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  const morph = reduce ? { duration: 0.15 } : (SPRING_FOLDER as any);

  return (
    <div ref={ref} className={cn('relative inline-flex', className)}>
      {/* spacer fixes the anchor to the trigger size */}
      <div className="h-10 w-28 sm:w-32" aria-hidden />

      {/* Centering box sized to the OPEN panel */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-50 grid h-[320px] w-[min(88vw,420px)] -translate-x-1/2 -translate-y-1/2 place-items-center [&>*]:pointer-events-auto">
        <AnimatePresence initial={false} mode="popLayout">
          {open ? (
            <motion.div
              key="panel"
              layoutId={layoutId}
              transition={morph}
              style={{ borderRadius: 20 }}
              className="w-[min(88vw,420px)] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-2xl"
            >
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reduce ? 0 : 0.12, duration: 0.2 }}
              >
                {/* header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40">
                  <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    Add Financial Record
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* grid */}
                <motion.div
                  initial={
                    reduce ? false : { clipPath: 'inset(45% 34% 45% 34%)' }
                  }
                  animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                  transition={{
                    delay: reduce ? 0 : 0.08,
                    duration: 0.45,
                    ease: EASE_OUT as any,
                  }}
                  className="grid grid-cols-3 bg-white dark:bg-[#0F172A]"
                >
                  {items.map((item, i) => {
                    const cols = 3;
                    const rows = Math.ceil(items.length / cols);
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    const dist = Math.hypot(
                      col - (cols - 1) / 2,
                      row - (rows - 1) / 2
                    );
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          onSelect?.(item.id || item.label);
                          setOpen(false);
                        }}
                        className={cn(
                          'flex items-center justify-center p-3.5 sm:p-4 text-slate-600 dark:text-slate-300 transition-colors hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer',
                          i % 3 !== 2 && 'border-r border-slate-100 dark:border-slate-800/80',
                          i < 3 && 'border-b border-slate-100 dark:border-slate-800/80'
                        )}
                      >
                        <motion.span
                          initial={
                            reduce
                              ? { opacity: 0 }
                              : { opacity: 0, scale: 0.85, filter: 'blur(6px)' }
                          }
                          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                          transition={{
                            delay: reduce ? 0 : 0.1 + dist * 0.07,
                            type: 'spring',
                            stiffness: 440,
                            damping: 34,
                          }}
                          className="flex flex-col items-center gap-1.5 text-center"
                        >
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/90 flex items-center justify-center text-slate-700 dark:text-slate-200">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <span className="text-[11px] font-semibold tracking-tight">{item.label}</span>
                        </motion.span>
                      </button>
                    );
                  })}
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.button
              key="trigger"
              type="button"
              layoutId={layoutId}
              transition={morph}
              style={{ borderRadius: 14 }}
              onClick={() => setOpen(true)}
              aria-haspopup="menu"
              aria-expanded={open}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="inline-flex h-10 w-28 sm:w-32 items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs hover:shadow-sm cursor-pointer select-none"
            >
              <motion.span
                layout
                className="inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{triggerLabel}</span>
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
