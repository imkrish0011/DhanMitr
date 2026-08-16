"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { LanguageCode } from "@/lib/languages";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  suggestions?: string[];
}

interface ChatAssistantProps {
  language?: LanguageCode;
}

export function ChatAssistant({ language = "hi" }: ChatAssistantProps) {
  const defaultWelcome =
    language === "hi"
      ? "नमस्ते! मैं धनमित्र (DhanMITR) हूँ — आपका AI वित्तीय साथी। किसान लोन, सरकारी योजनाएं, बचत, या बीमा से जुड़ा कोई भी सवाल पूछें।"
      : language === "hinglish"
      ? "Namaste! Main DhanMITR hoon — aapka AI finance saathi. KCC Loan, PM-Kisan, RD savings ya kuch bhi poochiye."
      : "Hello! I'm DhanMITR — your AI Personal Finance Companion. Ask me anything about savings, loans, insurance, or government schemes.";

  const defaultSuggestions =
    language === "hi"
      ? ["KCC लोन पर कितना ब्याज?", "₹500 बचत कैसे करें?", "PMSBY बीमा क्या है?"]
      : ["KCC loan interest rate?", "Best ₹500/mo savings plan?", "What is PMSBY?"];

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
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
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
    u.lang = language === "hi" || language === "hinglish" ? "hi-IN" : language === "mr" ? "mr-IN" : language === "bn" ? "bn-IN" : language === "te" ? "te-IN" : "en-IN";
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
      const res = await sendChatMessage({ message: q });
      setMessages((m) => [
        ...m,
        { id: res.message_id || "b" + Date.now(), sender: "bot", text: res.reply, suggestions: res.suggested_actions },
      ]);
    } catch {
      // silent
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleReset = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeakingId(null);
    setMessages([{ id: "w1", sender: "bot", text: defaultWelcome, suggestions: defaultSuggestions }]);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-136px)] sm:h-[calc(100dvh-140px)] w-full bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block leading-tight">DhanMITR AI</span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Online
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-900 flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={feedRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] sm:max-w-[80%] ${msg.sender === "user" ? "" : ""}`}>
              {/* Message bubble */}
              <div
                className={`px-3.5 py-2.5 text-[13px] sm:text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-slate-900 text-white rounded-2xl rounded-br-md"
                    : "bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl rounded-bl-md"
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
              </div>

              {/* Bot: listen button + suggestions */}
              {msg.sender === "bot" && (
                <div className="mt-1.5 flex flex-col gap-1.5">
                  {/* Listen button */}
                  <button
                    type="button"
                    onClick={() => speak(msg.id, msg.text)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 w-fit px-2 py-0.5 rounded transition-colors"
                  >
                    {speakingId === msg.id ? (
                      <><VolumeX className="w-3 h-3" /> {language === "hi" ? "रोकें" : "Stop"}</>
                    ) : (
                      <><Volume2 className="w-3 h-3" /> {language === "hi" ? "सुनें" : "Listen"}</>
                    )}
                  </button>

                  {/* Suggestion chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSend(s)}
                          className="text-[11px] font-medium bg-white border border-slate-200 hover:border-slate-400 text-slate-700 rounded-full px-3 py-1 transition-all active:scale-95 touch-manipulation"
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
              <span>{language === "hi" ? "जानकारी तैयार हो रही है..." : "Thinking..."}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-2.5 border-t border-slate-100 bg-white flex items-center gap-2"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={language === "hi" ? "अपना सवाल लिखें..." : "Type your question..."}
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
