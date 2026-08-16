"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Send, 
  ChevronRight, 
  TrendingUp, 
  Film, 
  Shield, 
  Search, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  RotateCcw,
  Landmark,
  Zap,
  Sparkles
} from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { sendVoiceQuery } from "@/lib/api";
import { VoiceWaveOrb, OrbState } from "./VoiceWaveOrb";
import { LanguageCode } from "@/lib/languages";
import { SproutIcon, GoldCoinsIcon, BankVaultIcon, ShieldSecureIcon } from "./Icons";
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
            ? `आपकी अगली देय तिथि ${nextSub ? nextSub.name : "नेटफ्लिक्स"} के लिए ${nextSub ? nextSub.date : "24 अगस्त"} (₹${nextSub ? nextSub.cost : 499}) है। साथ ही ${nextIns ? nextIns.name : "स्टार हेल्थ"} बीमा पॉलिसी ${nextIns ? nextIns.date : "28 अगस्त"} को रिन्यू होनी है। आपकी कुल मासिक बचत ₹${summary ? summary.netSurplus.toLocaleString() : "24,007"} सुरक्षित स्थिति में है।`
            : `Your next renewal is ${nextSub ? nextSub.name : "Netflix"} on ${nextSub ? nextSub.date : "24th Aug"} (₹${nextSub ? nextSub.cost : 499}). Your ${nextIns ? nextIns.name : "Star Health"} policy is due on ${nextIns ? nextIns.date : "28th Aug"}. Your net monthly surplus is ₹${summary ? summary.netSurplus.toLocaleString() : "24,007"}.`;

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

  const handleExecuteQuery = (text: string) => {
    setTranscript(text);
    setStatus("thinking");

    setTimeout(() => {
      let reply = "";
      if (text.includes("KCC") || text.includes("किसान")) {
        reply = language === "hi"
          ? "किसान क्रेडिट कार्ड (KCC) पर 7% सामान्य ब्याज होता है। समय पर भुगतान करने पर सरकार 3% की ब्याज छूट देती है, जिससे शुद्ध ब्याज दर सिर्फ 4% रह जाती है।"
          : "Kisan Credit Card (KCC) offers a 4% subsidized interest rate upon timely repayments on loans up to ₹3 Lakhs.";
      } else if (text.includes("Gold") || text.includes("गोल्ड")) {
        reply = language === "hi"
          ? "साहूकार 24-36% भारी ब्याज लेते हैं, जबकि सरकारी बैंक में गोल्ड लोन सिर्फ 8.5% से 9.5% पर मिल जाता है और सोना सुरक्षित लॉकर में रहता है।"
          : "Bank gold loans charge 8.5-9.5% interest compared to local lenders charging 24-36%, with 100% locker security.";
      } else if (text.includes("RD") || text.includes("बचत")) {
        reply = language === "hi"
          ? "पोस्ट ऑफिस 5-वर्षीय RD पर 6.7% वार्षिक गारंटीड ब्याज मिलता है। ₹500 प्रति माह से शुरू कर सकते हैं।"
          : "Post Office 5-Year Recurring Deposit offers 6.7% guaranteed annual returns starting at ₹500/month.";
      } else if (text.includes("PMSBY") || text.includes("बीमा")) {
        reply = language === "hi"
          ? "प्रधानमंत्री सुरक्षा बीमा योजना (PMSBY) में मात्र ₹20 प्रति वर्ष पर ₹2 लाख का दुर्घटना बीमा मिलता है।"
          : "PMSBY provides ₹2,00,000 accidental death/disability coverage for only ₹20 per year.";
      } else {
        reply = language === "hi"
          ? `आपके खाते में कुल ₹${summary ? summary.netSurplus.toLocaleString() : "24,007"} मासिक बचत उपलब्ध है। आप इसे SIP या लिक्विड फंड में निवेश कर सकते हैं।`
          : `You have ₹${summary ? summary.netSurplus.toLocaleString() : "24,007"} in monthly surplus savings available to invest.`;
      }

      setResponse(reply);
      setStatus("speaking");
      speakTextAloud(reply);
    }, 450);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    handleExecuteQuery(inputVal.trim());
    setInputVal("");
  };

  const quickFilterPills = [
    {
      icon: Search,
      label: language === "hi" ? "मासिक खर्च विश्लेषण" : "Monthly Expenses",
      query: language === "hi" ? "मेरा पूरा मासिक खर्च और बजट ब्रेकडाउन दिखाएं" : "Show my monthly expense breakdown",
    },
    {
      icon: Film,
      label: language === "hi" ? "OTT रिन्युअल व बचत" : "OTT Renewal & Savings",
      query: language === "hi" ? "मेरे कौन से OTT और सब्सक्रिप्शन रिन्यू होने वाले हैं?" : "Which OTT subscriptions are renewing soon?",
    },
    {
      icon: Shield,
      label: language === "hi" ? "बीमा एक्सपायरी" : "Insurance Expiry",
      query: language === "hi" ? "मेरी स्टार हेल्थ बीमा पॉलिसी की एक्सपायरी कब है?" : "When is my health insurance expiring?",
    },
    {
      icon: TrendingUp,
      label: language === "hi" ? "Investments" : "Investments",
      query: language === "hi" ? "मेरी बचत को सही जगह कैसे निवेश करें?" : "Where should I invest my savings surplus?",
    },
  ];

  const smartInsights = [
    {
      id: "kcc",
      title: "Kisan Credit Card & KCC",
      subtitle: "4% interest savings on eligible amount",
      icon: SproutIcon,
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      query: "किसान क्रेडिट कार्ड (KCC) 4% ब्याज योजना नियम क्या हैं?",
    },
    {
      id: "gold",
      title: "Gold Loan vs Bank Loan",
      subtitle: "Compare interest rates & save more",
      icon: GoldCoinsIcon,
      iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
      query: "बैंक गोल्ड लोन और साहूकार कर्ज में क्या अंतर है?",
    },
    {
      id: "rd",
      title: "Post Office RD",
      subtitle: "₹500 monthly | 6.7%* interest rate",
      icon: BankVaultIcon,
      iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
      query: "पोस्ट ऑफिस RD में ₹500 मासिक जमा पर कितना ब्याज मिलता है?",
    },
    {
      id: "pmsby",
      title: "PMSBY Insurance",
      subtitle: "₹20 insurance cover for ₹2 lakh",
      icon: ShieldSecureIcon,
      iconBg: "bg-teal-50 text-teal-600 border border-teal-100",
      query: "प्रधानमंत्री सुरक्षा बीमा योजना (PMSBY) ₹20 में कैसे लें?",
    },
  ];

  const recentActivity = [
    {
      name: "Amazon Prime",
      time: "Today • Subscription",
      amount: "₹1,499",
      icon: Film,
      iconColor: "text-red-500 bg-red-50",
    },
    {
      name: "SBI Bank",
      time: "Yesterday • Salary Credit",
      amount: "+₹24,000",
      icon: Landmark,
      iconColor: "text-emerald-600 bg-emerald-50",
    },
    {
      name: "Electricity Bill",
      time: "2 days ago • Bills",
      amount: "₹1,240",
      icon: Zap,
      iconColor: "text-amber-500 bg-amber-50",
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center space-y-4 pb-6 animate-in fade-in duration-200">
      {/* 1. Hero Greeting */}
      <div className="text-center space-y-1 pt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center gap-2">
          <span>Namaste, {profile ? profile.name.split(" ")[0] : "Rahul"}!</span>
          <span className="text-xl">✨</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          I&apos;m your AI finance companion. Ask me anything about your money.
        </p>
      </div>

      {/* 2. Audio Waveform Sphere Orb Visualizer */}
      <div className="relative my-2 flex flex-col items-center justify-center">
        <VoiceWaveOrb
          state={status}
          size={210}
          onClick={handleOrbToggle}
        />

        {/* Status indicator badge under orb */}
        <button
          type="button"
          onClick={handleOrbToggle}
          className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 transition-all active:scale-95 touch-manipulation"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              status === "listening"
                ? "bg-red-400 animate-ping"
                : status === "speaking"
                ? "bg-emerald-400 animate-bounce"
                : status === "thinking"
                ? "bg-amber-400 animate-pulse"
                : "bg-emerald-400"
            }`}
          />
          <span>
            {status === "listening"
              ? "Listening..."
              : status === "speaking"
              ? "Speaking..."
              : status === "thinking"
              ? "Analyzing..."
              : "Tap to Speak"}
          </span>
        </button>
      </div>

      {/* Spoken Answer Modal Card */}
      <AnimatePresence>
        {(transcript || response) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-left space-y-2.5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>DhanMITR Advisory</span>
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
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Query</span>
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                  >
                    {isSpeakingAloud ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-slate-600" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Input Bar with Integrated Green Circular Mic Button & Send */}
      <form
        onSubmit={handleInputSubmit}
        className="w-full relative flex items-center bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-2xs hover:border-slate-300 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask anything about your finances..."
          className="flex-1 h-11 pl-3.5 pr-20 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          {/* Circular Green Mic Button */}
          <button
            type="button"
            onClick={handleOrbToggle}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 touch-manipulation ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs"
            }`}
            title="Speak Question"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* 4. Horizontal Quick Filter Category Pills */}
      <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {quickFilterPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleExecuteQuery(pill.query)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex-shrink-0 transition-all active:scale-95 shadow-2xs"
          >
            <pill.icon className="w-3.5 h-3.5 text-emerald-600" />
            <span>{pill.label}</span>
          </button>
        ))}
      </div>

      {/* 5. Smart Insights for You Section (2x2 Grid) */}
      <div className="w-full space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Smart Insights for You
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {smartInsights.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => handleExecuteQuery(card.query)}
              className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 text-left flex items-center justify-between transition-all shadow-2xs active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                  <card.icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    {card.subtitle}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 transition-colors flex-shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>

      {/* 6. Recent Activity Section */}
      <div className="w-full space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Recent Activity
          </h2>
        </div>

        <div className="space-y-2">
          {recentActivity.map((act, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${act.iconColor}`}>
                  <act.icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{act.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{act.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm font-extrabold ${act.amount.startsWith("+") ? "text-emerald-700" : "text-slate-900"}`}>
                  {act.amount}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;
