"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, RotateCcw, Volume2, VolumeX, Sparkles } from "lucide-react";
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

  const defaultWelcome =
    language === "hi"
      ? `नमस्ते ${profile ? profile.name : ""}! मैं धनमित्र (DhanMITR) हूँ — आपका AI वित्तीय साथी। आपकी मासिक आय ₹${profile ? profile.monthlyIncome.toLocaleString() : "65,000"} और बचत ₹${summary ? summary.netSurplus.toLocaleString() : "29,000"} के आधार पर कोई भी सवाल पूछें।`
      : `Hello ${profile ? profile.name : ""}! I am DhanMITR — your AI Personal Finance Companion. Based on your monthly income of ₹${profile ? profile.monthlyIncome.toLocaleString() : "65,000"} and surplus of ₹${summary ? summary.netSurplus.toLocaleString() : "29,000"}, how can I help you today?`;

  const defaultSuggestions =
    language === "hi"
      ? [
          "मेरे कौन से OTT और सब्सक्रिप्शन रिन्यू होने वाले हैं?",
          `मेरी ₹${summary ? summary.netSurplus.toLocaleString() : "29,000"} की बचत कहाँ निवेश करें?`,
          "मेरी स्टार हेल्थ बीमा पॉलिसी की एक्सपायरी कब है?",
        ]
      : [
          "Which subscriptions are renewing soon?",
          `Best SIP allocation for my ₹${summary ? summary.netSurplus.toLocaleString() : "29,000"} surplus?`,
          "When is my Star Health insurance due?",
        ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "w1", sender: "bot", text: defaultWelcome, suggestions: defaultSuggestions },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
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
    u.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(u);
  };

  const handleSend = async (text?: string) => {
    const q = text || input;
    if (!q.trim() || loading) return;
    setMessages((m) => [...m, { id: "u" + Date.now(), sender: "user", text: q }]);
    setInput("");
    setLoading(true);

    try {
      // Build personalized prompt context if answering locally
      let replyText = "";
      const lower = q.toLowerCase();

      if (profile && (lower.includes("subscription") || lower.includes("ott") || lower.includes("सब्सक्रिप्शन") || lower.includes("रिन्यू"))) {
        const nextSub = summary?.upcomingRenewals.find((r) => r.type === "subscription");
        replyText =
          language === "hi"
            ? `आपके पास कुल ${profile.subscriptions.length} एक्टिव सब्सक्रिप्शन हैं (लागत: ₹${summary?.monthlySubCost}/माह)। सबसे पहले ${nextSub ? nextSub.name : "Netflix"} का रिन्युअल ${nextSub ? nextSub.date : "24 अगस्त"} को (₹${nextSub ? nextSub.cost : 499}) देय है। यदि आप अनावश्यक OTT पॉज करते हैं, तो सालाना ₹3,500+ बचा सकते हैं।`
            : `You have ${profile.subscriptions.length} active subscriptions costing ₹${summary?.monthlySubCost}/month. Your next scheduled renewal is ${nextSub ? nextSub.name : "Netflix"} on ${nextSub ? nextSub.date : "24th Aug"} (₹${nextSub ? nextSub.cost : 499}). Rotating unused platforms can save you over ₹3,500 annually.`;
      } else if (profile && (lower.includes("insurance") || lower.includes("बीमा") || lower.includes("health") || lower.includes("पॉलिसी"))) {
        const expIns = profile.insurances.find((i) => i.status === "expiring_soon") || profile.insurances[0];
        replyText =
          language === "hi"
            ? `आपकी ${expIns.name} पॉलिसी (प्रीमियम: ₹${expIns.amount.toLocaleString()}) की अंतिम तिथि ${expIns.expiryDate} है। नो-क्लेम बोनस और वेटिंग पीरियड सुरक्षित रखने के लिए कृपया समय पर रिन्यू करें।`
            : `Your ${expIns.name} policy (annual premium: ₹${expIns.amount.toLocaleString()}) expires on ${expIns.expiryDate}. Please renew before this date to protect continuous coverage and no-claim benefits.`;
      } else if (profile && (lower.includes("save") || lower.includes("बचत") || lower.includes("invest") || lower.includes("sip") || lower.includes("निवेश"))) {
        const sipAmount = Math.round((summary?.netSurplus || 20000) * 0.6);
        replyText =
          language === "hi"
            ? `आपकी मासिक बचत ₹${summary?.netSurplus.toLocaleString()} (${summary?.savingsRate}%) है। हमारा सुझाव है कि इसमें से ₹${sipAmount.toLocaleString()} निफ्टी 50 इंडेक्स फंड व फ्लेक्सीकैप में SIP करें और शेष ₹${Math.round((summary?.netSurplus || 20000) * 0.4).toLocaleString()} लिक्विड इमरजेंसी फंड में रखें।`
            : `Your monthly surplus is ₹${summary?.netSurplus.toLocaleString()} (${summary?.savingsRate}% savings rate). We recommend routing ₹${sipAmount.toLocaleString()}/mo into diversified Index SIPs, and retaining the remaining ₹${Math.round((summary?.netSurplus || 20000) * 0.4).toLocaleString()} in a liquid emergency reserve.`;
      } else {
        const res = await sendChatMessage({ message: q });
        replyText = res.reply;
      }

      setMessages((m) => [
        ...m,
        {
          id: "b" + Date.now(),
          sender: "bot",
          text: replyText,
          suggestions:
            language === "hi"
              ? ["सब्सक्रिप्शन ऑप्टिमाइज़ करें", "हेल्थ बीमा रिन्युअल रिमाइंडर", "6 महीने का इमरजेंसी फंड"]
              : ["Optimize my OTT bundle", "Health insurance renewal reminder", "Calculate 6-month safety fund"],
        },
      ]);
    } catch {
      // fallback
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleReset = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setMessages([{ id: "w1", sender: "bot", text: defaultWelcome, suggestions: defaultSuggestions }]);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-136px)] sm:h-[calc(100dvh-140px)] w-full bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              DhanMITR Personal Advisor
            </span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              {profile ? `${profile.name} • Active Context` : "AI Online"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-900 flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title="Clear"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div ref={feedRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[88%] sm:max-w-[80%]">
              <div
                className={`px-3.5 py-2.5 text-[13px] sm:text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-slate-900 text-white rounded-2xl rounded-br-md font-medium"
                    : "bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl rounded-bl-md"
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
              </div>

              {/* Bot: Audio read-aloud + suggestions */}
              {msg.sender === "bot" && (
                <div className="mt-1.5 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => speak(msg.id, msg.text)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 w-fit px-2 py-0.5 rounded transition-colors"
                  >
                    {speakingId === msg.id ? (
                      <>
                        <VolumeX className="w-3 h-3 text-slate-600" />
                        <span>{language === "hi" ? "रोकें" : "Stop"}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 text-slate-600" />
                        <span>{language === "hi" ? "सुनें" : "Listen"}</span>
                      </>
                    )}
                  </button>

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSend(s)}
                          className="text-[11px] font-medium bg-white border border-slate-200 hover:border-slate-400 text-slate-700 rounded-full px-3 py-1 transition-all active:scale-95 touch-manipulation shadow-2xs"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
              <span>{language === "hi" ? "विश्लेषण जारी है..." : "Analyzing cashflow..."}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2.5 border-t border-slate-100 bg-white flex items-center gap-2"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={language === "hi" ? "आय, खर्च, सब्सक्रिप्शन या बीमा पर सवाल पूछें..." : "Ask about income, OTT, insurance, or savings..."}
          className="flex-1 h-11 px-4 rounded-full bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-11 h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center flex-shrink-0 transition-all active:scale-90 touch-manipulation disabled:opacity-40 disabled:active:scale-100"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default ChatAssistant;
