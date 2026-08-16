"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, Sparkles, AudioWaveform, ArrowUpRight, RotateCcw } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { sendVoiceQuery } from "@/lib/api";

const QUICK_PROMPTS = [
  "How much emergency fund should I keep for 6 months?",
  "Should I choose Old or New Tax Regime for 15 LPA salary?",
  "How should I split ₹30,000 monthly SIP between index and flexicap funds?",
  "What is the 50/30/20 personal budgeting rule?",
];

export function VoiceAssistant() {
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState("Maya (Financial Advisor)");

  const handleMicClick = async () => {
    if (isRecording) {
      setStatus("thinking");
      const audioB64 = await stopRecording();
      
      try {
        const res = await sendVoiceQuery({
          audio_base64: audioB64 || undefined,
          text: transcript || "What is my emergency fund target and current savings rate?",
          voice_id: selectedVoice,
        });

        setTranscript(res.transcript || "How should I structure my emergency fund for 6 months?");
        setResponse(
          res.reply_text ||
            "Your target 6-month emergency fund should cover mandatory living expenses—typically around ₹3.6 Lakhs. We recommend allocating 70% in high-yield liquid funds and 30% in sweep-in bank deposits for instant liquidity."
        );
        setStatus("speaking");
      } catch (err) {
        console.error(err);
        setStatus("idle");
      }
    } else {
      setTranscript("");
      setResponse("");
      setStatus("listening");
      await startRecording();
    }
  };

  const handleSelectPrompt = async (promptText: string) => {
    setTranscript(promptText);
    setStatus("thinking");
    try {
      const res = await sendVoiceQuery({ text: promptText, voice_id: selectedVoice });
      setResponse(
        res.reply_text ||
          `Based on your query: "${promptText}", under the New Tax Regime with standard deductions, you can save significant tax without locking funds into 80C instruments.`
      );
      setStatus("speaking");
    } catch (e) {
      setStatus("idle");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setTranscript("");
    setResponse("");
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto w-full py-6">
      {/* Voice Status Pill */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-sm mb-8">
        <span
          className={`h-2 w-2 rounded-full ${
            status === "listening"
              ? "bg-red-500 animate-ping"
              : status === "thinking"
              ? "bg-amber-500 animate-pulse"
              : status === "speaking"
              ? "bg-emerald-500 animate-bounce"
              : "bg-emerald-500"
          }`}
        />
        {status === "idle" && "Ready to Listen"}
        {status === "listening" && "Listening to your voice..."}
        {status === "thinking" && "Analyzing financial intelligence..."}
        {status === "speaking" && "Speaking response"}
      </div>

      {/* Center Interactive Glowing Audio Orb */}
      <div className="relative flex items-center justify-center my-6">
        {/* Animated Outer Rings */}
        {isRecording && (
          <>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.05, 0.3] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute w-56 h-56 rounded-full bg-emerald-500/20 pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute w-44 h-44 rounded-full bg-emerald-500/30 pointer-events-none"
            />
          </>
        )}

        {status === "speaking" && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="absolute w-48 h-48 rounded-full bg-teal-400/20 pointer-events-none"
          />
        )}

        {/* Main Microphone Button */}
        <button
          onClick={handleMicClick}
          className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 scale-105"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:scale-105"
          }`}
          aria-label="Voice input trigger"
        >
          {isRecording ? (
            <MicOff className="w-11 h-11 transition-transform" />
          ) : (
            <Mic className="w-11 h-11 transition-transform" />
          )}
        </button>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-2">
        {isRecording ? "Tap to finish speaking" : "Tap microphone to talk"}
      </p>

      {/* Voice Waveform Activity Indicator */}
      <div className="flex items-center justify-center gap-1.5 h-10 my-4">
        {[40, 70, 95, 60, 85, 45, 80, 50, 65, 30].map((h, i) => (
          <motion.div
            key={i}
            animate={{
              height: isRecording || status === "speaking" ? `${Math.max(8, h * 0.35)}px` : "6px",
              opacity: isRecording || status === "speaking" ? 1 : 0.25,
            }}
            transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 }}
            className="w-1.5 rounded-full bg-emerald-600"
          />
        ))}
      </div>

      {/* Transcript & Response Area */}
      <AnimatePresence>
        {(transcript || response) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="w-full mt-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-[0_10px_30px_rgb(0,0,0,0.03)] text-left space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Voice Conversation
              </span>
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
            </div>

            {transcript && (
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">You</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">"{transcript}"</p>
              </div>
            )}

            {response && (
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase text-emerald-600 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" /> DhanMITR
                </span>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">{response}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Suggested Voice Prompts */}
      <div className="w-full mt-8">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
          Suggested Financial Questions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPrompt(prompt)}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-left text-xs font-medium text-slate-700 transition-all hover:border-emerald-500/40 hover:shadow-sm group"
            >
              <span className="line-clamp-2">{prompt}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 flex-shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
