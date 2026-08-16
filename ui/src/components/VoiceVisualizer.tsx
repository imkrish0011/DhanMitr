"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface VoiceVisualizerProps {
  isRecording: boolean;
  isProcessing?: boolean;
}

export function VoiceVisualizer({ isRecording, isProcessing }: VoiceVisualizerProps) {
  const [bars, setBars] = useState<number[]>([30, 50, 80, 45, 90, 60, 40, 75, 35, 65, 85, 40]);

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map(() => Math.floor(Math.random() * 80) + 15)
      );
    }, 120);
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="flex items-center justify-center gap-1.5 h-24 px-6 py-4 bg-slate-900/90 dark:bg-slate-950 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          animate={{
            height: isRecording ? `${height}px` : "8px",
            opacity: isRecording ? 1 : 0.4,
          }}
          transition={{ duration: 0.15 }}
          className="w-2 rounded-full bg-gradient-to-t from-emerald-500 to-teal-300 shadow-sm shadow-emerald-500/50"
        />
      ))}
    </div>
  );
}
