"use client";
// beui.dev/components/motion/loader

import { motion, useReducedMotion } from "motion/react";
import { EASE_IN_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type LoaderVariant = "helix";

export interface LoaderProps {
  /** Which animation to render. Default: "helix". */
  variant?: LoaderVariant;
  /** Base square size in px. Everything scales from this. */
  size?: number;
  /** Seconds per animation cycle. */
  speed?: number;
  /** Accessible label announced to screen readers. */
  label?: string;
  className?: string;
}

interface PartProps {
  size: number;
  speed: number;
  reduce: boolean;
}

export function Helix({ size, speed, reduce }: PartProps) {
  const rows = 7;
  const dot = size * 0.14;
  const amp = size * 0.32;
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      {Array.from({ length: rows }, (_, r) => {
        const top = (r / (rows - 1)) * (size - dot);
        const delay = (r / rows) * speed;
        return (
          <span key={`row-${top}`}>
            <motion.span
              className="absolute rounded-full bg-current"
              style={{ width: dot, height: dot, left: size / 2 - dot / 2, top }}
              animate={
                reduce
                  ? { opacity: [0.4, 1, 0.4] }
                  : {
                      x: [amp, -amp, amp],
                      scale: [1, 0.5, 1],
                      opacity: [1, 0.45, 1],
                    }
              }
              transition={{
                duration: speed,
                ease: EASE_IN_OUT,
                repeat: Infinity,
                delay,
              }}
            />
            <motion.span
              className="absolute rounded-full bg-current"
              style={{ width: dot, height: dot, left: size / 2 - dot / 2, top }}
              animate={
                reduce
                  ? { opacity: [0.4, 1, 0.4] }
                  : {
                      x: [-amp, amp, -amp],
                      scale: [0.5, 1, 0.5],
                      opacity: [0.45, 1, 0.45],
                    }
              }
              transition={{
                duration: speed,
                ease: EASE_IN_OUT,
                repeat: Infinity,
                delay,
              }}
            />
          </span>
        );
      })}
    </span>
  );
}

export function Loader({
  variant = "helix",
  size = 32,
  speed = 1,
  label = "Loading",
  className,
}: LoaderProps) {
  const reduce = useReducedMotion() ?? false;

  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center text-foreground",
        className,
      )}
    >
      <Helix size={size} speed={speed} reduce={reduce} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
