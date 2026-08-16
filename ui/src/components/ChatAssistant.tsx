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
  Mic,
  MicOff,
  Sparkles,
  TrendingUp,
  Film,
  Shield,
  Search,
  Check,
  BrainCircuit,
  PieChart,
  Lightbulb,
  ChevronRight,
  Clock,
  Share2
} from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { sendChatMessage } from "@/lib/api";
import { LanguageCode } from "@/lib/languages";
import { UserFinancialProfile, calculateFinancialSummary } from "@/lib/userProfile";

interface StructuredCategory {
  label: string;
  amount: number;
  color: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp?: string;
  categories?: StructuredCategory[];
  followUpPrompt?: string;
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
      ? `नमस्ते ${userName}! ✨\nमैं आपकी वित्तीय स्थिति समझने और बेहतर निर्णय लेने में आपकी मदद के लिए यहाँ हूँ।\n\nआपकी मासिक आय ₹${profile ? profile.monthlyIncome.toLocaleString() : "65,000"} और बचत ₹${summary ? summary.netSurplus.toLocaleString() : "24,007"} के आधार पर आपके पास अच्छी बचत दर है। 🎉`
      : `Namaste ${userName}! ✨\nI'm here to help you understand your financial position and make better decisions.\n\nBased on your monthly income of ₹${profile ? profile.monthlyIncome.toLocaleString() : "65,000"} and surplus of ₹${summary ? summary.netSurplus.toLocaleString() : "24,007"}, you have a strong savings foundation. 🎉`;

