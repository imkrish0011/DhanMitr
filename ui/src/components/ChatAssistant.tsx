"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Paperclip, 
  Mic, 
  MicOff, 
  Search, 
  Film, 
  Shield, 
  TrendingUp, 
  Check, 
  BrainCircuit, 
  ChevronDown 
} from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { sendChatMessage } from "@/lib/api";
import { LanguageCode } from "@/lib/languages";
import { UserFinancialProfile, calculateFinancialSummary } from "@/lib/userProfile";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  suggestions?: string[];
}

interface ChatAssistantProps {
  language?: LanguageCode;
  profile?: UserFinancialProfile;
}

export function ChatAssistant({ language = "hi", profile }: ChatAssistantProps) {
  const summary = profile ? calculateFinancialSummary(profile) : null;
  const userName = profile ? profile.name.split(" ")[0] : "Rahul";

  const defaultWelcome =
    language === "hi"
      ? `नमस्ते ${userName}! मैं DhanMITR हूँ — आपका AI वित्तीय साथी। आपकी मासिक आय ₹${profile ? profile.monthlyIncome.toLocaleString() : "65,000"} और बचत ₹${summary ? summary.netSurplus.toLocaleString() : "24,007"} के आधार पर कुछ सुझाव ये रहे।`
      : `Hello ${userName}! I am DhanMITR — your AI financial companion. Grounded in your monthly income of ₹${profile ? profile.monthlyIncome.toLocaleString() : "65,000"} and surplus of ₹${summary ? summary.netSurplus.toLocaleString() : "24,007"}.`;

  const defaultQuestions =
    language === "hi"
      ? [
          "मेरे कौन से OTT और सब्सक्रिप्शन रिन्यू होने वाले हैं?",
          `₹${summary ? summary.netSurplus.toLocaleString() : "24,007"} की बचत कहाँ निवेश करें?`,
          "मेरे स्टार हेल्थ बीमा पॉलिसी की एक्सपायरी कब है?",
        ]
      : [
          "Which subscriptions are renewing soon?",
          `Where should I invest my ₹${summary ? summary.netSurplus.toLocaleString() : "24,007"} surplus?`,
          "When does my Star Health insurance expire?",
        ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "w1", sender: "bot", text: defaultWelcome, suggestions: defaultQuestions },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState<number>(0);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (id: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\*\*/g, ""));
    u.lang = language === "hi" ? "hi-IN" : "en-IN";
    u.rate = 0.95;
    u.onstart = () => setSpeakingId(id);
    u.onend = () => setSpeakingId(null);
    u.onerror = (event: SpeechSynthesisErrorEvent) => {
      setSpeakingId(null);
    };
    window.speechSynthesis.speak(u);
  };

  const copyText = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const toggleFeedback = (id: string, isLike: boolean) => {
    setLikedMap((prev) => ({ ...prev, [id]: isLike }));
  };

  const handleSend = async (text?: string) => {
    const q = text || input;
    if (!q.trim() || loading) return;
    setMessages((m) => [...m, { id: "u" + Date.now(), sender: "user", text: q }]);
    setInput("");
    setLoading(true);
    setThinkingStep(1);

    setTimeout(() => setThinkingStep(2), 350);

    try {
      setTimeout(() => setThinkingStep(3), 700);

      let replyText = "";
      const lower = q.toLowerCase();

      if (profile && (lower.includes("subscription") || lower.includes("ott") || lower.includes("सब्सक्रिप्शन") || lower.includes("रिन्यू") || lower.includes("cancel"))) {
        const nextSub = summary?.upcomingRenewals.find((r) => r.type === "subscription");
        replyText =
          language === "hi"
            ? `आपके पास कुल ${profile.subscriptions.length} एक्टिव OTT सब्सक्रिप्शन हैं (मासिक लागत: ₹${summary?.monthlySubCost})। सबसे पहले ${nextSub ? nextSub.name : "नेटफ्लिक्स"} का रिन्युअल ${nextSub ? nextSub.date : "24 अगस्त"} (₹${nextSub ? nextSub.cost : 499}) को देय है। यदि आप अप्रयुक्त प्लेटफॉर्म पॉज करते हैं तो सालाना ₹3,500+ की सीधी बचत होगी।`
            : `You have ${profile.subscriptions.length} active subscriptions totaling ₹${summary?.monthlySubCost}/month. Next renewal: ${nextSub ? nextSub.name : "Netflix"} on ${nextSub ? nextSub.date : "24th Aug"} (₹${nextSub ? nextSub.cost : 499}). Rotating unused services can save ₹3,500+ annually.`;
      } else if (profile && (lower.includes("insurance") || lower.includes("बीमा") || lower.includes("health") || lower.includes("पॉलिसी") || lower.includes("expiry"))) {
        const expIns = profile.insurances.find((i) => i.status === "expiring_soon") || profile.insurances[0];
        replyText =
          language === "hi"
            ? `आपकी ${expIns.name} पॉलिसी (प्रीमियम: ₹${expIns.amount.toLocaleString()}) की एक्सपायरी तिथि ${expIns.expiryDate} है। नो-क्लेम डिस्काउंट और कवरेज को जारी रखने के लिए समय पर रिन्यू करें।`
            : `Your ${expIns.name} policy (premium: ₹${expIns.amount.toLocaleString()}) expires on ${expIns.expiryDate}. Please renew before expiry to protect no-claim benefits.`;
      } else if (profile && (lower.includes("save") || lower.includes("बचत") || lower.includes("invest") || lower.includes("sip") || lower.includes("निवेश") || lower.includes("emergency"))) {
        const sipAmount = Math.round((summary?.netSurplus || 20000) * 0.6);
        const emergencyReserve = Math.round((summary?.totalOutflow || 30000) * 6);
        replyText =
          language === "hi"
            ? `आपकी मासिक बचत ₹${summary?.netSurplus.toLocaleString()} है। आपके मासिक खर्च (₹${summary?.totalOutflow.toLocaleString()}) के आधार पर 6-महीने का इमरजेंसी फंड लक्ष्य ₹${emergencyReserve.toLocaleString()} है। बचत में से ₹${sipAmount.toLocaleString()} निफ्टी 50 इंडेक्स फंड SIP में लगाएं।`
            : `Your monthly surplus is ₹${summary?.netSurplus.toLocaleString()}. Based on outflow of ₹${summary?.totalOutflow.toLocaleString()}, your 6-month safety buffer is ₹${emergencyReserve.toLocaleString()}. We suggest allocating ₹${sipAmount.toLocaleString()}/mo into low-cost Index SIPs.`;
      } else if (profile && (lower.includes("expense") || lower.includes("खर्च") || lower.includes("outflow") || lower.includes("budget"))) {
        replyText =
          language === "hi"
            ? `कुल मासिक खर्च: ₹${summary?.totalOutflow.toLocaleString()} (राशन: ₹${profile.foodGroceries.toLocaleString()}, किराया/बिजली: ₹${profile.rentUtilities.toLocaleString()}, दैनिक: ₹${profile.otherDailyExpenses.toLocaleString()}, OTT: ₹${summary?.monthlySubCost.toLocaleString()}, बीमा: ₹${summary?.monthlyInsuranceCost.toLocaleString()})।`
            : `Total monthly outflow: ₹${summary?.totalOutflow.toLocaleString()} (Food: ₹${profile.foodGroceries.toLocaleString()}, Rent: ₹${profile.rentUtilities.toLocaleString()}, Daily: ₹${profile.otherDailyExpenses.toLocaleString()}, Subscriptions: ₹${summary?.monthlySubCost.toLocaleString()}, Insurance: ₹${summary?.monthlyInsuranceCost.toLocaleString()}).`;
      } else {
        const res = await sendChatMessage({ message: q });
        replyText = res.reply;
      }

      await new Promise((r) => setTimeout(r, 450));

      setMessages((m) => [
        ...m,
        {
          id: "b" + Date.now(),
          sender: "bot",
          text: replyText,
          suggestions:
            language === "hi"
              ? ["सब्सक्रिप्शन खर्च का विश्लेषण", "हेल्थ बीमा रिन्युअल रिमाइंडर", "6 महीने का इमरजेंसी फंड"]
              : ["Analyze my OTT spending", "Health insurance countdown", "6-month emergency reserve"],
        },
      ]);
    } catch {
      // fallback
    } finally {
      setLoading(false);
      setThinkingStep(0);
      inputRef.current?.focus();
    }
  };

  const handleMicToggle = async () => {
    if (isRecording) {
      await stopRecording();
      handleSend(language === "hi" ? "मेरे आगामी खर्च और रिन्युअल दिखाएं" : "Show my upcoming expenses and renewals");
    } else {
      await startRecording();
    }
  };

  const handleReset = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setMessages([{ id: "w1", sender: "bot", text: defaultWelcome, suggestions: defaultQuestions }]);
  };

  const quickFilterPills = [
    {
      icon: Search,
      label: language === "hi" ? "मासिक खर्च विश्लेषण" : "Monthly Expenses",
      query: language === "hi" ? "मेरा पूरा मासिक खर्च और बजट ब्रेकडाउन दिखाएं" : "Show my monthly expense breakdown",
    },
    {
      icon: Film,
      label: language === "hi" ? "OTT रिन्युअल" : "OTT Renewal",
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

  return (
    <div className="flex flex-col h-[calc(100dvh-130px)] sm:h-[calc(100dvh-134px)] w-full max-w-xl mx-auto bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm animate-in fade-in duration-200">
      {/* 1. Header (Matching Reference Image) */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-slate-900 block leading-tight">
              DhanMITR AI Assistant
            </span>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Online • Active Profile
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
          title="Reset Conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Messages Feed */}
      <div ref={feedRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[90%] sm:max-w-[85%] space-y-2">
              {/* Message Bubble */}
              <div
                className={`p-4 text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-slate-900 text-white rounded-3xl rounded-br-md font-medium"
                    : "bg-slate-50 text-slate-900 border border-slate-200/70 rounded-3xl rounded-bl-md"
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
              </div>

              {/* Bot Action Bar (Listen, Copy, ThumbsUp, ThumbsDown) */}
              {msg.sender === "bot" && (
                <div className="flex items-center gap-3 px-1 text-slate-400">
                  <button
                    type="button"
                    onClick={() => speak(msg.id, msg.text)}
                    className="hover:text-slate-900 transition-colors p-1 rounded-md"
                    title={speakingId === msg.id ? "Stop Speaking" : "Listen"}
                  >
                    {speakingId === msg.id ? (
                      <VolumeX className="w-4 h-4 text-slate-900" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyText(msg.id, msg.text)}
                    className="hover:text-slate-900 transition-colors p-1 rounded-md"
                    title="Copy Text"
                  >
                    {copiedId === msg.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFeedback(msg.id, true)}
                    className={`hover:text-slate-900 transition-colors p-1 rounded-md ${
                      likedMap[msg.id] === true ? "text-emerald-600" : ""
                    }`}
                    title="Helpful"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFeedback(msg.id, false)}
                    className={`hover:text-slate-900 transition-colors p-1 rounded-md ${
                      likedMap[msg.id] === false ? "text-red-500" : ""
                    }`}
                    title="Not Helpful"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* "You may ask" Question Card Pills */}
              {msg.sender === "bot" && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                    You may ask
                  </span>
                  <div className="space-y-1.5">
                    {msg.suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(s)}
                        className="w-full text-left text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-400 text-slate-800 rounded-2xl px-4 py-2.5 transition-all shadow-2xs active:scale-[0.99] touch-manipulation"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* AI Thinking Animation */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 max-w-[85%] space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <BrainCircuit className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: "2.5s" }} />
                <span>
                  {thinkingStep === 1 && (language === "hi" ? "आय व खर्च का विश्लेषण..." : "Analyzing cashflow & budget...")}
                  {thinkingStep === 2 && (language === "hi" ? "सब्सक्रिप्शन व बीमा स्कैन..." : "Scanning active services & policies...")}
                  {thinkingStep >= 3 && (language === "hi" ? "सुझाव तैयार हो रहे हैं..." : "Synthesizing personalized advice...")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`h-1 flex-1 rounded-full transition-all ${thinkingStep >= 1 ? "bg-emerald-500" : "bg-slate-200"}`} />
                <span className={`h-1 flex-1 rounded-full transition-all ${thinkingStep >= 2 ? "bg-emerald-500" : "bg-slate-200"}`} />
                <span className={`h-1 flex-1 rounded-full transition-all ${thinkingStep >= 3 ? "bg-emerald-500" : "bg-slate-200"}`} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Horizontal Filter Pills */}
      <div className="px-3 py-1.5 border-t border-slate-100 bg-slate-50/50 flex gap-1.5 overflow-x-auto no-scrollbar">
        {quickFilterPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(pill.query)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 flex-shrink-0 transition-all active:scale-95 shadow-2xs"
          >
            <pill.icon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>{pill.label}</span>
          </button>
        ))}
      </div>

      {/* 4. Bottom Input Bar with Big Glowing Green Mic Button (Matching Right Mockup) */}
      <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2.5">
        {/* Left: Curved Input with Attachment Icon */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex-1 relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 h-12 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />

          <button
            type="button"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
            title="Attach Document or Receipt"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {input.trim() && (
            <button
              type="submit"
              className="ml-1 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center transition-all active:scale-90"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Right: Big Glowing Emerald Green Circular Mic Button */}
        <button
          type="button"
          onClick={handleMicToggle}
          className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 touch-manipulation flex-shrink-0 shadow-md ${
            isRecording
              ? "bg-red-500 text-white animate-pulse"
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
          title="Hold or Tap to Talk"
        >
          {/* Subtle Outer Ring Effect */}
          <span className="absolute -inset-1 rounded-full border border-emerald-400/50 pointer-events-none" />
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

export default ChatAssistant;
