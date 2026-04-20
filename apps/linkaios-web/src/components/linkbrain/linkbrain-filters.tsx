"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { memoryHref } from "@/lib/memory-href";

import type { BrainOrgNodeRow } from "@linktrend/linklogic-sdk";

export { memoryHref } from "@/lib/memory-href";

export function MemoryProjectSelect(props: {
  missions: { id: string; title: string }[];
  selectedMissionId?: string;
  classification?: string;
  scope?: "recent" | "all";
}) {
  const router = useRouter();
  const sc = props.scope === "all" ? "all" : undefined;
  return (
    <select
      className="mt-2 w-full max-w-xl rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
      value={props.selectedMissionId ?? ""}
      aria-label="Select project"
      onChange={(e) => {
        const v = e.target.value.trim();
        router.push(
          memoryHref("project", {
            mission: v || undefined,
            classification: props.classification,
            scope: sc,
            brainScope: "mission",
            brainMission: v || undefined,
          }),
        );
      }}
    >
      <option value="">Choose a project…</option>
      {props.missions.map((m) => (
        <option key={m.id} value={m.id}>
          {m.title}
        </option>
      ))}
    </select>
  );
}

export function MemoryAgentSelect(props: {
  agents: { id: string; display_name: string }[];
  selectedAgentId?: string;
  classification?: string;
  scope?: "recent" | "all";
}) {
  const router = useRouter();
  const sc = props.scope === "all" ? "all" : undefined;
  return (
    <select
      className="mt-2 w-full max-w-xl rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
      value={props.selectedAgentId ?? ""}
      aria-label="Select LiNKbot"
      onChange={(e) => {
        const v = e.target.value.trim();
        router.push(
          memoryHref("agent", {
            agent: v || undefined,
            classification: props.classification,
            scope: sc,
            brainScope: "agent",
            brainAgent: v || undefined,
          }),
        );
      }}
    >
      <option value="">Choose a LiNKbot…</option>
      {props.agents.map((a) => (
        <option key={a.id} value={a.id}>
          {a.display_name}
        </option>
      ))}
    </select>
  );
}

export function MemoryScopeToggle(props: {
  tab: "project" | "agent" | "company";
  scope: "recent" | "all";
  mission?: string;
  agent?: string;
  classification?: string;
  brainMission?: string;
  brainAgent?: string;
  org?: string;
}) {
  const q = {
    mission: props.mission,
    agent: props.agent,
    classification: props.classification,
    brainMission: props.brainMission,
    brainAgent: props.brainAgent,
    org: props.org,
  };
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm" role="group" aria-label="How many entries to load">
      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Show</span>
      <Link
        href={memoryHref(props.tab, { ...q, scope: "recent" })}
        className={`rounded-full border px-3 py-1 text-xs font-medium ${
          props.scope === "recent"
            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
            : "border-zinc-200 dark:border-zinc-700"
        }`}
      >
        Recent
      </Link>
      <Link
        href={memoryHref(props.tab, { ...q, scope: "all" })}
        className={`rounded-full border px-3 py-1 text-xs font-medium ${
          props.scope === "all"
            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
            : "border-zinc-200 dark:border-zinc-700"
        }`}
      >
        All (larger cap)
      </Link>
    </div>
  );
}

export function CompanyOrgNarrowSelect(props: {
  nodes: BrainOrgNodeRow[];
  selectedOrgId?: string;
}) {
  const router = useRouter();
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Org tag (narrow company list)
      </label>
      <select
        className="mt-2 w-full max-w-xl rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        value={props.selectedOrgId ?? ""}
        aria-label="Filter by organisation node"
        onChange={(e) => {
          const v = e.target.value.trim();
          router.push(memoryHref("company", { org: v || undefined, brainScope: "company" }));
        }}
      >
        <option value="">All company-scoped documents</option>
        {props.nodes.map((n) => (
          <option key={n.id} value={n.id}>
            [{n.dimension}] {n.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Tags are many-to-many; the primary anchor is still <span className="font-medium">company</span> scope. Manage
        structure on{" "}
        <Link href="/memory/company-structure" className="text-sky-700 underline dark:text-sky-400">
          Company structure
        </Link>
        .
      </p>
    </div>
  );
}