  const defaultSuggestions =
    language === "hi"
      ? [
          "मेरे खर्चों का विश्लेषण करें",
          "मेरे OTT और सब्सक्रिप्शन दिखाएं",
          "मैं और ज्यादा कैसे बचत कर सकता हूँ?",
          "मेरे निवेश के लिए सुझाव दें",
        ]
      : [
          "Analyze my spending breakdown",
          "Show my active subscriptions",
          "How can I optimize my savings?",
          "Investment recommendations",
        ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "w1",
      sender: "bot",
      text: defaultWelcome,
      timestamp: "10:30 AM",
      suggestions: defaultSuggestions,
    },
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
    const u = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ""));
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

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((m) => [...m, { id: "u" + Date.now(), sender: "user", text: q, timestamp: timeStr }]);
    setInput("");
    setLoading(true);
    setThinkingStep(1);

    setTimeout(() => setThinkingStep(2), 350);

    try {
      setTimeout(() => setThinkingStep(3), 700);

      let replyText = "";
      let categories: StructuredCategory[] | undefined = undefined;
      let followUp = "";
      const lower = q.toLowerCase();

      if (lower.includes("खर्च") || lower.includes("spending") || lower.includes("expense") || lower.includes("outflow")) {
        replyText =
          language === "hi"
            ? `जरूर ${userName}! पिछले महीने आपके कुल खर्च ₹${summary?.totalOutflow.toLocaleString()} थे। यहाँ आपके खर्चों का सारांश है:`
            : `Certainly ${userName}! Here is the breakdown of your ₹${summary?.totalOutflow.toLocaleString()} total monthly outflow:`;

        categories = [
          { label: language === "hi" ? "Housing & Rent" : "Housing & Rent", amount: profile?.rentUtilities || 16000, color: "#10b981" },
          { label: language === "hi" ? "Investments" : "Investments", amount: 8500, color: "#6366f1" },
          { label: language === "hi" ? "Bills & Utilities" : "Bills & Utilities", amount: 6200, color: "#f59e0b" },
          { label: language === "hi" ? "Subscriptions" : "Subscriptions", amount: summary?.monthlySubCost || 4980, color: "#ef4444" },
          { label: language === "hi" ? "Insurance" : "Insurance", amount: summary?.monthlyInsuranceCost || 3513, color: "#8b5cf6" },
          { label: language === "hi" ? "Others" : "Others", amount: profile?.otherDailyExpenses || 5000, color: "#94a3b8" },
        ];

        followUp =
          language === "hi"
            ? "क्या आप किसी विशेष श्रेणी पर और विस्तार से जानना चाहेंगे?"
            : "Would you like to deep-dive into any specific category?";
      } else if (lower.includes("subscription") || lower.includes("ott") || lower.includes("सब्सक्रिप्शन")) {
        const nextSub = summary?.upcomingRenewals.find((r) => r.type === "subscription");
        replyText =
          language === "hi"
            ? `आपके पास कुल ${profile?.subscriptions.length} एक्टिव OTT सब्सक्रिप्शन हैं (मासिक लागत: ₹${summary?.monthlySubCost})। सबसे पहले ${nextSub ? nextSub.name : "नेटफ्लिक्स"} का रिन्युअल ${nextSub ? nextSub.date : "24 अगस्त"} (₹${nextSub ? nextSub.cost : 499}) को देय है। अप्रयुक्त सब्सक्रिप्शन पॉज करने पर सालाना ₹3,500+ की बचत होगी।`
            : `You have ${profile?.subscriptions.length} active subscriptions totaling ₹${summary?.monthlySubCost}/month. Next renewal: ${nextSub ? nextSub.name : "Netflix"} on ${nextSub ? nextSub.date : "24th Aug"} (₹${nextSub ? nextSub.cost : 499}). Rotating unused platforms can save over ₹3,500 annually.`;
      } else if (lower.includes("save") || lower.includes("बचत") || lower.includes("invest") || lower.includes("निवेश")) {
        const sipAmount = Math.round((summary?.netSurplus || 20000) * 0.6);
        const emergencyReserve = Math.round((summary?.totalOutflow || 30000) * 6);
        replyText =
          language === "hi"
            ? `आपकी मासिक बचत ₹${summary?.netSurplus.toLocaleString()} है। आपके मासिक खर्च (₹${summary?.totalOutflow.toLocaleString()}) के आधार पर आपका 6-महीने का इमरजेंसी फंड लक्ष्य ₹${emergencyReserve.toLocaleString()} होना चाहिए। बचत में से ₹${sipAmount.toLocaleString()} निफ्टी 50 इंडेक्स फंड SIP में लगाएं।`
            : `Your monthly surplus is ₹${summary?.netSurplus.toLocaleString()}. Based on outflow of ₹${summary?.totalOutflow.toLocaleString()}, your 6-month safety buffer goal is ₹${emergencyReserve.toLocaleString()}. We suggest allocating ₹${sipAmount.toLocaleString()}/mo into low-cost Index SIPs.`;
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
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          categories,
          followUpPrompt: followUp,
          suggestions:
            language === "hi"
              ? ["सब्सक्रिप्शन खर्च का विश्लेषण", "हेल्थ बीमा रिन्युअल रिमाइंडर", "6 महीने का इमरजेंसी फंड"]
              : ["Analyze OTT spending", "Health insurance countdown", "6-month emergency buffer"],
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
      handleSend(language === "hi" ? "मेरे खर्चों का विश्लेषण करें" : "Analyze my spending breakdown");
    } else {
      await startRecording();
    }
  };

  const handleReset = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setMessages([
      {
        id: "w1",
        sender: "bot",
        text: defaultWelcome,
        timestamp: "10:30 AM",
        suggestions: defaultSuggestions,
      },
    ]);
  };

  const quickActions = [
    {
      icon: PieChart,
      title: "Analyze Spending",
      query: "मेरे खर्चों का विश्लेषण करें",
    },
    {
      icon: Film,
      title: "Review Subscriptions",
      query: "मेरे OTT और सब्सक्रिप्शन दिखाएं",
    },
    {
      icon: Shield,
      title: "Check Insurance",
      query: "मेरी स्टार हेल्थ बीमा पॉलिसी की एक्सपायरी कब है?",
    },
    {
      icon: Lightbulb,
      title: "Investment Ideas",
      query: "मेरी बचत को सही जगह कैसे निवेश करें?",
    },
  ];

  const recentConversations = [
    { title: "Savings plan", time: "Today", query: "मैं और ज्यादा कैसे बचत कर सकता हूँ?" },
    { title: "Subscription review", time: "Yesterday", query: "मेरे OTT और सब्सक्रिप्शन दिखाएं" },
    { title: "Tax saving options", time: "3 days ago", query: "टैक्स बचाने के लिए सही निवेश विकल्प क्या हैं?" },
    { title: "Emergency fund", time: "5 days ago", query: "6 महीने का इमरजेंसी फंड कितना होना चाहिए?" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex gap-5 items-start">
      {/* ===== MAIN CHAT FEED CONTAINER ===== */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[calc(100dvh-175px)] sm:h-[calc(100dvh-180px)]">
        {/* Chat Feed Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-slate-900 block leading-tight">
                DhanMITR AI Assistant
              </span>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Online • Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
              title="Reset Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
              title="Share / Export"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Feed Scroll Area */}
        <div ref={feedRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[92%] sm:max-w-[85%] space-y-1.5">
                {/* User / Bot Bubble */}
                <div
                  className={`p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-3xl rounded-br-md font-semibold"
                      : "bg-slate-50 text-slate-900 border border-slate-200/80 rounded-3xl rounded-bl-md"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Structured Category Breakdown Table (Matching Mockup) */}
                  {msg.categories && (
                    <div className="mt-3 pt-3 border-t border-slate-200/70 space-y-2">
                      {msg.categories.map((cat, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-slate-700">{cat.label}</span>
                          </div>
                          <span className="font-extrabold text-slate-900">₹{cat.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.followUpPrompt && (
                    <p className="mt-2.5 text-xs text-slate-600 font-medium">{msg.followUpPrompt}</p>
                  )}

                  {/* Timestamp */}
                  <div className="mt-2 flex items-center justify-end">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {msg.timestamp || "10:30 AM"}
                    </span>
                  </div>
                </div>

                {/* Bot Message Action Buttons */}
                {msg.sender === "bot" && (
                  <div className="flex items-center gap-3 px-1 text-slate-400">
                    <button
                      type="button"
                      onClick={() => speak(msg.id, msg.text)}
                      className="hover:text-slate-900 transition-colors p-1 rounded-md"
                      title={speakingId === msg.id ? "Stop Speaking" : "Listen"}
                    >
                      {speakingId === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5 text-slate-900" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => copyText(msg.id, msg.text)}
                      className="hover:text-slate-900 transition-colors p-1 rounded-md"
                      title="Copy"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleFeedback(msg.id, true)}
                      className={`hover:text-slate-900 transition-colors p-1 rounded-md ${
                        likedMap[msg.id] === true ? "text-emerald-600" : ""
                      }`}
                      title="Helpful"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleFeedback(msg.id, false)}
                      className={`hover:text-slate-900 transition-colors p-1 rounded-md ${
                        likedMap[msg.id] === false ? "text-red-500" : ""
                      }`}
                      title="Not Helpful"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* "You might ask" suggestions */}
                {msg.sender === "bot" && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                      You might ask
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSend(s)}
                          className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl px-3.5 py-1.5 transition-all shadow-2xs active:scale-95 touch-manipulation"
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

          {/* Thinking animation state */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 max-w-[85%] space-y-2 animate-in fade-in">
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

        {/* Input Bar & Disclaimer (Matching Mockup) */}
        <div className="p-3 border-t border-slate-100 bg-white space-y-1.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your finances..."
              className="flex-1 h-12 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none pr-20"
            />

            <div className="absolute right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleMicToggle}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  isRecording ? "bg-red-500 text-white animate-pulse" : "hover:bg-slate-200 text-slate-500"
                }`}
                title="Speak"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          <p className="text-[10px] text-slate-400 text-center font-medium">
            DhanMITR can make mistakes. Always verify important financial decisions.
          </p>
        </div>
      </div>

      {/* ===== DESKTOP RIGHT SIDEBAR (Quick Actions & Recent Conversations) ===== */}
      <aside className="hidden lg:flex flex-col w-[260px] space-y-5">
        {/* Quick Actions */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs space-y-2.5">
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block px-1">
            Quick Actions
          </span>
          <div className="space-y-1.5">
            {quickActions.map((action, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(action.query)}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 text-xs font-bold text-slate-800 hover:text-emerald-800 transition-all text-left shadow-2xs group"
              >
                <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-2xs group-hover:scale-105 transition-transform">
                  <action.icon className="w-3.5 h-3.5" />
                </div>
                <span>{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs space-y-2.5">
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block px-1">
            Recent Conversations
          </span>
          <div className="space-y-2">
            {recentConversations.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(c.query)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-left transition-colors group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors block">
                    {c.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{c.time}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </button>
            ))}
          </div>
          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-1.5 text-center text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              View all conversations
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default ChatAssistant;
