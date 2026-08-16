"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, ArrowUpRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { sendVoiceQuery } from "@/lib/api";
import { AIParticleOrb, AIOrbState } from "./AIParticleOrb";
import { SpecularButton } from "./ui/SpecularButton";
import { LanguageCode, RURAL_FINANCIAL_TOPICS, RuralTopic } from "@/lib/languages";

interface VoiceAssistantProps {
  language?: LanguageCode;
}

export function VoiceAssistant({ language = "hi" }: VoiceAssistantProps) {
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();
  const [status, setStatus] = useState<AIOrbState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isSpeakingAloud, setIsSpeakingAloud] = useState(false);

  // Stop browser speech synthesis on unmount
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
    
    // Choose appropriate voice/locale
    if (language === "hi" || language === "hinglish") {
      utterance.lang = "hi-IN";
    } else if (language === "mr") {
      utterance.lang = "mr-IN";
    } else if (language === "bn") {
      utterance.lang = "bn-IN";
    } else if (language === "te") {
      utterance.lang = "te-IN";
    } else {
      utterance.lang = "en-IN";
    }

    utterance.rate = 0.95; // Slightly slower for crisp clarity

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
        const res = await sendVoiceQuery({
          audio_base64: audioB64 || undefined,
          text: transcript || (language === "hi" ? "किसान क्रेडिट कार्ड और सरकारी लोन की जानकारी दें" : "Tell me about Kisan Credit Card and interest subsidy"),
        });

        const userQ = res.transcript || (language === "hi" ? "किसान क्रेडिट कार्ड पर ब्याज और लोन नियम क्या हैं?" : "What are the rules for Kisan Credit Card loan?");
        const botReply = res.reply_text || (language === "hi" 
          ? "किसान क्रेडिट कार्ड (KCC) पर सरकार 3% ब्याज छूट देती है। अगर आप समय पर किस्त भरते हैं, तो आपको केवल 4% वार्षिक ब्याज देना होता है। नजदीकी ग्रामीण बैंक या CSC केंद्र से आवेदन किया जा सकता है।"
          : "Kisan Credit Card (KCC) offers a subsidized effective rate of only 4% per annum upon timely repayments. You can apply at any local rural bank or CSC center.");

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

  // Status Labels in selected language
  const statusLabels: Record<AIOrbState, string> = {
    idle: language === "hi" ? "माइक दबाकर बोलें" : language === "hinglish" ? "Mic dabakar bolein" : "Tap & Speak to DhanMITR",
    listening: language === "hi" ? "बोलिए, मैं सुन रहा हूँ..." : language === "hinglish" ? "Boliye, sun raha hoon..." : "Listening to your voice...",
    thinking: language === "hi" ? "जानकारी जांची जा रही है..." : language === "hinglish" ? "Janakari check ho rahi hai..." : "Analyzing financial data...",
    speaking: language === "hi" ? "धनमित्र उत्तर दे रहा है..." : language === "hinglish" ? "DhanMITR jawab de raha hai..." : "DhanMITR is answering...",
  };

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-lg mx-auto px-2 sm:px-4 py-1 sm:py-4 select-none">
      {/* Dynamic Status Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200/90 text-xs font-bold text-slate-800 shadow-sm mb-2 touch-manipulation">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            status === "listening"
              ? "bg-red-500 animate-ping"
              : status === "thinking"
              ? "bg-amber-500 animate-pulse"
              : status === "speaking"
              ? "bg-emerald-500 animate-bounce"
              : "bg-slate-800"
          }`}
        />
        <span>{statusLabels[status]}</span>
      </div>

      {/* 3D Interactive Silver & Black Particle Orb (Optimized for Mobile Screens) */}
      <div className="relative my-2 sm:my-3 flex items-center justify-center">
        <AIParticleOrb
          state={status}
          size={210}
          onClick={handleOrbToggle}
          className="transition-transform active:scale-95 touch-manipulation cursor-pointer"
        />

        {/* Center Mic Overlay Action Button */}
        <button
          type="button"
          onClick={handleOrbToggle}
          className={`absolute w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90 touch-manipulation ${
            isRecording
              ? "bg-red-500 text-white shadow-red-500/40 scale-110"
              : isSpeakingAloud
              ? "bg-emerald-600 text-white shadow-emerald-600/40 animate-pulse"
              : status === "thinking"
              ? "bg-amber-500 text-white shadow-amber-500/40 animate-spin"
              : "bg-white text-slate-900 border-2 border-slate-200 shadow-slate-900/10"
          }`}
        >
          {isRecording ? (
            <MicOff className="w-6 h-6 animate-pulse" />
          ) : isSpeakingAloud ? (
            <Volume2 className="w-6 h-6 animate-bounce" />
          ) : (
            <Mic className="w-6 h-6 text-slate-900" />
          )}
        </button>
      </div>

      {/* Primary Specular Trigger Button (Big Thumb Target) */}
      <div className="w-full px-2 my-2">
        <SpecularButton
          size="lg"
          radius={22}
          tint={isRecording ? "#ef4444" : "#0f172a"}
          tintOpacity={1}
          lineColor={isRecording ? "#ef4444" : "#cbd5e1"}
          textColor="#ffffff"
          baseColor="#334155"
          intensity={1.5}
          onClick={handleOrbToggle}
          className="w-full h-13 sm:h-14 font-extrabold text-sm sm:text-base shadow-md active:scale-[0.97]"
        >
          {isRecording ? (
            <div className="flex items-center gap-2">
              <MicOff className="w-5 h-5 text-red-300" />
              <span>{language === "hi" ? "बात खत्म करें" : language === "hinglish" ? "Bat khatam karein" : "Tap to Finish Speaking"}</span>
            </div>
          ) : isSpeakingAloud ? (
            <div className="flex items-center gap-2">
              <VolumeX className="w-5 h-5 text-emerald-300" />
              <span>{language === "hi" ? "आवाज़ रोकें (Stop Audio)" : "Stop Voice"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-white" />
              <span>{language === "hi" ? "बोलकर पूछें (Tap to Speak)" : language === "hinglish" ? "Bolkar Puchein" : "Ask Anything by Voice"}</span>
            </div>
          )}
        </SpecularButton>
      </div>

      {/* Transcript & Spoken Answer Card */}
      <AnimatePresence>
        {(transcript || response) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full my-2 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-md text-left space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{language === "hi" ? "धनमित्र उत्तर (DhanMITR)" : "DhanMITR Voice Answer"}</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 p-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> <span>{language === "hi" ? "हटाएं" : "Clear"}</span>
              </button>
            </div>

            {transcript && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === "hi" ? "आपका प्रश्न" : "Your Question"}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5">"{transcript}"</p>
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all active:scale-95"
                  >
                    {isSpeakingAloud ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{language === "hi" ? "आवाज़ रोकें" : "Stop Audio"}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{language === "hi" ? "🔊 दोबारा सुनें" : "🔊 Listen Aloud"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1-Tap Quick Rural Topic Cards (Carousel / Grid) */}
      <div className="w-full mt-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {language === "hi" ? "लोकप्रिय विषय (1-Tap Topics)" : language === "hinglish" ? "Zaroori Topics" : "Key Financial Topics"}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">1-Tap Answer</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {RURAL_FINANCIAL_TOPICS.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => handleSelectTopic(topic)}
              className="flex flex-col text-left p-3 rounded-2xl bg-slate-50/90 hover:bg-white border border-slate-200/80 hover:border-slate-400 text-slate-900 transition-all shadow-xs active:scale-[0.97] touch-manipulation group"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xl">{topic.icon}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900" />
              </div>
              <span className="text-xs font-bold leading-tight line-clamp-2">
                {topic.title[language] || topic.title.hi}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;
