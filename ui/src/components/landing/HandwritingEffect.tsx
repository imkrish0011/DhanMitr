'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * HandDrawnUnderline
 * An authentic double-stroke curved ink underline flourish that draws
 * with an organic SVG stroke-dashoffset / pathLength animation.
 */
export const HandDrawnUnderline: React.FC<{
  className?: string;
  delay?: number;
  color?: string;
}> = ({ className = '', delay = 0.5, color = 'text-emerald-500' }) => (
  <svg
    viewBox="0 0 320 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`overflow-visible pointer-events-none select-none ${color} ${className}`}
  >
    {/* Primary ink wave */}
    <motion.path
      d="M 6 18 C 65 24, 150 24, 235 15 C 270 11, 295 9, 314 7"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { duration: 0.95, delay, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.15, delay },
      }}
    />
    {/* Return flourish echo (adds organic hand-drawn human imperfection) */}
    <motion.path
      d="M 298 12 C 220 23, 120 25, 24 23"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.8 }}
      transition={{
        pathLength: { duration: 0.8, delay: delay + 0.35, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.15, delay: delay + 0.35 },
      }}
    />
  </svg>
);

/**
 * HandDrawnArrow
 * An expressive hand-drawn cursive doodle arrow pointing toward the primary CTA.
 */
export const HandDrawnArrow: React.FC<{
  className?: string;
  delay?: number;
  color?: string;
}> = ({ className = '', delay = 0.8, color = 'text-emerald-500' }) => (
  <svg
    viewBox="0 0 110 65"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`overflow-visible pointer-events-none select-none ${color} ${className}`}
  >
    {/* Swirling curved stem */}
    <motion.path
      d="M 8 52 C 28 50, 52 46, 70 34 C 84 25, 94 16, 98 8"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { duration: 0.8, delay, ease: [0.25, 1, 0.5, 1] },
        opacity: { duration: 0.15, delay },
      }}
    />
    {/* Arrowhead top barb */}
    <motion.path
      d="M 78 8 C 86 7, 94 7, 98 8"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { duration: 0.25, delay: delay + 0.65, ease: 'easeOut' },
        opacity: { duration: 0.1, delay: delay + 0.65 },
      }}
    />
    {/* Arrowhead bottom barb */}
    <motion.path
      d="M 94 22 C 96 17, 97 12, 98 8"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { duration: 0.25, delay: delay + 0.75, ease: 'easeOut' },
        opacity: { duration: 0.1, delay: delay + 0.75 },
      }}
    />
  </svg>
);

/**
 * HandDrawnLoop
 * An organic loose oval highlight loop circling a word.
 */
export const HandDrawnLoop: React.FC<{
  className?: string;
  delay?: number;
  color?: string;
}> = ({ className = '', delay = 0.3, color = 'text-emerald-500' }) => (
  <svg
    viewBox="0 0 220 85"
    fill="none"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`overflow-visible pointer-events-none select-none ${color} ${className}`}
  >
    <motion.path
      d="M 24 45 C 14 22, 48 10, 110 8 C 176 6, 210 22, 204 48 C 198 72, 142 80, 58 76 C 24 72, 8 54, 20 34 C 28 20, 66 12, 122 10"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.15, delay },
      }}
    />
  </svg>
);

/**
 * HandDrawnCross
 * An expressive organic hand-drawn strikethrough for canceling fees or leaks.
 */
export const HandDrawnCross: React.FC<{
  className?: string;
  delay?: number;
  color?: string;
}> = ({ className = '', delay = 0.4, color = 'text-rose-500' }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`overflow-visible pointer-events-none select-none ${color} ${className}`}
  >
    <motion.path
      d="M 8 9 C 18 19, 24 25, 32 31"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
    />
    <motion.path
      d="M 32 8 C 24 18, 18 24, 7 32"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.35, delay: delay + 0.15, ease: 'easeOut' }}
    />
  </svg>
);

/**
 * HandDrawnCheck
 * An organic handwritten checkmark.
 */
export const HandDrawnCheck: React.FC<{
  className?: string;
  delay?: number;
  color?: string;
}> = ({ className = '', delay = 0.3, color = 'text-emerald-500' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`overflow-visible pointer-events-none select-none ${color} ${className}`}
  >
    <motion.path
      d="M 6 17 C 10 20, 12 23, 14 26 C 18 18, 22 11, 28 6"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  </svg>
);

/**
 * HandDrawnScrollIndicator
 * An organic hand-drawn down squiggle that gently guides the user downwards.
 */
export const HandDrawnScrollIndicator: React.FC<{
  className?: string;
  onClick?: () => void;
}> = ({ className = '', onClick }) => (
  <motion.div
    onClick={onClick}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.6, duration: 0.6 }}
    className={`flex flex-col items-center gap-1.5 cursor-pointer group select-none ${className}`}
  >
    <span className="font-handwriting text-sm sm:text-base text-slate-400 group-hover:text-emerald-500 transition-colors">
      scroll to explore
    </span>
    <motion.svg
      viewBox="0 0 24 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-8 text-slate-400 group-hover:text-emerald-500 transition-colors overflow-visible"
      animate={{ y: [0, 5, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <path
        d="M 12 4 C 12 14, 11 22, 12 28 M 7 23 C 9 26, 11 28, 12 29 C 13 28, 15 26, 17 23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  </motion.div>
);

/**
 * AnimatedHandwrittenWord
 * Simulates real-time cursive handwriting:
 * Characters write on letter-by-letter with subtle organic tilt and opacity,
 * followed by a hand-drawn stroke underline flourish.
 * Cycles smoothly through words ("effortless.", "human.", "peaceful.", "personal.").
 */
interface AnimatedHandwrittenWordProps {
  words?: string[];
  intervalMs?: number;
  className?: string;
}

export const AnimatedHandwrittenWord: React.FC<AnimatedHandwrittenWordProps> = ({
  words = ['effortless.', 'human.', 'peaceful.', 'personal.'],
  intervalMs = 4500,
  className = '',
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [words.length, intervalMs]);

  const currentWord = words[index];

  return (
    <span className={`relative inline-block ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentWord}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
          transition={{ duration: 0.3 }}
          className="relative inline-flex items-baseline font-handwriting tracking-wide font-normal select-none"
        >
          {/* Staggered character write-in animation */}
          {currentWord.split('').map((char, charIdx) => (
            <motion.span
              key={`${currentWord}-${charIdx}`}
              initial={{
                opacity: 0,
                y: 8,
                rotate: (charIdx % 2 === 0 ? -3 : 3),
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                y: 0,
                rotate: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.22,
                delay: 0.08 + charIdx * 0.045,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}

          {/* Underline Flourish that draws right after the letters finish */}
          <HandDrawnUnderline
            key={`underline-${currentWord}`}
            className="absolute -bottom-2 sm:-bottom-3 left-0 w-[108%] -left-[4%]"
            delay={0.1 + currentWord.length * 0.045}
            color="text-emerald-500"
          />
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
