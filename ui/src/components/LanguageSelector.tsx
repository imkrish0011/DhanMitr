"use client";

import React from "react";
import { LanguageCode } from "@/lib/languages";

interface LanguageSelectorProps {
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
}

export function LanguageSelector({ currentLang, onSelectLang }: LanguageSelectorProps) {
  return (
    <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/80">
      <button
        type="button"
        onClick={() => onSelectLang("en")}
        className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight transition-all active:scale-95 ${
          currentLang === "en"
            ? "bg-white text-slate-900 shadow-xs"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => onSelectLang("hi")}
        className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight transition-all active:scale-95 ${
          currentLang === "hi"
            ? "bg-white text-slate-900 shadow-xs"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}
