"use client";

import { useRouter } from "next/navigation";

import { MemoryAgentSelect, MemoryProjectSelect } from "@/components/linkbrain/linkbrain-filters";
import { memoryHref } from "@/lib/memory-href";
import type { LinkbrainPageData } from "@/lib/linkbrain-data";
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

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        Narrow where to search first — LiNKbrain can be large. This preview shows what LiNKbots and automations would
        retrieve under the same scope rules.
      </p>
      <div>
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Memory scope</label>
        <select
          className="mt-2 w-full max-w-xl rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          value={props.brainScope}
          aria-label="Retrieval scope"
          onChange={(e) => {
            const scope = e.target.value as BrainScope;
            router.push(
              memoryHref("ask", {
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
        </select>
      </div>
      {props.brainScope === "mission" ? (
        <div>
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Project</label>
          <MemoryProjectSelect
            missions={props.data.missions.map((m) => ({ id: String(m.id), title: m.title }))}
            selectedMissionId={props.brainMissionId ?? props.missionFilter}
            memoryTab="ask"
            brainScope="mission"
          />
        </div>
      ) : null}
      {props.brainScope === "agent" ? (
        <div>
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">LiNKbot</label>
          <MemoryAgentSelect
            agents={props.data.agents}
            selectedAgentId={props.brainAgentId ?? props.agentFilter}
            memoryTab="ask"
            brainScope="agent"
          />
        </div>
      ) : null}
    </div>
  );
}
