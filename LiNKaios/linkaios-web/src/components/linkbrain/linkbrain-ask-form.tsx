"use client";

import { useMemo } from "react";

import { InsetSelect } from "@/components/forms";
import { useLicensorScope } from "@/components/role-preview-provider";
import { useMemoryPath } from "@/hooks/use-memory-href";
import { isAdminViewScope, isAllLicenseesScope, isPlatformAllScope, isSingleLicenseeScope, ADMIN_SCOPE, ALL_LICENSEES_SCOPE, PLATFORM_ALL_SCOPE } from "@/lib/app-roles";
import type { LinkbrainPageData } from "@/lib/linkbrain-data";
import { LICENSEE_REGISTRY } from "@/lib/licensee-registry";
import { LICENSOR_SCOPE_PARAM } from "@/lib/licensor-view-scope";
import { MODULES_CATALOG_DEMO } from "@/lib/ui-mocks/modules-catalog-demo";
import { FIELD, FORM } from "@/lib/ui-standards";

import type { BrainRetrieveStage } from "@linktrend/linklogic-sdk";

const RETRIEVE_DEPTH_OPTIONS: { value: BrainRetrieveStage; label: string }[] = [
  { value: "full", label: "Summary + passages" },
  { value: "orientation", label: "Overview only" },
  { value: "index_cards", label: "Document summaries" },
  { value: "chunks", label: "Passages only" },
];

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
  licensorCollective?: boolean;
}) {
  const hrefForPath = useMemoryPath();
  const { scope: viewScope } = useLicensorScope();
  const modules = useMemo(
    () => MODULES_CATALOG_DEMO.modules.filter((m) => m.published).map((m) => ({ id: m.id, name: m.name })),
    [],
  );

  const collectiveCompanyValue = isSingleLicenseeScope(viewScope)
    ? viewScope
    : props.brainCompanyId ?? "";
  const showCollectiveCompanyPicker =
    props.licensorCollective &&
    (isPlatformAllScope(viewScope) || isAllLicenseesScope(viewScope)) &&
    !isAdminViewScope(viewScope);

  return (
    <form method="get" action={hrefForPath("/memory")} className="space-y-5 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <input type="hidden" name="tab" value="ask" />
      <input type="hidden" name="b_path" value={props.sandboxPath ?? ""} />

      {props.licensorCollective ? (
        <label htmlFor="ask-view-scope" className={`block max-w-xl ${FORM.fieldStack}`}>
          <span className={`${FIELD.label} text-sm text-zinc-900 dark:text-zinc-100`}>View scope</span>
          <InsetSelect id="ask-view-scope" name={LICENSOR_SCOPE_PARAM} defaultValue={viewScope}>
            <option value={PLATFORM_ALL_SCOPE}>All</option>
            <option value={ADMIN_SCOPE}>Admin</option>
            <option value={ALL_LICENSEES_SCOPE}>All licensees</option>
            {LICENSEE_REGISTRY.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </InsetSelect>
        </label>
      ) : null}

      {props.licensorCollective ? (
        showCollectiveCompanyPicker ? null : (
          <input type="hidden" name="b_company" value={collectiveCompanyValue} />
        )
      ) : (
        <label htmlFor="ask-b-company" className={`block max-w-xl ${FORM.fieldStack}`}>
          <span className={`${FIELD.label} text-sm text-zinc-900 dark:text-zinc-100`}>Company</span>
          <InsetSelect id="ask-b-company" name="b_company" defaultValue={props.brainCompanyId ?? ""}>
            <option value="">None</option>
            {props.data.legalEntities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </InsetSelect>
        </label>
      )}

      {props.licensorCollective ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Ask scope uses View above (All, Admin, All licensees, or one licensee). Sidebar View stays in sync.
        </p>
      ) : null}

      <label htmlFor="ask-b-module" className={`block max-w-xl ${FORM.fieldStack}`}>
        <span className={`${FIELD.label} text-sm text-zinc-900 dark:text-zinc-100`}>Suite</span>
        <InsetSelect id="ask-b-module" name="b_module" defaultValue={props.brainModuleId ?? ""}>
          <option value="">None</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </InsetSelect>
      </label>

      <label htmlFor="ask-b-mission" className={`block max-w-xl ${FORM.fieldStack}`}>
        <span className={`${FIELD.label} text-sm text-zinc-900 dark:text-zinc-100`}>
          {props.licensorCollective ? "Project" : "Project"}
        </span>
        <InsetSelect id="ask-b-mission" name="b_mission" defaultValue={props.brainMissionId ?? ""}>
          <option value="">None</option>
          {props.data.missions.map((m) => (
            <option key={m.id} value={String(m.id)}>
              {m.title}
            </option>
          ))}
        </InsetSelect>
      </label>

      <label htmlFor="ask-b-agent" className={`block max-w-xl ${FORM.fieldStack}`}>
        <span className={`${FIELD.label} text-sm text-zinc-900 dark:text-zinc-100`}>LiNKbot</span>
        <InsetSelect id="ask-b-agent" name="b_agent" defaultValue={props.brainAgentId ?? ""}>
          <option value="">None</option>
          {props.data.agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.display_name}
            </option>
          ))}
        </InsetSelect>
      </label>

      <label htmlFor="ask-b-file" className={`block max-w-xl ${FORM.fieldStack}`}>
        <span className={`${FIELD.label} text-sm text-zinc-900 dark:text-zinc-100`}>Document (optional)</span>
        <InsetSelect id="ask-b-file" name="b_file" defaultValue={props.askSelectedFileId ?? ""}>
          <option value="">All documents in scope</option>
          {props.data.brainPartitionFiles.map((f) => (
            <option key={f.id} value={f.id}>
              {f.logical_path}
            </option>
          ))}
        </InsetSelect>
      </label>

      <label htmlFor="ask-b-stage" className={`block max-w-xl ${FORM.fieldStack}`}>
        <span className={`${FIELD.label} text-sm text-zinc-900 dark:text-zinc-100`}>Answer depth</span>
        <InsetSelect id="ask-b-stage" name="b_stage" defaultValue={props.brainRetrieveStage}>
          {RETRIEVE_DEPTH_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </InsetSelect>
      </label>

      <label htmlFor="ask-b-query" className={`block max-w-xl ${FORM.fieldStack}`}>
        <span className={`${FIELD.label} text-sm text-zinc-900 dark:text-zinc-100`}>Question</span>
        <input
          id="ask-b-query"
          name="b_query"
          type="text"
          defaultValue={props.sandboxQuery ?? ""}
          placeholder="What do you need to find?"
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Search {props.licensorCollective ? "Collective LiNKbrain" : "LiNKbrain"}
      </button>
    </form>
  );
}
