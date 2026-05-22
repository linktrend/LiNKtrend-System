"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { INBOX_SUBMISSION_SOURCES, type InboxSubmissionSource } from "@/components/linkbrain/linkbrain-labels";
import { memoryHref } from "@/lib/memory-href";

export function LinkbrainInboxToolbar(props: {
  missionFilter?: string;
  agentFilter?: string;
  orgNodeId?: string;
  inboxSource?: InboxSubmissionSource | null;
  inboxSort?: "asc" | "desc";
}) {
  const router = useRouter();
  const source = props.inboxSource ?? "all";
  const sort = props.inboxSort ?? "desc";

  const base = {
    mission: props.missionFilter,
    agent: props.agentFilter,
    org: props.orgNodeId,
    inboxSource: source === "all" ? undefined : source,
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="min-w-[14rem] flex-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Submission type
        <select
          className="mt-2 block w-full max-w-md rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          value={source}
          onChange={(e) => {
            const next = e.target.value as InboxSubmissionSource;
            router.push(
              memoryHref("inbox", {
                ...base,
                inboxSource: next === "all" ? undefined : next,
                inboxSort: sort === "asc" ? "asc" : undefined,
              }),
            );
          }}
        >
          {INBOX_SUBMISSION_SOURCES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-1 pb-0.5">
        <span className="mr-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">Sort</span>
        <Link
          href={memoryHref("inbox", { ...base, inboxSort: undefined })}
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
          href={memoryHref("inbox", { ...base, inboxSort: "asc" })}
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
    </div>
  );
}
