"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

import type { PageHelpContent } from "@/lib/page-help-copy";
import { BUTTON } from "@/lib/ui-standards";

/** Static page help — slide-over panel; no LLM calls. */
export function PageHelpPanel(props: {
  open: boolean;
  onClose: () => void;
  content: PageHelpContent;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!props.open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [props.open, props.onClose]);

  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/40 dark:bg-black/55"
        aria-label="Close page help"
        onClick={props.onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <header className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Page help</p>
            <h2 id={titleId} className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {props.content.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={props.onClose}
            className={BUTTON.secondaryCompact}
            aria-label="Close help panel"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {props.content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-500">
            Static guidance only. TODO: optional LLM assistant using live page context.
          </p>
        </div>
        <footer className="border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
          <button type="button" onClick={props.onClose} className={BUTTON.secondaryRow}>
            Done
          </button>
        </footer>
      </aside>
    </div>
  );
}
