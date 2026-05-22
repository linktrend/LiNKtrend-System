"use client";

import { useEffect, useState } from "react";

import { BADGE } from "@/lib/ui-standards";
import { formatFleetHeartbeat, linkbotFleetStatusTone, type LinkbotFleetStatusLabel } from "@/lib/linkbot-fleet-status";

export type WorkerDetailHeaderModel = {
  id: string;
  displayName: string;
  role: string;
  description: string;
  statusLabel: LinkbotFleetStatusLabel;
  lastHeartbeatIso?: string | null;
  primaryModel?: string | null;
  isDemo?: boolean;
};

export function WorkerDetailHeader(props: { model: WorkerDetailHeaderModel }) {
  const m = props.model;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const heartbeatLabel = mounted && m.lastHeartbeatIso ? formatFleetHeartbeat(m.lastHeartbeatIso) : null;

  return (
    <header className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{m.displayName}</h1>
          <p className="mt-1 text-sm font-semibold text-violet-800 dark:text-violet-300">Role · {m.role}</p>
          {m.description ? (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{m.description}</p>
          ) : null}
          <p className="mt-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{m.id}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Snapshot</p>
          <dl className="mt-2 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
              <dd className={`font-semibold ${BADGE.status} ${linkbotFleetStatusTone(m.statusLabel)}`}>{m.statusLabel}</dd>
            </div>
            {heartbeatLabel ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500 dark:text-zinc-400">Last heartbeat</dt>
                <dd className="text-zinc-800 dark:text-zinc-200">{heartbeatLabel}</dd>
              </div>
            ) : null}
            {m.primaryModel ? (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500 dark:text-zinc-400">Primary model</dt>
                <dd className="font-mono text-xs text-zinc-800 dark:text-zinc-200">{m.primaryModel}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </header>
  );
}
