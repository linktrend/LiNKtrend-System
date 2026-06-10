"use client";

import { useState } from "react";

import { ADMIN_BASE_PATH } from "@/lib/app-surface";
import { BUTTON } from "@/lib/ui-standards";

export function LiNKsuitegenCandidateActions(props: { candidateId: string; status: string }) {
  const [status, setStatus] = useState(props.status);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const token = process.env.NEXT_PUBLIC_LINKAIOS_ADMIN_SERVICE_TOKEN ?? "mock-admin";
  const base = `${ADMIN_BASE_PATH}/api/admin/linksuitegen/candidates/${props.candidateId}`;

  async function post(path: string, body?: Record<string, unknown>) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`${base}${path}`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText);
      if ((data as { candidate?: { status: string } }).candidate?.status) {
        setStatus((data as { candidate: { status: string } }).candidate.status);
      }
      setMessage("OK");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Actions</p>
      <p className="text-xs text-zinc-500">Status: {status}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={BUTTON.primaryRow} disabled={busy} onClick={() => post("/machine-review")}>
          Run machine review
        </button>
        <button
          type="button"
          className={BUTTON.secondaryRow}
          disabled={busy}
          onClick={() => post("/human-review", { decision: "approved" })}
        >
          Approve (human)
        </button>
        <button type="button" className={BUTTON.secondaryRow} disabled={busy} onClick={() => post("/publish")}>
          Publish to marketplace
        </button>
      </div>
      {message ? <p className="text-xs text-zinc-600 dark:text-zinc-400">{message}</p> : null}
    </div>
  );
}
