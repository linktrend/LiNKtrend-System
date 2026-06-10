"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAppSurface } from "@/components/app-surface-provider";
import { InsetSelect } from "@/components/forms";
import { useMemoryHref } from "@/hooks/use-memory-href";
import { memoryHref } from "@/lib/memory-href";
import type { LinkbrainTab } from "@/lib/linkbrain-data";

import type { BrainOrgNodeRow } from "@linktrend/linklogic-sdk";
import { FIELD, FORM } from "@/lib/ui-standards";

export { memoryHref } from "@/lib/memory-href";

export function AdminProgramMemorySelect(props: {
  programs: { id: string; title: string }[];
  selectedMissionId?: string;
  classification?: string;
  scope?: "recent" | "all";
  memoryTab?: LinkbrainTab;
  brainScope?: string;
}) {
  const router = useRouter();
  const hrefForTab = useMemoryHref();
  const sc = props.scope === "all" ? "all" : undefined;
  const tab = props.memoryTab ?? "project";
  return (
    <InsetSelect
      fullWidth={false}
      value={props.selectedMissionId ?? ""}
      aria-label="Select project"
      onChange={(e) => {
        const v = e.target.value.trim();
        router.push(
          hrefForTab(tab, {
            mission: v || undefined,
            classification: props.classification,
            scope: sc,
            brainScope: props.brainScope ?? (tab === "ask" ? "mission" : "mission"),
            brainMission: v || undefined,
          }),
        );
      }}
    >
      <option value="">Choose a project…</option>
      {props.programs.map((m) => (
        <option key={m.id} value={m.id}>
          {m.title}
        </option>
      ))}
    </InsetSelect>
  );
}

export function MemoryProjectSelect(props: {
  missions: { id: string; title: string }[];
  selectedMissionId?: string;
  classification?: string;
  scope?: "recent" | "all";
  /** When set (e.g. Ask tab), navigation stays on this tab. */
  memoryTab?: LinkbrainTab;
  brainScope?: string;
}) {
  const router = useRouter();
  const hrefForTab = useMemoryHref();
  const sc = props.scope === "all" ? "all" : undefined;
  const tab = props.memoryTab ?? "project";
  return (
    <InsetSelect
      fullWidth={false}
      value={props.selectedMissionId ?? ""}
      aria-label="Select project"
      onChange={(e) => {
        const v = e.target.value.trim();
        router.push(
          hrefForTab(tab, {
            mission: v || undefined,
            classification: props.classification,
            scope: sc,
            brainScope: props.brainScope ?? (tab === "ask" ? "mission" : "mission"),
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
    </InsetSelect>
  );
}

export function MemoryAgentSelect(props: {
  agents: { id: string; display_name: string }[];
  selectedAgentId?: string;
  classification?: string;
  scope?: "recent" | "all";
  memoryTab?: LinkbrainTab;
  brainScope?: string;
}) {
  const router = useRouter();
  const hrefForTab = useMemoryHref();
  const sc = props.scope === "all" ? "all" : undefined;
  const tab = props.memoryTab ?? "agent";
  return (
    <InsetSelect
      fullWidth={false}
      value={props.selectedAgentId ?? ""}
      aria-label="Select LiNKbot"
      onChange={(e) => {
        const v = e.target.value.trim();
        router.push(
          hrefForTab(tab, {
            agent: v || undefined,
            classification: props.classification,
            scope: sc,
            brainScope: props.brainScope ?? "agent",
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
    </InsetSelect>
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
  const hrefForTab = useMemoryHref();
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
      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Show</span>
      <Link
        href={hrefForTab(props.tab, { ...q, scope: "recent" })}
        className={`rounded-full border px-3 py-1 text-xs font-medium ${
          props.scope === "recent"
            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
            : "border-zinc-200 dark:border-zinc-700"
        }`}
      >
        Recent
      </Link>
      <Link
        href={hrefForTab(props.tab, { ...q, scope: "all" })}
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
  const hrefForTab = useMemoryHref();
  const { href: appHref, isAdmin } = useAppSurface();
  return (
    <div>
      <label className={FORM.fieldStack}>
        <span className={`${FIELD.label} text-xs text-zinc-500 dark:text-zinc-400`}>Department / office</span>
        <div className="max-w-xl">
          <InsetSelect
            fullWidth={false}
            value={props.selectedOrgId ?? ""}
            aria-label="Filter by organisation node"
            onChange={(e) => {
              const v = e.target.value.trim();
              router.push(hrefForTab("company", { org: v || undefined, brainScope: "company" }));
            }}
          >
            <option value="">All company documents</option>
            {props.nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </InsetSelect>
        </div>
      </label>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Narrow to a department or office from{" "}
        <Link href={appHref(isAdmin ? "/licensees" : "/company")} className="text-sky-700 underline dark:text-sky-400">
          {isAdmin ? "Licensee profile" : "Company settings"}
        </Link>
        .
      </p>
    </div>
  );
}
