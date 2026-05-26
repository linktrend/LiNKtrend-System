"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";

import { useMemoryHref } from "@/hooks/use-memory-href";

/** Inbox sort controls only — submission type is set at creation and shown on each card. */
export function LinkbrainInboxToolbar(props: {
  missionFilter?: string;
  agentFilter?: string;
  orgNodeId?: string;
  inboxSort?: "asc" | "desc";
  cIndustry?: string;
  cPattern?: string;
  cUseCase?: string;
  cSubmission?: string;
}) {
  const hrefForTab = useMemoryHref();
  const sort = props.inboxSort ?? "desc";

  const base = {
    mission: props.missionFilter,
    agent: props.agentFilter,
    org: props.orgNodeId,
    cIndustry: props.cIndustry,
    cPattern: props.cPattern,
    cUseCase: props.cUseCase,
    cSubmission: props.cSubmission,
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <span className="mr-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">Sort</span>
      <Link
        href={hrefForTab("inbox", { ...base, inboxSort: undefined })}
        aria-label="Newest first"
        title="Newest first"
        className={
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition " +
          (sort !== "asc"
            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
            : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900")
        }
      >
        <ArrowDown className="h-4 w-4" aria-hidden />
      </Link>
      <Link
        href={hrefForTab("inbox", { ...base, inboxSort: "asc" })}
        aria-label="Oldest first"
        title="Oldest first"
        className={
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition " +
          (sort === "asc"
            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
            : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900")
        }
      >
        <ArrowUp className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
