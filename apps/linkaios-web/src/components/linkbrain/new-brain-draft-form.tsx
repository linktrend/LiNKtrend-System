"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { createBrainDraftFromPathAction } from "@/app/(shell)/memory/brain-actions";

import type { BrainLegalEntityRow, BrainScope } from "@linktrend/linklogic-sdk";

const PATH_PRESETS: { value: string; label: string }[] = [
  { value: "SOUL.md", label: "SOUL.md — persona / voice" },
  { value: "MEMORY.md", label: "MEMORY.md — long-term notes" },
  { value: "USER.md", label: "USER.md — human preferences" },
  { value: "AGENTS.md", label: "AGENTS.md — agent instructions" },
  { value: "TOOLS.md", label: "TOOLS.md — tool notes" },
  { value: "__custom__", label: "Custom path…" },
];

type MissionRow = { id: string; title: string };
type AgentRow = { id: string; display_name: string };

function resolveLogicalPath(preset: string, custom: string): string {
  if (preset === "__custom__") return custom.trim();
  return preset;
}

export function NewBrainDraftForm(props: {
  defaultScope: BrainScope;
  defaultLogicalPath: string;
  defaultMissionId: string;
  defaultAgentId: string;
  missions: MissionRow[];
  agents: AgentRow[];
  legalEntities: BrainLegalEntityRow[];
}) {
  const [scope, setScope] = useState<BrainScope>(props.defaultScope);
  const initialPreset =
    PATH_PRESETS.some((p) => p.value === props.defaultLogicalPath && p.value !== "__custom__") ?
      props.defaultLogicalPath
    : props.defaultLogicalPath ? "__custom__"
    : "SOUL.md";
  const [pathPreset, setPathPreset] = useState(initialPreset);
  const [customPath, setCustomPath] = useState(
    initialPreset === "__custom__" ? props.defaultLogicalPath : "",
  );
  const [missionId, setMissionId] = useState(props.defaultMissionId);
  const [agentId, setAgentId] = useState(props.defaultAgentId);

  const logicalPath = useMemo(
    () => resolveLogicalPath(pathPreset, customPath),
    [pathPreset, customPath],
  );

  const defaultEntity = props.legalEntities[0]?.id ?? "";

  return (
    <form action={createBrainDraftFromPathAction} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <input type="hidden" name="logicalPath" value={logicalPath} />

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Legal entity
        </label>
        <select
          name="legalEntityId"
          defaultValue={defaultEntity}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {props.legalEntities.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} ({e.code})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Sensitivity
        </label>
        <select
          name="sensitivity"
          defaultValue="internal"
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="internal">internal</option>
          <option value="public">public</option>
          <option value="confidential">confidential</option>
          <option value="restricted">restricted</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Document kind
        </label>
        <select
          name="fileKind"
          defaultValue="standard"
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="standard">standard</option>
          <option value="daily_log">daily_log (append-only product rules)</option>
          <option value="upload">upload</option>
          <option value="librarian">librarian</option>
          <option value="quick_note">quick_note</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Scope</label>
        <select
          name="scope"
          value={scope}
          onChange={(e) => setScope(e.target.value as BrainScope)}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="company">Company (organisation-wide)</option>
          <option value="mission">Project</option>
          <option value="agent">LiNKbot (one agent)</option>
        </select>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {scope === "company" ?
            "Virtual path is unique per company; no project or bot selector."
          : scope === "mission" ?
            "Pick the project this file belongs to."
          : "Pick the LiNKbot this file belongs to. Standard bot-facing filenames apply."}
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Virtual file path
        </label>
        <select
          value={pathPreset}
          onChange={(e) => setPathPreset(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          aria-label="Preset virtual path"
        >
          {PATH_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        {pathPreset === "__custom__" ? (
          <input
            type="text"
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            placeholder="e.g. memory/2026-04-15.md"
            className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            aria-label="Custom virtual path"
          />
        ) : null}
        {pathPreset === "__custom__" && !customPath.trim() ? (
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">Enter a custom path before submitting.</p>
        ) : null}
      </div>

      {scope === "mission" ?
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Project
          </label>
          <select
            name="missionId"
            value={missionId}
            onChange={(e) => setMissionId(e.target.value)}
            required={props.missions.length > 0}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Select a project…</option>
            {props.missions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
          {props.missions.length === 0 ?
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
              No projects yet. Create a project first, then return here.
            </p>
          : <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Required for this scope.</p>}
        </div>
      : (
        <input type="hidden" name="missionId" value="" />
      )}

      {scope === "agent" ?
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            LiNKbot
          </label>
          <select
            name="agentId"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            required={props.agents.length > 0}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Select a LiNKbot…</option>
            {props.agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.display_name}
              </option>
            ))}
          </select>
          {props.agents.length === 0 ?
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
              No LiNKbots yet. Create an agent first, then return here.
            </p>
          : <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Required for this scope.</p>}
        </div>
      : (
        <input type="hidden" name="agentId" value="" />
      )}

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Initial body (markdown)
        </label>
        <textarea
          name="body"
          rows={14}
          defaultValue=""
          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={
            (pathPreset === "__custom__" && !customPath.trim()) ||
            (scope === "mission" && props.missions.length === 0) ||
            (scope === "agent" && props.agents.length === 0)
          }
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Create draft
        </button>
        <Link href="/memory?tab=project" className="rounded-lg border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-700">
          Cancel
        </Link>
      </div>
    </form>
  );
}
