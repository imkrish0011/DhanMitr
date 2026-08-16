"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Send,
  Square,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Shield,
  Search,
  MessageSquare
} from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { VoiceWaveOrb, OrbState } from "./VoiceWaveOrb";
import { LanguageCode } from "@/lib/languages";
import { UserFinancialProfile, calculateFinancialSummary } from "@/lib/userProfile";

interface VoiceAssistantProps {
  language?: LanguageCode;
  profile?: UserFinancialProfile;
  onSendQuery?: (q: string) => void;
}

export function VoiceAssistant({ language = "hi", profile, onSendQuery }: VoiceAssistantProps) {
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();
  const [status, setStatus] = useState<OrbState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isSpeakingAloud, setIsSpeakingAloud] = useState(false);
  const [inputVal, setInputVal] = useState("");

  const summary = profile ? calculateFinancialSummary(profile) : null;

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakTextAloud = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsSpeakingAloud(true);
      setStatus("speaking");
    };
    utterance.onend = () => {
      setIsSpeakingAloud(false);
      setStatus("idle");
    };
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      setIsSpeakingAloud(false);
      setStatus("idle");
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeakingAloud = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingAloud(false);
      setStatus("idle");
    }
  };

  const handleOrbToggle = async () => {
    if (isSpeakingAloud) {
      stopSpeakingAloud();
      return;
    }

    if (isRecording || status === "listening") {
      setStatus("thinking");
      await stopRecording();

      setTimeout(() => {
        const nextSub = summary?.upcomingRenewals.find((r) => r.type === "subscription");
        const nextIns = summary?.upcomingRenewals.find((r) => r.type === "insurance");

        const userQ =
          transcript ||
          (language === "hi"
            ? "मेरी आगामी बीमा और OTT सब्सक्रिप्शन की रिन्युअल तारीखें क्या हैं?"
            : "What are my upcoming insurance and subscription renewals?");

        const botReply =
          language === "hi"
            ? `आपकी अगली देय तिथि ${nextSub ? nextSub.name : "नेटफ्लिक्स"} के लिए ${nextSub ? nextSub.date : "24 अगस्त"} (₹${nextSub ? nextSub.cost : 499}) है। साथ ही ${nextIns ? nextIns.name : "स्टार हेल्थ"} बीमा पॉलिसी ${nextIns ? nextIns.date : "28 अगस्त"} को रिन्यू होनी है। आपकी कुल मासिक बचत ₹${summary ? summary.netSurplus.toLocaleString() : "24,007"} सुरक्षित स्थिति में है।`
            : `Your next renewal is ${nextSub ? nextSub.name : "Netflix"} on ${nextSub ? nextSub.date : "24th Aug"} (₹${nextSub ? nextSub.cost : 499}). Your ${nextIns ? nextIns.name : "Star Health"} policy is due on ${nextIns ? nextIns.date : "28th Aug"}. Your net monthly surplus is ₹${summary ? summary.netSurplus.toLocaleString() : "24,007"}.`;

        setTranscript(userQ);
        setResponse(botReply);
        setStatus("speaking");
        speakTextAloud(botReply);
      }, 1200);
    } else {
      setTranscript("");
      setResponse("");
      setStatus("listening");
      await startRecording();
    }
  };

  const handleExecutePrompt = (promptText: string) => {
    setTranscript(promptText);
    setStatus("thinking");

    setTimeout(() => {
      let reply = "";
      const lower = promptText.toLowerCase();

      if (lower.includes("save") || lower.includes("बचत")) {
        reply = language === "hi"
          ? `आपकी मासिक आय ₹${profile?.monthlyIncome.toLocaleString()} में से ₹${summary?.netSurplus.toLocaleString()} (${summary?.savingsRate}%) की बचत होती है। आप इसे 6-महीने के इमरजेंसी फंड और लो-कॉस्ट इंडेक्स फंड SIP में लगाकर अपनी बचत को तेजी से बढ़ा सकते हैं।`
          : `Out of your ₹${profile?.monthlyIncome.toLocaleString()} monthly income, you save ₹${summary?.netSurplus.toLocaleString()} (${summary?.savingsRate}%). We recommend directing 60% of this surplus into Index SIPs after establishing a 6-month safety buffer.`;
      } else if (lower.includes("expense") || lower.includes("खर्च")) {
        reply = language === "hi"
          ? `आपके सबसे बड़े खर्च: मकान किराया व बिजली (₹${profile?.rentUtilities.toLocaleString()}) और राशन/भोजन (₹${profile?.foodGroceries.toLocaleString()}) हैं। कुल मासिक खर्च ₹${summary?.totalOutflow.toLocaleString()} है।`
          : `Your highest expenses are Housing & Utilities (₹${profile?.rentUtilities.toLocaleString()}) and Groceries (₹${profile?.foodGroceries.toLocaleString()}). Total monthly outflow is ₹${summary?.totalOutflow.toLocaleString()}.`;
      } else if (lower.includes("subscription") || lower.includes("ott")) {
        reply = language === "hi"
          ? `आपके पास ${profile?.subscriptions.length} सक्रिय OTT व सब्सक्रिप्शन हैं, जिनकी मासिक लागत ₹${summary?.monthlySubCost} है। अगली रिन्युअल 24 अगस्त (नेटफ्लिक्स ₹499) को है।`
          : `You have ${profile?.subscriptions.length} active subscriptions costing ₹${summary?.monthlySubCost}/month. Next renewal: Netflix on 24th Aug (₹499).`;
      } else {
        reply = language === "hi"
          ? `आपकी ₹${summary?.netSurplus.toLocaleString()} मासिक बचत के लिए उपयुक्त पोर्टफोलियो: 60% लार्जकैप इंडेक्स फंड, 25% पोस्ट ऑफिस RD (6.7% ब्याज), और 15% गोल्ड या लिक्विड फंड।`
          : `Recommended allocation for your ₹${summary?.netSurplus.toLocaleString()} monthly surplus: 60% Large Cap Index SIPs, 25% Guaranteed RD (6.7%), and 15% Emergency Liquid buffer.`;
      }

      setResponse(reply);
      setStatus("speaking");
      speakTextAloud(reply);
    }, 1100);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    handleExecutePrompt(inputVal.trim());
    setInputVal("");
  };

  const suggestedPrompts = [
    {
      label: language === "hi" ? "मैं और ज्यादा बचत कैसे कर सकता हूँ?" : "How can I save more?",
      query: "How can I save more from my monthly income?",
    },
    {
      label: language === "hi" ? "मेरे सबसे बड़े खर्चे दिखाएं" : "Show my biggest expenses",
      query: "Show my biggest monthly expenses breakdown",
    },
    {
      label: language === "hi" ? "मेरे OTT और सब्सक्रिप्शन दिखाएं" : "Review my subscriptions",
      query: "Review my subscriptions and upcoming renewals",
    },
    {
      label: language === "hi" ? "मेरे निवेश के लिए सुझाव दें" : "Plan my investments",
      query: "Plan my investments based on my surplus",
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-between min-h-[calc(100dvh-170px)] py-3 px-2 animate-in fade-in duration-200">
      {/* 1. Header Text Status (Matching Design) */}
      <div className="text-center space-y-1.5 pt-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center gap-2">
          {status === "listening" ? (
            <span>I&apos;m listening...</span>
          ) : status === "thinking" ? (
            <span className="flex items-center gap-2">
              <span>Processing...</span>
              <Sparkles className="w-5 h-5 text-emerald-500 animate-spin" />
            </span>
          ) : status === "speaking" ? (
            <span>DhanMITR Speaking</span>
          ) : (
            <span>Tap to speak</span>
          )}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {status === "listening"
            ? "Speak naturally about your finances"
            : status === "thinking"
            ? "DhanMITR is analyzing your financial profile"
            : "Speak naturally about your finances"}
        </p>
      </div>

      {/* 2. Visualizer Orb (Equalizer Orb & Constellation Star) */}
      <div className="relative my-6 flex flex-col items-center justify-center">
        <VoiceWaveOrb
          state={status}
          size={270}
          onClick={handleOrbToggle}
        />

        {/* Tap to stop / speak button under orb (Matching Design) */}
        {status === "listening" ? (
          <button
            type="button"
            onClick={handleOrbToggle}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 touch-manipulation"
          >
            <Square className="w-3.5 h-3.5 text-red-400 fill-red-400" />
            <span>Tap to stop</span>
          </button>
        ) : status === "thinking" ? (
          <div className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Synthesizing Advice...</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleOrbToggle}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 touch-manipulation"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tap to speak</span>
          </button>
        )}
      </div>

      {/* Spoken Answer Dialog Card */}
      <AnimatePresence>
        {(transcript || response) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-left space-y-2.5 my-2"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI Voice Advisory</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopSpeakingAloud();
                  setTranscript("");
                  setResponse("");
                }}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            </div>

            {transcript && (
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Query</span>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5">&quot;{transcript}&quot;</p>
              </div>
            )}

            {response && (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {response}
                </p>
                <div className="pt-1 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => (isSpeakingAloud ? stopSpeakingAloud() : speakTextAloud(response))}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                  >
                    {isSpeakingAloud ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-slate-600" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Listen Again</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Bottom Section: Suggested Prompts + Input Bar (Matching Reference Image) */}
      <div className="w-full space-y-3 pt-2">
        {/* Suggested Prompts Header & Scrollable Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            Suggested Prompts
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleExecutePrompt(p.query)}
                className="px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap transition-all active:scale-95 shadow-2xs"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleInputSubmit}
          className="w-full relative flex items-center bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-2xs hover:border-slate-300 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Or type your question..."
            className="flex-1 h-11 pl-3.5 pr-20 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleOrbToggle}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 touch-manipulation ${
                status === "listening"
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
              title="Speak"
            >
              {status === "listening" ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VoiceAssistant;
