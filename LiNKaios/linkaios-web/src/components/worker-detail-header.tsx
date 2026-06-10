"use client";

import { useEffect, useState } from "react";

import { BADGE, TYPE, WORKER_DETAIL } from "@/lib/ui-standards";
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
          <h1 className={TYPE.pageTitle}>{m.displayName}</h1>
          <p className={`mt-1 ${WORKER_DETAIL.roleLine}`}>Role · {m.role}</p>
          {m.description ? (
            <p className={`mt-2 max-w-3xl leading-relaxed ${WORKER_DETAIL.description}`}>{m.description}</p>
          ) : null}
          <p className={`mt-2 ${WORKER_DETAIL.agentId}`}>{m.id}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className={WORKER_DETAIL.snapshotLabel}>Snapshot</p>
          <dl className={`mt-2 space-y-2 ${TYPE.body}`}>
            <div className="flex items-center justify-between gap-4">
              <dt className={WORKER_DETAIL.snapshotTerm}>Status</dt>
              <dd className={`font-semibold ${BADGE.status} ${linkbotFleetStatusTone(m.statusLabel)}`}>{m.statusLabel}</dd>
            </div>
            {heartbeatLabel ? (
              <div className="flex items-center justify-between gap-4">
                <dt className={WORKER_DETAIL.snapshotTerm}>Last heartbeat</dt>
                <dd className={WORKER_DETAIL.snapshotValue}>{heartbeatLabel}</dd>
              </div>
            ) : null}
            {m.primaryModel ? (
              <div className="flex items-center justify-between gap-4">
                <dt className={WORKER_DETAIL.snapshotTerm}>Primary model</dt>
                <dd className={WORKER_DETAIL.snapshotValueMono}>{m.primaryModel}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </header>
  );
}
