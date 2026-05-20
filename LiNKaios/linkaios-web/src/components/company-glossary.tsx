"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

/** Collapsible glossary — Company hub (licensee vs vendor, knowledge path, modules). */
export function CompanyGlossary() {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-xl border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">About company &amp; licensing</span>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
        )}
      </button>
      {open ? (
        <div className="space-y-2 border-t border-zinc-200 px-4 pb-4 pt-3 text-xs leading-6 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
          <p>
            <strong>Licensee company</strong> = the customer organization LiNKaios is licensed to (law firm, agency,
            clinic, etc.). A tenant may have <strong>multiple companies</strong>; one human user can belong to more than
            one.
          </p>
          <p>
            <strong>LiNKtrend (vendor)</strong> users operate the same platform with higher permissions.{" "}
            <strong>AI agent user accounts</strong> work for LiNKtrend — not for the licensee — and are distinct from
            LiNKbots in the fleet directory.
          </p>
          <p>
            <strong>Company knowledge</strong> = documents and reference material about the licensee. Add through{" "}
            <strong>LiNKbrain Inbox</strong>; approved items become retrievable company memory.
          </p>
          <p>
            <strong>Locations</strong> = physical sites (HQ, branches). <strong>Organization</strong> = departments
            and regions for internal structure and LiNKbrain scoping.
          </p>
          <p className="text-zinc-500 dark:text-zinc-400">
            Module subscriptions and user permissions are managed here (overview) and in <strong>Settings</strong>.
          </p>
        </div>
      ) : null}
    </section>
  );
}
