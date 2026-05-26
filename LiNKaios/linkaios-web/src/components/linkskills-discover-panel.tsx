"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { registerToolFromRepoAction } from "@/app/(shell)/skills/tools/actions";
import { useAppSurface } from "@/components/app-surface-provider";
import type { RepoCapabilityCandidate, RepoToolCandidate } from "@/lib/linkskills-repo-discovery";
import {
  registerCapabilityRow,
  readRegisteredCapabilities,
  type RegisteredCapabilityRow,
} from "@/lib/linkskills-requests";
import { BUTTON } from "@/lib/ui-standards";

export function LinkskillsToolDiscoverPanel(props: { candidates: RepoToolCandidate[] }) {
  const router = useRouter();
  const { href } = useAppSurface();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  if (props.candidates.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
        No new repo tools found under <code className="text-xs">LiNKskills/tools/definitions/</code>. Add a JSON
        definition there after integrating off-platform, then return here to register it in the catalogue.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {err ? <p className="text-sm text-red-700 dark:text-red-300">{err}</p> : null}
      <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {props.candidates.map((c) => (
          <li key={c.repoSlug} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{c.name}</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{c.description}</p>
              <p className="mt-1 font-mono text-[11px] text-zinc-500">{c.manifestPath}</p>
            </div>
            <button
              type="button"
              disabled={pending}
              className={BUTTON.primaryCompact}
              onClick={() => {
                setErr(null);
                startTransition(async () => {
                  const r = await registerToolFromRepoAction(c);
                  if (!r.ok) {
                    setErr(r.error);
                    return;
                  }
                  router.push(href(`/skills/tools/${r.id}`));
                  router.refresh();
                });
              }}
            >
              Add to catalogue
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LinkskillsCapabilityDiscoverPanel(props: { candidates: RepoCapabilityCandidate[] }) {
  const router = useRouter();
  const { href } = useAppSurface();
  const [pending, startTransition] = useTransition();

  const visibleCandidates = props.candidates.filter((c) => {
    const registered = readRegisteredCapabilities();
    return !registered.some((r) => r.id === c.pluginId || r.repoSlug === c.repoSlug);
  });

  if (visibleCandidates.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
        No new capability manifests found under <code className="text-xs">LiNKskills/capability-connectors/</code>.
        Integrate the connector in the repo first, then return here to add it to the platform catalogue.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
      {visibleCandidates.map((c) => (
        <li key={c.pluginId} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{c.name}</p>
            <p className="mt-0.5 font-mono text-xs text-zinc-500">{c.pluginId}</p>
            <p className="mt-1 font-mono text-[11px] text-zinc-500">{c.manifestPath}</p>
          </div>
          <button
            type="button"
            disabled={pending}
            className={BUTTON.primaryCompact}
            onClick={() => {
              startTransition(() => {
                const row: RegisteredCapabilityRow = {
                  id: c.pluginId,
                  name: c.name,
                  capabilityScope: c.pluginId,
                  status: c.status,
                  targetSoftware: c.manifestPath.split("/").pop() ?? c.pluginId,
                  usedBy: "Platform catalogue",
                  repoSlug: c.repoSlug,
                  registeredAt: new Date().toISOString(),
                };
                registerCapabilityRow(row);
                router.push(href("/skills/connectors"));
                router.refresh();
              });
            }}
          >
            Add to catalogue
          </button>
        </li>
      ))}
    </ul>
  );
}
