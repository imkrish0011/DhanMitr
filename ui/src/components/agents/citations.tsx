'use client';
// beui.dev/components/agents/citations

import React, {
  type ReactNode,
  useCallback,
  useId,
  useState,
} from 'react';
import { BookOpenText, ChevronDown, ExternalLink, Globe2 } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AgentDisclosure } from '@/components/agents/agent-disclosure';
import { EASE_OUT, SPRING_LAYOUT, SPRING_SWAP } from '@/lib/ease';
import { useFavicon } from '@/lib/hooks/use-favicon';
import { cn } from '@/lib/utils';

export interface CitationItem {
  id: string;
  title: ReactNode;
  domain?: ReactNode;
  url?: string;
  snippet?: string;
}

export interface CitationsProps {
  citations: CitationItem[];
  title?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  idPrefix?: string;
  className?: string;
}

export interface CitationProps {
  citationId: string;
  index: number;
  /** Must match the related Citations idPrefix. */
  idPrefix: string;
  className?: string;
}

export interface CitationListProps {
  citations: CitationItem[];
  idPrefix?: string;
  className?: string;
}

export interface CitationStackProps {
  citations: CitationItem[];
  limit?: number;
  className?: string;
}

function citationTargetId(prefix: string, citationId: string) {
  return `${prefix}-${citationId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

export function Citation({
  citationId,
  index,
  idPrefix,
  className,
}: CitationProps) {
  return (
    <a
      href={`#${citationTargetId(idPrefix, citationId)}`}
      aria-label={`View citation ${index}`}
      className={cn(
        'mx-0.5 inline-flex min-w-4 -translate-y-0.5 items-center justify-center rounded-md bg-muted/60 px-1 py-0.5 text-[10px] font-semibold leading-none text-muted-foreground no-underline outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {index}
    </a>
  );
}

export function CitationFavicon({
  url,
  className,
}: {
  url?: string;
  className?: string;
}) {
  const favicon = useFavicon(url);
  const [loadError, setLoadError] = React.useState(false);

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-5 shrink-0 place-items-center text-muted-foreground',
        className,
      )}
    >
      {favicon.src && !loadError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={favicon.ref}
          src={favicon.src}
          alt=""
          width={16}
          height={16}
          onError={() => setLoadError(true)}
          referrerPolicy="no-referrer"
          className="size-3.5 rounded-xs object-contain"
        />
      ) : (
        <Globe2 className="size-3.5 text-slate-400 dark:text-slate-500" />
      )}
    </span>
  );
}

export function CitationStack({
  citations,
  limit = 3,
  className,
}: CitationStackProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex items-center -space-x-1.5', className)}
    >
      {citations.slice(0, limit).map((citation) => (
        <span
          key={citation.id}
          className="size-5 rounded-full bg-slate-100 dark:bg-slate-800 ring-1.5 ring-white dark:ring-[#0F172A] flex items-center justify-center overflow-hidden shrink-0 shadow-2xs"
        >
          <CitationFavicon
            url={citation.url}
            className="size-3.5"
          />
        </span>
      ))}
    </span>
  );
}

function CitationRow({
  citation,
  index,
  idPrefix,
}: {
  citation: CitationItem;
  index: number;
  idPrefix: string;
}) {
  const content = (
    <>
      <CitationFavicon url={citation.url} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors group-hover/citation:text-emerald-500">
          {citation.title}
        </span>
        {citation.snippet ? (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 font-normal">
            {citation.snippet}
          </span>
        ) : citation.domain ? (
          <span className="min-w-0 truncate text-[10px] text-slate-400 dark:text-slate-500">
            {citation.domain}
          </span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-1.5 self-center">
        <span className="grid size-4 place-items-center rounded-md bg-emerald-500/10 text-[9.5px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
          {index}
        </span>
        {citation.url ? (
          <ExternalLink className="size-3 text-slate-400 transition-colors group-hover/citation:text-emerald-500" />
        ) : null}
      </span>
    </>
  );

  const className =
    'group/citation flex items-start gap-2.5 rounded-lg px-2.5 py-2 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors text-left';
  const id = citationTargetId(idPrefix, citation.id);

  return citation.url ? (
    <a
      id={id}
      href={citation.url}
      target="_blank"
      rel="noreferrer noopener"
      className={className}
    >
      {content}
    </a>
  ) : (
    <div id={id} className={className}>
      {content}
    </div>
  );
}

export function CitationList({
  citations,
  idPrefix,
  className,
}: CitationListProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const resolvedPrefix =
    idPrefix ?? `citation-list-${baseId.replace(/:/g, '')}`;

  return (
    <div className={cn('grid gap-1', className)}>
      <AnimatePresence mode="popLayout">
        {citations.map((citation, index) => (
          <motion.div
            layout="position"
            key={citation.id}
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -3 }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    opacity: { duration: 0.18, ease: EASE_OUT },
                    y: SPRING_LAYOUT,
                    layout: SPRING_LAYOUT,
                  }
            }
          >
            <CitationRow
              citation={citation}
              index={index + 1}
              idPrefix={resolvedPrefix}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function Citations({
  citations,
  title = 'Sources',
  open,
  defaultOpen = false,
  onOpenChange,
  idPrefix,
  className,
}: CitationsProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const contentId = `${baseId}-content`;
  const resolvedPrefix =
    idPrefix ?? `citation-${baseId.replace(/:/g, '')}`;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const currentOpen = open ?? internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange, open],
  );

  return (
    <div className={cn('w-full text-sm', className)}>
      <button
        type="button"
        aria-expanded={currentOpen}
        aria-controls={contentId}
        onClick={() => setOpen(!currentOpen)}
        className="group -ml-1 flex min-h-8 items-center gap-2 rounded-lg px-2 text-left text-slate-500 dark:text-slate-400 outline-none transition-colors hover:text-slate-900 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
      >
        <BookOpenText className="size-4" />
        <span className="font-semibold text-xs">{title}</span>
        <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
          {citations.length}
        </span>
        <motion.span
          aria-hidden="true"
          animate={{ rotate: currentOpen ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : SPRING_SWAP}
          className="text-slate-400"
        >
          <ChevronDown className="size-3.5" />
        </motion.span>
      </button>

      <AgentDisclosure
        id={contentId}
        open={currentOpen}
      >
        <CitationList
          citations={citations}
          idPrefix={resolvedPrefix}
          className="mt-1"
        />
      </AgentDisclosure>
    </div>
  );
}
