"use client";

import { useMemo } from "react";

import type { LinkbrainPageData } from "@/lib/linkbrain-data";
import { MODULES_CATALOG_DEMO } from "@/lib/ui-mocks/modules-catalog-demo";

import type { BrainRetrieveStage } from "@linktrend/linklogic-sdk";

const RETRIEVE_DEPTH_OPTIONS: { value: BrainRetrieveStage; label: string }[] = [
  { value: "full", label: "Summary + passages" },
  { value: "orientation", label: "Overview only" },
  { value: "index_cards", label: "Document summaries" },
  { value: "chunks", label: "Passages only" },
];

const selectClass =
  "w-full max-w-xl rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function LinkbrainAskForm(props: {
  data: LinkbrainPageData;
  brainCompanyId?: string;
  brainModuleId?: string;
  brainMissionId?: string;
  brainAgentId?: string;
  sandboxPath?: string;
  sandboxQuery?: string;
  askSelectedFileId?: string;
  brainRetrieveStage: BrainRetrieveStage;
}) {
  const modules = useMemo(
    () => MODULES_CATALOG_DEMO.modules.filter((m) => m.published).map((m) => ({ id: m.id, name: m.name })),
    [],
  );

  return (
    <form method="get" action="/memory" className="space-y-5 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <input type="hidden" name="tab" value="ask" />
      <input type="hidden" name="b_path" value={props.sandboxPath ?? ""} />

      <div>
        <label htmlFor="ask-b-company" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Company
        </label>
        <select id="ask-b-company" name="b_company" defaultValue={props.brainCompanyId ?? ""} className={selectClass}>
          <option value="">None</option>
          {props.data.legalEntities.map((entity) => (
            <option key={entity.id} value={entity.id}>
              {entity.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ask-b-module" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Suite
        </label>
        <select id="ask-b-module" name="b_module" defaultValue={props.brainModuleId ?? ""} className={selectClass}>
          <option value="">None</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ask-b-mission" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Project
        </label>
        <select id="ask-b-mission" name="b_mission" defaultValue={props.brainMissionId ?? ""} className={selectClass}>
          <option value="">None</option>
          {props.data.missions.map((m) => (
            <option key={m.id} value={String(m.id)}>
              {m.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ask-b-agent" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          LiNKbot
        </label>
        <select id="ask-b-agent" name="b_agent" defaultValue={props.brainAgentId ?? ""} className={selectClass}>
          <option value="">None</option>
          {props.data.agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.display_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ask-b-file" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Document (optional)
        </label>
        <select id="ask-b-file" name="b_file" defaultValue={props.askSelectedFileId ?? ""} className={selectClass}>
          <option value="">All documents in scope</option>
          {props.data.brainPartitionFiles.map((f) => (
            <option key={f.id} value={f.id}>
              {f.logical_path}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ask-b-stage" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Answer depth
        </label>
        <select
          id="ask-b-stage"
          name="b_stage"
          defaultValue={props.brainRetrieveStage}
          className={selectClass}
        >
          {RETRIEVE_DEPTH_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ask-b-query" className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Question
        </label>
        <input
          id="ask-b-query"
          name="b_query"
          type="text"
          defaultValue={props.sandboxQuery ?? ""}
          placeholder="What do you need to find?"
          className="w-full max-w-xl rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Search LiNKbrain
      </button>
    </form>
  );
}
