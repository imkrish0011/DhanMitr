'use client';
// beui.dev/components/motion/input

import React, { forwardRef, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/lib/ease';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  success?: boolean;
  reserveErrorLine?: boolean;
  onChange?: ((value: string) => void) | React.ChangeEventHandler<HTMLInputElement>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    leftIcon,
    rightIcon,
    error,
    success,
    reserveErrorLine = false,
    className,
    disabled,
    id: propId,
    value,
    onChange,
    type = 'text',
    ...props
  },
  ref
) {
  const generatedId = useId();
  const id = propId || generatedId;
  const reduce = useReducedMotion();
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    if (onChange.length === 1 && typeof (onChange as any) === 'function') {
      try {
        (onChange as any)(e.target.value);
      } catch {
        (onChange as any)(e);
      }
    } else {
      (onChange as any)(e);
    }
  };

  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
        >
          <span>{label}</span>
          {success && !hasError && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-150">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Valid</span>
            </span>
          )}
        </label>
      )}

      <div
        className={cn(
          'group relative flex items-center w-full rounded-xl border transition-all duration-200',
          'bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xs',
          hasError
            ? 'border-rose-400 dark:border-rose-500/70 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20'
            : isFocused
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
          disabled && 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900/40'
        )}
      >
        {leftIcon && (
          <div
            className={cn(
              'pl-3 pr-1 flex items-center justify-center shrink-0 transition-colors duration-150 pointer-events-none',
              hasError
                ? 'text-rose-500'
                : isFocused
                ? 'text-emerald-500 dark:text-emerald-400'
                : 'text-slate-400 dark:text-slate-500',
              '[&_svg]:w-3.5 [&_svg]:h-3.5'
            )}
          >
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={id}
          type={type}
          disabled={disabled}
          value={value ?? ''}
          onChange={handleChange}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            'w-full py-2 px-2.5 bg-transparent text-xs font-medium text-slate-900 dark:text-white',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal',
            'outline-none focus:outline-none transition-colors',
            leftIcon && 'pl-1.5',
            rightIcon && 'pr-1.5',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="pr-2.5 pl-1 flex items-center justify-center shrink-0 [&_svg]:w-3.5 [&_svg]:h-3.5">
            {rightIcon}
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {hasError && (
          <motion.p
            role="alert"
            initial={reduce ? { opacity: 0, height: 0 } : { opacity: 0, height: 0, y: -2 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={reduce ? { opacity: 0, height: 0 } : { opacity: 0, height: 0, y: -2 }}
            transition={{ duration: 0.16, ease: EASE_OUT }}
            className="text-[10px] font-semibold text-rose-500 dark:text-rose-400 px-0.5 overflow-hidden"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});
