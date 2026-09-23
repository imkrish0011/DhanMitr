'use client';
// beui.dev/components/blocks/bloom-menu

import {
  Bell,
  CreditCard,
  FileText,
  FolderClosed,
  LayoutGrid,
  Link,
  Plus,
  ShieldCheck,
  Table,
  Target,
  TrendingUp,
  Tv,
  Wallet,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { type ComponentType, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EASE_OUT } from '@/lib/ease';
import { cn } from '@/lib/utils';

export type MenuItem = {
  id?: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  description?: string;
};

export const FINANCE_ITEMS: MenuItem[] = [
  { id: 'expense', label: 'Expense', icon: CreditCard, description: 'Daily outflows & bills' },
  { id: 'income', label: 'Income', icon: Wallet, description: 'Salary & earnings' },
  { id: 'subscription', label: 'Subscription', icon: Tv, description: 'OTT & memberships' },
  { id: 'insurance', label: 'Insurance', icon: ShieldCheck, description: 'Health & life cover' },
  { id: 'goal', label: 'Goal', icon: Target, description: 'Savings milestones' },
  { id: 'investment', label: 'Investment', icon: TrendingUp, description: 'SIP & portfolio' },
];

export const DEFAULT_ITEMS: MenuItem[] = [
  { label: 'Doc', icon: FileText },
  { label: 'Board', icon: LayoutGrid },
  { label: 'Table', icon: Table },
  { label: 'Folder', icon: FolderClosed },
  { label: 'Reminder', icon: Bell },
  { label: 'Link', icon: Link },
];

// Folder-open feel: subtle overshoot as the panel expands
const SPRING_FOLDER = {
  type: 'spring',
  stiffness: 340,
  damping: 30,
  mass: 0.9,
} as const;

export interface BloomMenuProps {
  items?: MenuItem[];
  onSelect?: (idOrLabel: string) => void;
  className?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  title?: string;
  align?: 'center' | 'right' | 'left';
  compact?: boolean;
}

export function BloomMenu({
  items = FINANCE_ITEMS,
  onSelect,
  className,
  triggerLabel = 'Add Record',
  triggerClassName,
  title = 'Create Record',
  align = 'right',
  compact = false,
}: BloomMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Hydration safety
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard navigation & outside click dismissal
  useEffect(() => {
    if (!open) return;

    // Prevent background scroll on mobile modal
    const isMobileMode = compact || isMobileScreen;
    let originalOverflow = '';
    if (isMobileMode) {
      originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    const onPointer = (e: PointerEvent) => {
      // For desktop popover, close when clicking outside trigger and popover
      if (
        !isMobileMode &&
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);

    return () => {
      if (isMobileMode) {
        document.body.style.overflow = originalOverflow;
      }
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [open, compact, isMobileScreen]);

  // Determine whether to show full-screen mobile modal or desktop popover
  const showMobileModal = compact || isMobileScreen;

  // Render the menu grid content
  const renderMenuContent = () => (
    <div className="w-full">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 px-4 py-3 bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {title}
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

      {/* Grid of 6 options with iris reveal and radial stagger */}
      <motion.div
        initial={reduce ? false : { clipPath: 'inset(45% 34% 45% 34%)' }}
        animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        transition={{
          delay: reduce ? 0 : 0.06,
          duration: 0.4,
          ease: EASE_OUT as any,
        }}
        className="grid grid-cols-3 bg-white dark:bg-[#0E1526]"
      >
        {items.map((item, i) => {
          const cols = 3;
          const rows = Math.ceil(items.length / cols);
          const col = i % cols;
          const row = Math.floor(i / cols);
          const dist = Math.hypot(
            col - (cols - 1) / 2,
            row - (rows - 1) / 2,
          );
          return (
            <button
              key={item.id || item.label}
              type="button"
              onClick={() => {
                onSelect?.(item.id || item.label);
                setOpen(false);
              }}
              className={cn(
                'flex items-center justify-center p-3.5 sm:p-4 text-slate-600 dark:text-slate-300 transition-colors hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer group',
                i % 3 !== 2 && 'border-r border-slate-100 dark:border-white/5',
                i < items.length - (items.length % 3 === 0 ? 3 : items.length % 3) && 'border-b border-slate-100 dark:border-white/5',
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
                  delay: reduce ? 0 : 0.08 + dist * 0.06,
                  type: 'spring',
                  stiffness: 440,
                  damping: 34,
                }}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.05] group-hover:bg-emerald-500/20 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors shadow-2xs">
                  <item.icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-semibold tracking-tight">{item.label}</span>
              </motion.span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );

  return (
    <div ref={ref} className={cn('relative inline-flex items-center', className)}>
      {/* Trigger Button: Sits cleanly in normal layout flow with zero overlap */}
      <motion.button
        type="button"
        style={{ borderRadius: compact ? 12 : 14 }}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        whileTap={reduce ? undefined : { scale: 0.96 }}
        className={cn(
          'inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold shadow-xs hover:shadow-sm cursor-pointer select-none transition-all',
          compact
            ? 'h-8 px-2.5 text-xs'
            : 'h-10 px-3.5 sm:px-4 text-xs',
          triggerClassName
        )}
      >
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span>{triggerLabel}</span>
          <Plus className={compact ? 'h-3 w-3 stroke-[2.5]' : 'h-3.5 w-3.5 stroke-[2.5]'} />
        </span>
      </motion.button>

      {/* Desktop Dropdown Popover (Only when not in mobile mode) */}
      {!showMobileModal && (
        <AnimatePresence>
          {open && (
            <div
              ref={popoverRef}
              className={cn(
                'absolute top-full mt-2 z-50 w-[min(90vw,380px)]',
                align === 'right' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'
              )}
            >
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -6 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -6 }}
                transition={SPRING_FOLDER as any}
                style={{ borderRadius: 20 }}
                className="overflow-hidden border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0E1526] shadow-2xl shadow-slate-900/15 dark:shadow-black/60 origin-top-right"
              >
                {renderMenuContent()}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      )}

      {/* Mobile Fullscreen Modal via React Portal (Immune to parent backdrop-blur and sticky headers) */}
      {showMobileModal && mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-label={title}
            >
              {/* Fullscreen Transparent Dismiss Backdrop (Keeps background 100% bright and clear) */}
              <div
                className="fixed inset-0 bg-transparent"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />

              {/* Centered Modal Card with Safe Viewport Margins */}
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 16 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 16 }}
                transition={SPRING_FOLDER as any}
                style={{ borderRadius: 22 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 w-[min(92vw,360px)] max-h-[85vh] overflow-y-auto border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0E1526] shadow-2xl shadow-black/50"
              >
                {renderMenuContent()}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default BloomMenu;
