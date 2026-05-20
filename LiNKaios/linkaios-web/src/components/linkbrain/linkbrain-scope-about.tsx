"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

/** Collapsible client/vendor scope explanation — shown once on the LiNKbrain workspace. */
export function LinkbrainScopeAbout() {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-xl border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">About memory scopes &amp; approval</span>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
        )}
      </button>
      {open ? (
        <div className="border-t border-zinc-200 px-4 pb-4 pt-3 text-xs leading-6 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
          <p>
            <strong>Add Knowledge</strong> and quick notes/uploads create <strong>drafts in Inbox</strong> — nothing is
            recorded in LiNKbrain until an operator approves. Agents and automations follow the same gate.
          </p>
          <p className="mt-2">
            Client operators work with <strong>Company</strong>, <strong>Project</strong>, and <strong>LiNKbot</strong>{" "}
            memory. Vendor-only, anonymized learning, and protected IP surfaces are labelled separately and may be hidden
            from client views.
          </p>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Scope badges describe visibility intent. Runtime enforcement follows retrieval policy (PM-007).
          </p>
        </div>
      ) : null}
    </section>
  );
}
