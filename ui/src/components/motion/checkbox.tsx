'use client';
// beui.dev/components/motion/checkbox

import React, { useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPRING_PRESS } from '@/lib/ease';

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-describedby'?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onCheckedChange,
  label,
  disabled = false,
  className,
  id: propId,
  'aria-describedby': ariaDescribedBy,
}) => {
  const generatedId = useId();
  const id = propId || generatedId;
  const reduce = useReducedMotion();

  const handleToggle = () => {
    if (disabled) return;
    onCheckedChange?.(!checked);
  };

  return (
    <div className={cn('flex items-start gap-2.5 select-none', className)}>
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-describedby={ariaDescribedBy}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'relative w-4.5 h-4.5 rounded-lg border flex items-center justify-center transition-all duration-200 mt-0.5 shrink-0 cursor-pointer outline-none',
          'focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-950',
          checked
            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs shadow-emerald-600/30'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 hover:border-emerald-500/60 dark:hover:border-emerald-500/60',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
        )}
      >
        <AnimatePresence initial={false}>
          {checked && (
            <motion.span
              initial={reduce ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
              transition={SPRING_PRESS}
              className="flex items-center justify-center text-white"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {label && (
        <label
          htmlFor={id}
          onClick={handleToggle}
          className={cn(
            'text-xs font-medium text-slate-600 dark:text-slate-300 leading-snug cursor-pointer transition-colors hover:text-slate-900 dark:hover:text-white',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
};
