"use client";

import { Database } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import type { DataEnvironmentMode } from "@/lib/data-environment";

/** Persistent shell badge — Mock data vs Live data when review/stub modes are active. */
export function DataEnvironmentBadge(props: { mode: DataEnvironmentMode }) {
  const isMock = props.mode === "mock";
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      role="status"
      aria-label={isMock ? "Mock data environment" : "Live data environment"}
    >
      <Database className="h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-zinc-400" aria-hidden />
      <StatusPill label={isMock ? "Mock data" : "Live data"} tone={isMock ? "warning" : "success"} />
      <span className="text-zinc-600 dark:text-zinc-400">
        {isMock
          ? "Fixture rows may appear alongside live telemetry."
          : "Showing production data paths — fixtures hidden unless mocks are enabled."}
      </span>
    </div>
  );
}
