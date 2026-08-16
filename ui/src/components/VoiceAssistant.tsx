"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { sendVoiceQuery } from "@/lib/api";
import { AIParticleOrb, AIOrbState } from "./AIParticleOrb";
import { SpecularButton } from "./ui/SpecularButton";
import { LanguageCode, RURAL_FINANCIAL_TOPICS, RuralTopic } from "@/lib/languages";
import { SproutIcon, GoldCoinsIcon, BankVaultIcon, ShieldSecureIcon } from "./Icons";
import { UserFinancialProfile, calculateFinancialSummary } from "@/lib/userProfile";

interface VoiceAssistantProps {
  language?: LanguageCode;
  profile?: UserFinancialProfile;
}

export function VoiceAssistant({ language = "hi", profile }: VoiceAssistantProps) {
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();
  const [status, setStatus] = useState<AIOrbState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isSpeakingAloud, setIsSpeakingAloud] = useState(false);

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
    utterance.onerror = () => {
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

    if (isRecording) {
      setStatus("thinking");
      const audioB64 = await stopRecording();

      try {
        const nextSub = summary?.upcomingRenewals.find((r) => r.type === "subscription");
        const nextIns = summary?.upcomingRenewals.find((r) => r.type === "insurance");

        const userQ =
          transcript ||
          (language === "hi"
            ? "मेरी आगामी बीमा और OTT सब्सक्रिप्शन की रिन्युअल तारीखें क्या हैं?"
            : "What are my upcoming insurance and subscription renewals?");

        const botReply =
          language === "hi"
            ? `आपकी अगली देय तिथि ${nextSub ? nextSub.name : "नेटफ्लिक्स"} के लिए ${nextSub ? nextSub.date : "24 अगस्त"} (₹${nextSub ? nextSub.cost : 499}) है। साथ ही आपकी ${nextIns ? nextIns.name : "स्टार हेल्थ"} पॉलिसी ${nextIns ? nextIns.date : "28 अगस्त"} को रिन्यू होनी है। आपकी कुल मासिक बचत ₹${summary ? summary.netSurplus.toLocaleString() : "29,000"} बहुत सुरक्षित स्थिति में है।`
            : `Your next upcoming renewal is ${nextSub ? nextSub.name : "Netflix"} on ${nextSub ? nextSub.date : "24th Aug"} (₹${nextSub ? nextSub.cost : 499}). Additionally, your ${nextIns ? nextIns.name : "Star Health"} policy is due on ${nextIns ? nextIns.date : "28th Aug"}. Your current monthly savings surplus is ₹${summary ? summary.netSurplus.toLocaleString() : "29,000"}.`;

        setTranscript(userQ);
        setResponse(botReply);
        setStatus("speaking");
        speakTextAloud(botReply);
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

  const handleSelectTopic = (topic: RuralTopic) => {
    const queryText = topic.query[language] || topic.query.hi;
    const answerText = topic.sampleAnswer[language] || topic.sampleAnswer.hi;

    setTranscript(queryText);
    setStatus("thinking");

    setTimeout(() => {
      setResponse(answerText);
      setStatus("speaking");
      speakTextAloud(answerText);
    }, 400);
  };

  const handleReset = () => {
    stopSpeakingAloud();
    setStatus("idle");
    setTranscript("");
    setResponse("");
  };

  const renderTopicIcon = (type: RuralTopic["iconType"]) => {
    switch (type) {
      case "agriculture":
        return <SproutIcon className="w-4 h-4 text-emerald-700" />;
      case "gold_loan":
        return <GoldCoinsIcon className="w-4 h-4 text-amber-700" />;
      case "savings":
        return <BankVaultIcon className="w-4 h-4 text-slate-800" />;
      case "insurance":
        return <ShieldSecureIcon className="w-4 h-4 text-teal-700" />;
    }
  };

  const statusLabels: Record<AIOrbState, string> = {
    idle: language === "hi" ? "माइक दबाकर बोलें" : "Tap to Speak",
    listening: language === "hi" ? "सुन रहा हूँ..." : "Listening...",
    thinking: language === "hi" ? "विश्लेषण जारी है..." : "Processing...",
    speaking: language === "hi" ? "धनमित्र बोल रहा है..." : "DhanMITR Speaking...",
  };

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-lg mx-auto px-2 sm:px-4 py-1 select-none">
      {/* Dynamic Status Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs mb-2">
        <span
          className={`h-2 w-2 rounded-full ${
            status === "listening"
              ? "bg-red-500 animate-ping"
              : status === "thinking"
              ? "bg-amber-500 animate-pulse"
              : status === "speaking"
              ? "bg-emerald-500 animate-bounce"
              : "bg-slate-700"
          }`}
        />
        <span>{statusLabels[status]}</span>
      </div>

      {/* 3D Interactive Silver & Black Particle Orb */}
      <div className="relative my-2 flex items-center justify-center">
        <AIParticleOrb
          state={status}
          size={200}
          onClick={handleOrbToggle}
          className="transition-transform active:scale-95 touch-manipulation cursor-pointer"
        />

        {/* Center Mic Overlay Action Button */}
        <button
          type="button"
          onClick={handleOrbToggle}
          className={`absolute w-13 h-13 rounded-full flex items-center justify-center transition-all duration-200 shadow-md active:scale-90 touch-manipulation ${
            isRecording
              ? "bg-red-500 text-white shadow-red-500/30 scale-105"
              : isSpeakingAloud
              ? "bg-emerald-600 text-white shadow-emerald-600/30"
              : status === "thinking"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-900 border border-slate-200"
          }`}
        >
          {isRecording ? (
            <MicOff className="w-5 h-5 animate-pulse" />
          ) : isSpeakingAloud ? (
            <Volume2 className="w-5 h-5 animate-bounce" />
          ) : (
            <Mic className="w-5 h-5 text-slate-900" />
          )}
        </button>
      </div>

      {/* Primary Specular Trigger Button */}
      <div className="w-full px-2 my-2">
        <SpecularButton
          size="lg"
          radius={18}
          tint={isRecording ? "#ef4444" : "#0f172a"}
          tintOpacity={1}
          lineColor={isRecording ? "#ef4444" : "#94a3b8"}
          textColor="#ffffff"
          baseColor="#334155"
          intensity={1.4}
          onClick={handleOrbToggle}
          className="w-full h-13 font-bold text-sm shadow-sm active:scale-[0.98]"
        >
          {isRecording ? (
            <div className="flex items-center gap-2">
              <MicOff className="w-4 h-4 text-red-300" />
              <span>{language === "hi" ? "बात समाप्त करें" : "Finish Speaking"}</span>
            </div>
          ) : isSpeakingAloud ? (
            <div className="flex items-center gap-2">
              <VolumeX className="w-4 h-4 text-emerald-300" />
              <span>{language === "hi" ? "आवाज़ रोकें" : "Stop Audio"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-white" />
              <span>{language === "hi" ? "बोलकर पूछें" : "Ask by Voice"}</span>
            </div>
          )}
        </SpecularButton>
      </div>

      {/* Transcript & Spoken Answer Card */}
      <AnimatePresence>
        {(transcript || response) && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            className="w-full my-2 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-left space-y-2.5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === "hi" ? "धनमित्र व्यक्तिगत उत्तर" : "DhanMITR Advisory"}</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-800 flex items-center gap-1 p-1"
              >
                <RotateCcw className="w-3 h-3" /> <span>{language === "hi" ? "हटाएं" : "Clear"}</span>
              </button>
            </div>

            {transcript && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === "hi" ? "आपका प्रश्न" : "Your Question"}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5">&quot;{transcript}&quot;</p>
              </div>
            )}

            {response && (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {response}
                </p>

                {/* Read aloud button */}
                <div className="pt-1 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => (isSpeakingAloud ? stopSpeakingAloud() : speakTextAloud(response))}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all active:scale-95"
                  >
                    {isSpeakingAloud ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-slate-600" />
                        <span>{language === "hi" ? "रोकें" : "Stop"}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>{language === "hi" ? "सुनें" : "Listen"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Professional Financial Topic Cards */}
      <div className="w-full mt-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {language === "hi" ? "वित्तीय विषय" : "Financial Topics"}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {language === "hi" ? "त्वरित उत्तर" : "Quick Answers"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {RURAL_FINANCIAL_TOPICS.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => handleSelectTopic(topic)}
              className="flex flex-col text-left p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-900 transition-all shadow-2xs active:scale-[0.98] touch-manipulation group"
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                  {renderTopicIcon(topic.iconType)}
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
              <span className="text-xs font-bold leading-tight line-clamp-1 text-slate-900">
                {topic.title[language] || topic.title.hi}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight line-clamp-1 mt-0.5 font-medium">
                {topic.subtitle[language] || topic.subtitle.hi}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;
