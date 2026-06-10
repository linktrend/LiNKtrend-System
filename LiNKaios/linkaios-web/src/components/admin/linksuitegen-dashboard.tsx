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

  useEffect(() => {
    fetch(`${ADMIN_BASE_PATH}/api/admin/linksuitegen/candidates`, {
      headers: { authorization: `Bearer ${process.env.NEXT_PUBLIC_LINKAIOS_ADMIN_SERVICE_TOKEN ?? "mock-admin"}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json() as Promise<{ candidates: CandidateRow[] }>;
      })
      .then((data) => setCandidates(data.candidates ?? []))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Admin-only suite factory — discovery, candidates, machine review, and governed publish to the Client marketplace.
      </p>
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
                    href={`${ADMIN_BASE_PATH}/linksuitegen/candidates/${c.candidate_id}`}
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
