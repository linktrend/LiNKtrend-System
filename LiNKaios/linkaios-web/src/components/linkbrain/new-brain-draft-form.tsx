"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { createBrainDraftFromPathAction } from "@/app/(shell)/memory/brain-actions";
import { InsetSelect } from "@/components/forms";
import { MemoryItemTagFields } from "@/components/linkbrain/memory-item-tag-fields";
import { useMemoryHref } from "@/hooks/use-memory-href";
import { FIELD, FORM } from "@/lib/ui-standards";

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
  const hrefForTab = useMemoryHref();
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

      <label className={FORM.fieldStack}>
        <span className={`${FIELD.label} text-xs text-zinc-500 dark:text-zinc-400`}>Legal entity</span>
        <InsetSelect name="legalEntityId" defaultValue={defaultEntity}>
          {props.legalEntities.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} ({e.code})
            </option>
          ))}
        </InsetSelect>
      </label>

      <label className={FORM.fieldStack}>
        <span className={`${FIELD.label} text-xs text-zinc-500 dark:text-zinc-400`}>Sensitivity</span>
        <InsetSelect name="sensitivity" defaultValue="internal">
          <option value="internal">internal</option>
          <option value="public">public</option>
          <option value="confidential">confidential</option>
          <option value="restricted">restricted</option>
        </InsetSelect>
      </label>

      <label className={FORM.fieldStack}>
        <span className={`${FIELD.label} text-xs text-zinc-500 dark:text-zinc-400`}>Document kind</span>
        <InsetSelect name="fileKind" defaultValue="standard">
          <option value="standard">standard</option>
          <option value="daily_log">daily_log (append-only product rules)</option>
          <option value="upload">upload</option>
          <option value="librarian">librarian</option>
          <option value="quick_note">quick_note</option>
        </InsetSelect>
      </label>

      <div>
        <label className={FORM.fieldStack}>
          <span className={`${FIELD.label} text-xs text-zinc-500 dark:text-zinc-400`}>Scope</span>
          <InsetSelect name="scope" value={scope} onChange={(e) => setScope(e.target.value as BrainScope)}>
            <option value="company">Company (organisation-wide)</option>
            <option value="mission">Project</option>
            <option value="agent">LiNKbot (one agent)</option>
          </InsetSelect>
        </label>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {scope === "company" ?
            "Virtual path is unique per company; no project or bot selector."
          : scope === "mission" ?
            "Pick the project this file belongs to."
          : "Pick the LiNKbot this file belongs to. Standard bot-facing filenames apply."}
        </p>
      </div>

      <div className="space-y-2">
        <label className={FORM.fieldStack}>
          <span className={`${FIELD.label} text-xs text-zinc-500 dark:text-zinc-400`}>Virtual file path</span>
          <InsetSelect
            value={pathPreset}
            onChange={(e) => setPathPreset(e.target.value)}
            aria-label="Preset virtual path"
          >
            {PATH_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </InsetSelect>
        </label>
        {pathPreset === "__custom__" ? (
          <input
            type="text"
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            placeholder="e.g. memory/2026-04-15.md"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
            aria-label="Custom virtual path"
          />
        ) : null}
        {pathPreset === "__custom__" && !customPath.trim() ? (
          <p className="text-xs text-amber-800 dark:text-amber-200">Enter a custom path before submitting.</p>
        ) : null}
      </div>

      {scope === "mission" ?
        <label className={FORM.fieldStack}>
          <span className={`${FIELD.label} text-xs text-zinc-500 dark:text-zinc-400`}>Project</span>
          <InsetSelect
            name="missionId"
            value={missionId}
            onChange={(e) => setMissionId(e.target.value)}
            required={props.missions.length > 0}
          >
            <option value="">Select a project…</option>
            {props.missions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </InsetSelect>
          {props.missions.length === 0 ?
            <p className="text-xs text-amber-800 dark:text-amber-200">
              No projects yet. Create a project first, then return here.
            </p>
          : <p className={`${FORM.hint} text-zinc-500 dark:text-zinc-400`}>Required for this scope.</p>}
        </label>
      : (
        <input type="hidden" name="missionId" value="" />
      )}

      {scope === "agent" ?
        <label className={FORM.fieldStack}>
          <span className={`${FIELD.label} text-xs text-zinc-500 dark:text-zinc-400`}>LiNKbot</span>
          <InsetSelect
            name="agentId"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            required={props.agents.length > 0}
          >
            <option value="">Select a LiNKbot…</option>
            {props.agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.display_name}
              </option>
            ))}
          </InsetSelect>
          {props.agents.length === 0 ?
            <p className="text-xs text-amber-800 dark:text-amber-200">
              No LiNKbots yet. Create an agent first, then return here.
            </p>
          : <p className={`${FORM.hint} text-zinc-500 dark:text-zinc-400`}>Required for this scope.</p>}
        </label>
      : (
        <input type="hidden" name="agentId" value="" />
      )}

      <div className="space-y-2">
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Collective memory tags</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Required when this item is created. Tags travel with the submission to collective LiNKbrain after approval and
          anonymisation.
        </p>
        <MemoryItemTagFields />
      </div>

      <div>
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
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
        <Link href={hrefForTab("project")} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-700">
          Cancel
        </Link>
      </div>
    </form>
  );
}
