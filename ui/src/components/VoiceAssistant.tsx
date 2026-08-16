"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, Sparkles, ArrowUpRight, RotateCcw, ShieldCheck } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { sendVoiceQuery } from "@/lib/api";
import { AIParticleOrb, AIOrbState } from "./AIParticleOrb";
import { SpecularButton } from "./ui/SpecularButton";

const QUICK_PROMPTS = [
  "How much emergency fund should I keep for 6 months?",
  "Should I choose Old or New Tax Regime for 15 LPA salary?",
  "How to split ₹30,000 monthly SIP between index and flexicap funds?",
  "What is the 50/30/20 personal budgeting rule?",
];

export function VoiceAssistant() {
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();
  const [status, setStatus] = useState<AIOrbState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [response, setResponse] = useState<string>("");

  const handleOrbToggle = async () => {
    if (isRecording) {
      setStatus("thinking");
      const audioB64 = await stopRecording();

      try {
        const res = await sendVoiceQuery({
          audio_base64: audioB64 || undefined,
          text: transcript || "What is my emergency fund target and current savings rate?",
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
      const res = await sendVoiceQuery({ text: promptText });
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
    <div className="flex flex-col items-center justify-center max-w-xl mx-auto w-full px-2 sm:px-4 py-2 sm:py-6">
      {/* Voice Status Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] sm:text-xs font-semibold text-slate-700 shadow-2xs mb-4">
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
        {status === "idle" && "Tap 3D Sphere to Speak"}
        {status === "listening" && "Listening to your voice..."}
        {status === "thinking" && "Analyzing with AI intelligence..."}
        {status === "speaking" && "Speaking response..."}
      </div>

      {/* 3D Interactive AI Particle Orb (ChatGPT / Gemini style) */}
      <div className="relative my-2 sm:my-4 flex items-center justify-center">
        <AIParticleOrb
          state={status}
          size={270}
          onClick={handleOrbToggle}
          className="transition-transform active:scale-95 touch-manipulation"
        />

        {/* Center Mic Icon Overlay Badge */}
        <div
          onClick={handleOrbToggle}
          className={`absolute pointer-events-none w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
            isRecording
              ? "bg-red-500 text-white shadow-red-500/30 scale-110"
              : status === "speaking"
              ? "bg-teal-600 text-white shadow-teal-500/30"
              : "bg-white/90 text-emerald-700 backdrop-blur-md border border-emerald-200 shadow-emerald-500/10"
          }`}
        >
          {isRecording ? (
            <MicOff className="w-6 h-6 animate-pulse" />
          ) : status === "speaking" ? (
            <Volume2 className="w-6 h-6 animate-bounce" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </div>
      </div>

      {/* Primary Specular Trigger Button */}
      <div className="mt-2 mb-4">
        <SpecularButton
          size="md"
          radius={20}
          tint={isRecording ? "#ef4444" : "#10b981"}
          tintOpacity={0.08}
          lineColor={isRecording ? "#ef4444" : "#10b981"}
          textColor={isRecording ? "#dc2626" : "#047857"}
          baseColor="#e2e8f0"
          intensity={1.4}
          onClick={handleOrbToggle}
          className="shadow-sm font-semibold"
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4 text-red-500" />
              <span>Tap to Finish Speaking</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-emerald-600" />
              <span>Start Voice Conversation</span>
            </>
          )}
        </SpecularButton>
      </div>

      {/* Transcript & Response Area */}
      <AnimatePresence>
        {(transcript || response) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full mt-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.03)] text-left space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Voice Output
              </span>
              <button
                onClick={handleReset}
                className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors p-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            </div>

            {transcript && (
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">You asked</span>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5">"{transcript}"</p>
              </div>
            )}

            {response && (
              <div className="pt-2 border-t border-slate-50">
                <span className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" /> DhanMITR Guidance
                </span>
                <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">{response}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Suggested Voice Prompts */}
      <div className="w-full mt-6 sm:mt-8">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
          Suggested Financial Topics
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPrompt(prompt)}
              className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-left text-xs font-medium text-slate-700 transition-all hover:border-emerald-500/40 hover:shadow-2xs active:scale-[0.98] group touch-manipulation"
            >
              <span className="line-clamp-2 pr-1">{prompt}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;
