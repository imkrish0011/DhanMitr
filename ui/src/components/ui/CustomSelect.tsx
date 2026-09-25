'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string | React.ReactNode;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  direction?: 'auto' | 'up' | 'down';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
  disabled = false,
  direction = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [computedDirection, setComputedDirection] = useState<'up' | 'down'>('down');
  const [menuCoords, setMenuCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    isUp: boolean;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Dropdown max-height is typically 224px (max-h-56)
    const shouldOpenUp =
      direction === 'up' ||
      (direction === 'auto' && spaceBelow < 240 && spaceAbove > spaceBelow);

    setComputedDirection(shouldOpenUp ? 'up' : 'down');

    // Ensure left does not exceed viewport boundaries
    const width = rect.width;
    let left = rect.left;
    if (left + width > viewportWidth - 8) {
      left = Math.max(8, viewportWidth - width - 8);
    }

    if (shouldOpenUp) {
      setMenuCoords({
        bottom: viewportHeight - rect.top + 6,
        left,
        width,
        isUp: true,
      });
    } else {
      setMenuCoords({
        top: rect.bottom + 6,
        left,
        width,
        isUp: false,
      });
    }
  }, [direction]);

  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleScrollOrResize = () => {
      updateCoords();
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, updateCoords]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        className={`w-full px-3.5 py-2 text-xs text-left rounded-xl bg-slate-50 dark:bg-[#0B101D] border transition-all flex items-center justify-between cursor-pointer select-none ${
          isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
            : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="flex items-center gap-2 truncate text-slate-800 dark:text-slate-200 font-medium">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-emerald-500' : ''
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Portaled Dropdown Menu (immune to modal overflow-hidden/overflow-y-auto clipping) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && menuCoords && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: menuCoords.isUp ? 4 : -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: menuCoords.isUp ? 4 : -4, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/95 dark:border-slate-700 shadow-2xl p-1.5 space-y-0.5 max-h-56 overflow-y-auto"
                style={{
                  position: 'fixed',
                  left: menuCoords.left,
                  width: menuCoords.width,
                  ...(menuCoords.isUp
                    ? { bottom: menuCoords.bottom }
                    : { top: menuCoords.top }),
                  zIndex: 99999,
                  boxShadow:
                    '0 20px 35px -8px rgba(0, 0, 0, 0.4), 0 10px 15px -4px rgba(0, 0, 0, 0.25)',
                }}
              >
                {options.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <span className="truncate">{opt.label}</span>
                      </div>

                      {isSelected && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-2"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
