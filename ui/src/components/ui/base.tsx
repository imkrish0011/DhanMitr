'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    className,
    children,
    disabled,
    ...props
  },
  ref
) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs font-semibold',
    lg: 'px-6 py-2.5 text-sm font-bold',
  }[size];

  const variantClasses = {
    default: 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
    primary: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs hover:shadow-sm',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    outline: 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  }[variant];

  return (
    <motion.button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl transition-colors disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer',
        sizeClasses,
        variantClasses,
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
});
