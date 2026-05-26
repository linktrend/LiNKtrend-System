"use client";

import { useCallback, useState } from "react";
import { RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BUTTON } from "@/lib/ui-standards";

const STUB_BADGE_CLASS =
  "border-amber-300 bg-amber-50 text-amber-900 uppercase tracking-wide dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100";

/** Marks demo / local-only surfaces that are not wired to production integrations. */
export function StubBadge(props: { className?: string; label?: string }) {
  return (
    <Badge variant="outline" className={props.className ? `${STUB_BADGE_CLASS} ${props.className}` : STUB_BADGE_CLASS}>
      {props.label ?? "Demo stub"}
    </Badge>
  );
}

/** Marks planned surfaces that are visible but not yet available. */
export function ComingSoonBadge(props: { className?: string }) {
  return (
    <Badge variant="outline" className={props.className ? `${STUB_BADGE_CLASS} ${props.className}` : STUB_BADGE_CLASS}>
      Coming soon
    </Badge>
  );
}

export function StubPageNotice(props: { message: string }) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
    >
      <StubBadge />
      <span>{props.message}</span>
    </div>
  );
}

export type PlaneSyncStubResponse = {
  status: "stub";
  message: string;
  missionId: string;
  planeSyncStatus: "synced";
};

/** Plane sync affordance for project tools — calls stub API and surfaces demo feedback. */
export function PlaneSyncStubPanel(props: { missionId: string; canWrite?: boolean }) {
  const [pending, setPending] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const sync = useCallback(async () => {
    if (pending || !props.canWrite) return;
    setPending(true);
    setFlash(null);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(props.missionId)}/plane-sync`, { method: "POST" });
      const body = (await res.json()) as Partial<PlaneSyncStubResponse> & { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Sync request failed");
      }
      setFlash(body.message ?? "Demo response — Plane sync is not connected in MVO.");
    } catch {
      setFlash("Demo sync could not be recorded. Try again or contact your operator.");
    } finally {
      setPending(false);
      window.setTimeout(() => setFlash(null), 6000);
    }
  }, [pending, props.canWrite, props.missionId]);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Plane sync</h2>
            <StubBadge label="Demo stub" />
          </div>
          <p className="max-w-2xl text-xs text-zinc-600 sm:text-sm">
            Records operator intent only. No work items are created or updated in Plane until the execution bridge is live.
          </p>
        </div>
        <button
          type="button"
          className={`${BUTTON.secondaryCardAction} inline-flex items-center gap-2`}
          disabled={!props.canWrite || pending}
          onClick={() => void sync()}
        >
          <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} aria-hidden />
          {pending ? "Recording…" : "Record demo sync"}
        </button>
      </div>
      {flash ? (
        <p
          role="status"
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
        >
          {flash}
        </p>
      ) : null}
    </section>
  );
}
