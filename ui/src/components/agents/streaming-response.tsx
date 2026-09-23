'use client';
// beui.dev/components/agents/streaming-response

import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import {
  Check,
  ChevronDown,
  Copy,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  type CitationItem,
  CitationList,
  CitationStack,
} from '@/components/agents/citations';
import { AgentDisclosure } from '@/components/agents/agent-disclosure';
import { EASE_OUT, SPRING_PRESS, SPRING_SWAP } from '@/lib/ease';
import { cn } from '@/lib/utils';

export type StreamingResponseStatus = 'streaming' | 'complete' | 'error';
export type StreamingResponseFeedback = 'up' | 'down' | null;

export interface StreamingResponseProps {
  /** Rendered response content. Pass plain text or the output of a Markdown renderer. */
  children: ReactNode;
  status?: StreamingResponseStatus;
  /** Plain-text value copied by the built-in copy action. */
  copyText?: string;
  /** Overrides the built-in clipboard action. */
  onCopy?: () => void | Promise<void>;
  onRetry?: () => void;
  /** Optional sources shown as a compact footer disclosure after streaming. */
  sources?: CitationItem[];
  sourcesOpen?: boolean;
  defaultSourcesOpen?: boolean;
  onSourcesOpenChange?: (open: boolean) => void;
  sourceIdPrefix?: string;
  feedback?: StreamingResponseFeedback;
  defaultFeedback?: StreamingResponseFeedback;
  onFeedbackChange?: (feedback: StreamingResponseFeedback) => void;
  /** Set false when a surrounding conversation log announces streamed text. */
  announce?: boolean;
  /** Hides the built-in completion actions without changing response status. */
  showActions?: boolean;
  className?: string;
  contentClassName?: string;
  actionsClassName?: string;
}

function ResponseAction({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={label === 'Helpful' || label === 'Not helpful' ? active : undefined}
      onClick={onClick}
      whileTap={reduce ? undefined : { scale: 0.9 }}
      transition={SPRING_PRESS}
      className={cn(
        'grid size-7 place-items-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500',
        active && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold',
      )}
    >
      {children}
    </motion.button>
  );
}

export function StreamingResponse({
  children,
  status = 'streaming',
  copyText,
  onCopy,
  onRetry,
  sources = [],
  sourcesOpen,
  defaultSourcesOpen = false,
  onSourcesOpenChange,
  sourceIdPrefix,
  feedback,
  defaultFeedback = null,
  onFeedbackChange,
  announce = true,
  showActions = true,
  className,
  contentClassName,
  actionsClassName,
}: StreamingResponseProps) {
  const reduce = useReducedMotion() ?? false;
  const baseId = useId();
  const [copied, setCopied] = useState(false);
  const [internalFeedback, setInternalFeedback] =
    useState<StreamingResponseFeedback>(defaultFeedback);
  const [internalSourcesOpen, setInternalSourcesOpen] =
    useState(defaultSourcesOpen);
  const copyTimer = useRef<NodeJS.Timeout | number | undefined>(undefined);
  const currentFeedback = feedback ?? internalFeedback;
  const currentSourcesOpen = sourcesOpen ?? internalSourcesOpen;
  const streaming = status === 'streaming';
  const complete = status === 'complete';
  const canCopy = Boolean(copyText || onCopy);
  const hasSources = sources.length > 0;
  const shouldShowActions =
    showActions && !streaming && (canCopy || onRetry || complete || hasSources);
  const sourcesContentId = `${baseId}-sources`;
  const resolvedSourcePrefix =
    sourceIdPrefix ?? `response-source-${baseId.replace(/:/g, '')}`;

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current as any);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    if (onCopy) await onCopy();
    else if (copyText) await navigator.clipboard?.writeText(copyText);

    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current as any);
    copyTimer.current = setTimeout(() => setCopied(false), 1600);
  }, [copyText, onCopy]);

  const setFeedback = (next: Exclude<StreamingResponseFeedback, null>) => {
    const value = currentFeedback === next ? null : next;
    if (feedback === undefined) setInternalFeedback(value);
    onFeedbackChange?.(value);
  };

  const setSourcesOpen = useCallback(
    (next: boolean) => {
      if (sourcesOpen === undefined) setInternalSourcesOpen(next);
      onSourcesOpenChange?.(next);
    },
    [onSourcesOpenChange, sourcesOpen],
  );

  return (
    <div
      data-state={status}
      aria-busy={streaming}
      className={cn('w-full max-w-full min-w-0', className)}
    >
      <div
        aria-live={announce ? 'polite' : 'off'}
        className={cn(
          'text-xs sm:text-[13px] leading-relaxed break-words [overflow-wrap:anywhere] text-slate-800 dark:text-slate-100 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-slate-100 dark:[&_code]:bg-slate-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p+p]:mt-2 [&_pre]:my-2.5 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-slate-200/80 dark:[&_pre]:border-white/10 [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5',
          contentClassName,
        )}
      >
        {children}
      </div>

      <AnimatePresence initial={false}>
        {shouldShowActions ? (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE_OUT }}
            className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-white/5"
          >
            <div className={cn('flex items-center gap-1 flex-wrap', actionsClassName)}>
              {canCopy ? (
                <ResponseAction
                  label={copied ? 'Copied' : 'Copy response'}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </ResponseAction>
              ) : null}
              {onRetry ? (
                <ResponseAction label="Retry response" onClick={onRetry}>
                  <RotateCcw className="size-3.5" />
                </ResponseAction>
              ) : null}
              {complete ? (
                <>
                  <ResponseAction
                    label="Helpful"
                    active={currentFeedback === 'up'}
                    onClick={() => setFeedback('up')}
                  >
                    <ThumbsUp className="size-3.5" />
                  </ResponseAction>
                  <ResponseAction
                    label="Not helpful"
                    active={currentFeedback === 'down'}
                    onClick={() => setFeedback('down')}
                  >
                    <ThumbsDown className="size-3.5" />
                  </ResponseAction>
                </>
              ) : null}
              {hasSources ? (
                <button
                  type="button"
                  aria-expanded={currentSourcesOpen}
                  aria-controls={sourcesContentId}
                  onClick={() => setSourcesOpen(!currentSourcesOpen)}
                  className="group ml-1 inline-flex min-h-7 items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <CitationStack citations={sources} />
                  <span className="tabular-nums font-medium text-[11px]">
                    {sources.length} {sources.length === 1 ? 'source' : 'sources'}
                  </span>
                  <motion.span
                    aria-hidden="true"
                    animate={{ rotate: currentSourcesOpen ? 180 : 0 }}
                    transition={reduce ? { duration: 0 } : SPRING_SWAP}
                    className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                  >
                    <ChevronDown className="size-3" />
                  </motion.span>
                </button>
              ) : null}
            </div>

            {hasSources ? (
              <AgentDisclosure
                id={sourcesContentId}
                open={currentSourcesOpen}
              >
                <CitationList
                  citations={sources}
                  idPrefix={resolvedSourcePrefix}
                  className="mt-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] p-2 border border-slate-200/80 dark:border-white/5"
                />
              </AgentDisclosure>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
