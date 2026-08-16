"use client";

import React, { useState } from "react";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/languages";
import { Globe, Check, ChevronDown } from "lucide-react";

interface LanguageSelectorProps {
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
}

export function LanguageSelector({ currentLang, onSelectLang }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);

  const selected = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-all shadow-2xs active:scale-95 touch-manipulation"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span className="font-bold">{selected.nativeLabel}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-slate-200/90 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              भाषा चुनें / Select Language
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onSelectLang(lang.code);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                    currentLang === lang.code
                      ? "bg-slate-900 text-white font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{lang.nativeLabel}</span>
                    <span className={`text-[10px] ${currentLang === lang.code ? "text-slate-300" : "text-slate-400"}`}>
                      {lang.label}
                    </span>
                  </div>
                  {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
