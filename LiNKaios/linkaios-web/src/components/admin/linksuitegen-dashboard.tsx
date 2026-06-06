"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ADMIN_BASE_PATH } from "@/lib/app-surface";
import { StatusPill } from "@/components/ui/status-pill";

type CandidateRow = {
  candidate_id: string;
  suite_id: string;
  display_name: string;
  status: string;
  validation_status: string;
};

export function LiNKsuitegenDashboard() {
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cycleBusy, setCycleBusy] = useState(false);
  const [cycleMessage, setCycleMessage] = useState<string | null>(null);

  const authHeader = {
    authorization: `Bearer ${process.env.NEXT_PUBLIC_LINKAIOS_ADMIN_SERVICE_TOKEN ?? "mock-admin"}`,
  };

  const reloadCandidates = () => {
    fetch(`${ADMIN_BASE_PATH}/api/admin/linksuitegen/candidates`, { headers: authHeader })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json() as Promise<{ candidates: CandidateRow[] }>;
      })
      .then((data) => setCandidates(data.candidates ?? []))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  };

  useEffect(() => {
    reloadCandidates();
  }, []);

  async function runDiscoveryCycle() {
    setCycleBusy(true);
    setCycleMessage(null);
    try {
      const res = await fetch(`${ADMIN_BASE_PATH}/api/admin/linksuitegen/orchestrator/cycle`, {
        method: "POST",
        headers: { ...authHeader, "content-type": "application/json" },
        body: JSON.stringify({ variant: "simple_crm_lead_odoo_shadow" }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; cycle_id?: string };
      if (!res.ok) {
        throw new Error(json.error ?? `cycle failed (${res.status})`);
      }
      setCycleMessage(json.cycle_id ? `Cycle started: ${json.cycle_id}` : "Discovery cycle dispatched.");
      reloadCandidates();
    } catch (e: unknown) {
      setCycleMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setCycleBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Admin-only suite factory — discovery, candidates, machine review, and governed publish to the Client marketplace.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void runDiscoveryCycle()}
          disabled={cycleBusy}
          className="inline-flex min-h-9 items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {cycleBusy ? "Running discovery…" : "Run discovery cycle"}
        </button>
        <span className="text-xs text-zinc-500">Variant: simple_crm_lead_odoo_shadow</span>
      </div>
      {cycleMessage ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
          {cycleMessage}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-50">
          {error} — use service token or import via CLI in local dev.
        </p>
      ) : null}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Candidates</h2>
        </div>
        {candidates.length === 0 ? (
          <p className="px-4 py-6 text-sm text-zinc-500">No candidates yet. Run factory generate + post-handoff.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {candidates.map((c) => (
              <li key={c.candidate_id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <Link
                    href={`${ADMIN_BASE_PATH}/admin/linksuitegen/candidates/${c.candidate_id}`}
                    className="font-medium text-sky-700 hover:underline dark:text-sky-400"
                  >
                    {c.display_name}
                  </Link>
                  <p className="text-xs text-zinc-500">{c.suite_id} · {c.validation_status}</p>
                </div>
                <StatusPill label={c.status.replace(/_/g, " ")} tone="neutral" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
