"use client";

import { useRouter } from "next/navigation";

import { MemoryAgentSelect, MemoryProjectSelect } from "@/components/linkbrain/linkbrain-filters";
import { InsetSelect } from "@/components/forms";
import { useMemoryHref } from "@/hooks/use-memory-href";
import type { LinkbrainPageData } from "@/lib/linkbrain-data";
import { FIELD, FORM } from "@/lib/ui-standards";
import type { BrainScope } from "@linktrend/linklogic-sdk";

/** Narrow Ask LiNKbrain retrieval — scope + project/LiNKbot before document/question. */
export function LinkbrainAskNarrowing(props: {
  data: LinkbrainPageData;
  brainScope: BrainScope;
  brainMissionId?: string;
  brainAgentId?: string;
  missionFilter?: string;
  agentFilter?: string;
  orgNodeId?: string;
}) {
  const router = useRouter();
  const hrefForTab = useMemoryHref();

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        Narrow where to search first — LiNKbrain can be large. This preview shows what LiNKbots and automations would
        retrieve under the same scope rules.
      </p>
      <label className={`block max-w-xl ${FORM.fieldStack}`}>
        <span className={`${FIELD.label} text-xs text-zinc-500 dark:text-zinc-400`}>Memory scope</span>
        <InsetSelect
          fullWidth={false}
          value={props.brainScope}
          aria-label="Retrieval scope"
          onChange={(e) => {
            const scope = e.target.value as BrainScope;
            router.push(
              hrefForTab("ask", {
                brainScope: scope === "company" ? undefined : scope,
                brainMission: scope === "mission" ? props.brainMissionId : undefined,
                brainAgent: scope === "agent" ? props.brainAgentId : undefined,
                mission: props.missionFilter,
                agent: props.agentFilter,
                org: props.orgNodeId,
              }),
            );
          }}
        >
          <option value="company">Company memory</option>
          <option value="mission">Project memory</option>
          <option value="agent">LiNKbot memory</option>
        </InsetSelect>
      </label>
      {props.brainScope === "mission" ? (
        <label className={`block max-w-xl ${FORM.fieldStack}`}>
          <span className={`${FIELD.label} text-xs text-zinc-500 dark:text-zinc-400`}>Project</span>
          <MemoryProjectSelect
            missions={props.data.missions.map((m) => ({ id: String(m.id), title: m.title }))}
            selectedMissionId={props.brainMissionId ?? props.missionFilter}
            memoryTab="ask"
            brainScope="mission"
          />
        </label>
      ) : null}
      {props.brainScope === "agent" ? (
        <label className={`block max-w-xl ${FORM.fieldStack}`}>
          <span className={`${FIELD.label} text-xs text-zinc-500 dark:text-zinc-400`}>LiNKbot</span>
          <MemoryAgentSelect
            agents={props.data.agents}
            selectedAgentId={props.brainAgentId ?? props.agentFilter}
            memoryTab="ask"
            brainScope="agent"
          />
        </label>
      ) : null}
    </div>
  );
}
