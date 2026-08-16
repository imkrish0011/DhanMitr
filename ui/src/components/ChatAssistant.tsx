"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, RotateCcw, ArrowRight, Volume2, VolumeX, Mic } from "lucide-react";
import { Input } from "./ui/input";
import { SpecularButton } from "./ui/SpecularButton";
import { sendChatMessage } from "@/lib/api";
import { LanguageCode, RURAL_FINANCIAL_TOPICS } from "@/lib/languages";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  sources?: { title: string; snippet: string }[];
  suggestions?: string[];
}

interface ChatAssistantProps {
  language?: LanguageCode;
}

export function ChatAssistant({ language = "hi" }: ChatAssistantProps) {
  const defaultWelcomeText =
    language === "hi"
      ? "नमस्ते! मैं **धनमित्र (DhanMITR)** हूँ—आपका AI वित्तीय साथी। किसान क्रेडिट कार्ड (KCC), सरकारी योजनाएं, बचत, या लोन से जुड़ा कोई भी सवाल पूछें।"
      : language === "hinglish"
      ? "Namaste! Main **DhanMITR** hoon—aapka AI personal finance saathi. KCC Loan, PM-Kisan, RD savings ya Gold loan se related kuch bhi poochiye."
      : "Hello! I am **DhanMITR**, your AI Personal Finance Companion. Ask me anything about Kisan loans, government schemes, gold loans, or savings.";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: defaultWelcomeText,
      timestamp: "Just now",
      suggestions:
        language === "hi"
          ? ["KCC लोन पर कितना ब्याज लगता है?", "₹500 की मासिक बचत कैसे करें?", "PMSBY बीमा क्या है?"]
          : ["How does KCC loan interest work?", "Best monthly savings for ₹500?", "What is PMSBY insurance?"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakMessageAloud = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);

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

    utterance.onstart = () => setSpeakingMsgId(msgId);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChatMessage({ message: query });
      const botMsg: ChatMessage = {
        id: response.message_id || "b-" + Date.now(),
        sender: "bot",
        text: response.reply,
        timestamp: "Just now",
        sources: response.sources,
        suggestions: response.suggested_actions,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
    setMessages([
      {
        id: "welcome-1",
        sender: "bot",
        text: defaultWelcomeText,
        timestamp: "Just now",
        suggestions:
          language === "hi"
            ? ["KCC लोन पर कितना ब्याज लगता है?", "₹500 की मासिक बचत कैसे करें?", "PMSBY बीमा क्या है?"]
            : ["How does KCC loan interest work?", "Best monthly savings for ₹500?", "What is PMSBY insurance?"],
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[78dvh] sm:h-[620px] max-w-2xl mx-auto w-full bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
      {/* Sub Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800">
            {language === "hi" ? "धनमित्र AI वित्तीय सहायक" : "DhanMITR Financial Assistant"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 p-1"
          title="Clear conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" /> <span>{language === "hi" ? "हटाएं" : "Clear"}</span>
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 sm:gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "bot" && (
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-slate-900 text-white rounded-tr-none shadow-sm font-medium"
                  : "bg-slate-50 border border-slate-200/80 text-slate-900 rounded-tl-none shadow-xs"
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Read Aloud Audio button on Bot message */}
              {msg.sender === "bot" && (
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => speakMessageAloud(msg.id, msg.text)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {speakingMsgId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{language === "hi" ? "रोकें" : "Stop"}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{language === "hi" ? "🔊 सुनें" : "🔊 Listen"}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Suggested Follow-up Pills */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                  {msg.suggestions.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSend(sug)}
                      className="text-[11px] font-semibold bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1 transition-all flex items-center gap-1 shadow-2xs text-left active:scale-95"
                    >
                      <span>{sug}</span> <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === "user" && (
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-600 py-1">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-800">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <span>{language === "hi" ? "धनमित्र जानकारी तैयार कर रहा है..." : "DhanMITR is answering..."}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-100 bg-white flex items-center gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={language === "hi" ? "अपना सवाल यहाँ लिखें..." : "Type your finance question..."}
          className="flex-1 bg-slate-50 border-slate-200 focus-visible:bg-white text-xs sm:text-sm h-12 rounded-xl"
        />
        <SpecularButton
          type="submit"
          size="sm"
          radius={12}
          tint="#0f172a"
          tintOpacity={1}
          lineColor="#cbd5e1"
          textColor="#ffffff"
          baseColor="#334155"
          disabled={loading || !input.trim()}
          className="h-12 px-4 font-bold"
        >
          <Send className="w-4 h-4" />
        </SpecularButton>
      </form>
    </div>
  );
}

export default ChatAssistant;
