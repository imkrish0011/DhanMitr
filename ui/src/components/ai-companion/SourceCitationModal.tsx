'use client';

import React from 'react';
import { KnowledgeSource } from '@/types';
import { BottomSheetDrawer } from '@/components/ui/BottomSheetDrawer';
import { ExternalLink, BookOpen, Calendar, ShieldCheck } from 'lucide-react';

interface SourceCitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: KnowledgeSource | null;
}

export const SourceCitationModal: React.FC<SourceCitationModalProps> = ({
  isOpen,
  onClose,
  source,
}) => {
  if (!source) return null;

  return (
    <BottomSheetDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Verified Knowledge Source"
      subtitle="Retrieved from official financial guidelines & databases"
    >
      <div className="space-y-4 text-xs">
        {/* Source Badge Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/20">
                {source.source_type || 'Official Regulation'}
              </span>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white pt-1">
                {source.title}
              </h4>
            </div>

            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {source.date && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Reference Year: {source.date}</span>
            </p>
          )}
        </div>

        {/* Source Content Excerpt */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span>Official Policy Excerpt / Rules</span>
          </label>
          <div className="p-3.5 rounded-2xl neumorph-inset-deep text-slate-700 dark:text-slate-200 leading-relaxed font-mono text-[11px]">
            {source.snippet}
          </div>
        </div>

        {/* Official Web Link */}
        {source.url && (
          <div className="pt-2">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>Visit Official Government / Portal Document</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </BottomSheetDrawer>
  );
};
