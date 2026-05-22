
import { LinkbrainAskForm } from "@/components/linkbrain/linkbrain-ask-form";
import { LinkbrainAuditPanel } from "@/components/linkbrain/linkbrain-audit-panel";
import { LinkbrainOrgScopePanel } from "@/components/linkbrain/linkbrain-org-scope-panel";
import { LinkbrainMemoryDocList } from "@/components/linkbrain/linkbrain-memory-doc-row";
import { CompanyOrgNarrowSelect, MemoryAgentSelect, MemoryProjectSelect } from "@/components/linkbrain/linkbrain-filters";
import { LinkbrainInboxRow } from "@/components/linkbrain/linkbrain-inbox-row";
import { LinkbrainInboxToolbar } from "@/components/linkbrain/linkbrain-inbox-toolbar";
import type { InboxSubmissionSource } from "@/components/linkbrain/linkbrain-labels";
import type { LinkbrainPageData, LinkbrainTab } from "@/lib/linkbrain-data";

import type { BrainRetrieveContextResult, BrainRetrieveStage } from "@linktrend/linklogic-sdk";

export function MemoryCommandCentre(props: {
  tab: LinkbrainTab;
  data: LinkbrainPageData;
  missionFilter?: string;
  classificationFilter?: string;
  agentFilter?: string;
  scope: "recent" | "all";
  brainCompanyId?: string;
  brainModuleId?: string;
  brainMissionId?: string;
  brainAgentId?: string;
  orgNodeId?: string;
  sandboxPath?: string;
  sandboxQuery?: string;
  askSelectedFileId?: string;
  inboxSource?: Exclude<InboxSubmissionSource, "all"> | null;
  inboxSort?: "asc" | "desc";
  brainFileKindFilter?: string | null;
  brainSandbox: BrainRetrieveContextResult | null;
  brainRetrieveStage: BrainRetrieveStage;
}) {
  const { tab, data } = props;

  if (data.error) {
    return <p className="text-sm text-red-700 dark:text-red-300">{data.error}</p>;
  }

  const projectTitle = data.missions.find((m) => String(m.id) === props.missionFilter)?.title;
  const agentTitle = data.agents.find((a) => a.id === props.agentFilter)?.display_name;

  return (
    <div className="space-y-10">
      {tab === "inbox" ? (
        <section className="space-y-4">
          {data.brainMetaError ? <p className="text-sm text-amber-800 dark:text-amber-200">{data.brainMetaError}</p> : null}
          <LinkbrainInboxToolbar
            missionFilter={props.missionFilter}
            agentFilter={props.agentFilter}
            orgNodeId={props.orgNodeId}
            inboxSource={props.inboxSource ?? "all"}
            inboxSort={props.inboxSort}
          />
          <ul className="space-y-3">
            {data.brainDrafts.length === 0 ? (
              <li className="text-sm text-zinc-500 dark:text-zinc-400">No drafts in Inbox.</li>
            ) : (
              data.brainDrafts.map((d) => <LinkbrainInboxRow key={d.id} draft={d} data={data} />)
            )}
          </ul>
        </section>
      ) : null}

      {tab === "project" ? (
        <section className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Project
            </label>
            <MemoryProjectSelect
              missions={data.missions.map((m) => ({ id: String(m.id), title: m.title }))}
              selectedMissionId={props.missionFilter}
              classification={props.classificationFilter}
              scope={props.scope}
            />
          </div>
          {props.missionFilter ? (
            <>
              {data.brainMetaError || data.orgMetaError ? (
                <p className="text-sm text-amber-800 dark:text-amber-200">{data.brainMetaError ?? data.orgMetaError}</p>
              ) : null}
              <LinkbrainMemoryDocList
                files={data.brainPartitionFiles}
                scopeLabel={projectTitle ?? "Project"}
                missionId={props.missionFilter}
              />
            </>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a project to list approved memory.</p>
          )}
        </section>
      ) : null}

      {tab === "agent" ? (
        <section className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              LiNKbot
            </label>
            <MemoryAgentSelect
              agents={data.agents}
              selectedAgentId={props.agentFilter}
              classification={props.classificationFilter}
              scope={props.scope}
            />
          </div>
          {props.agentFilter ? (
            <>
              {data.brainMetaError || data.orgMetaError ? (
                <p className="text-sm text-amber-800 dark:text-amber-200">{data.brainMetaError ?? data.orgMetaError}</p>
              ) : null}
              <LinkbrainMemoryDocList
                files={data.brainPartitionFiles}
                scopeLabel={agentTitle ?? "LiNKbot"}
                agentId={props.agentFilter}
              />
            </>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a LiNKbot to list approved memory.</p>
          )}
        </section>
      ) : null}

      {tab === "company" ? (
        <section className="space-y-6">
          {data.orgMetaError ? <p className="text-sm text-amber-800 dark:text-amber-200">{data.orgMetaError}</p> : null}
          <CompanyOrgNarrowSelect nodes={data.orgNodes} selectedOrgId={props.orgNodeId} />
          {data.brainMetaError ? <p className="text-sm text-amber-800 dark:text-amber-200">{data.brainMetaError}</p> : null}
          <LinkbrainMemoryDocList files={data.brainPartitionFiles} scopeLabel="Company" />
        </section>
      ) : null}

      {tab === "ask" ? (
        <section className="space-y-4">
          <LinkbrainAskForm
            data={data}
            brainCompanyId={props.brainCompanyId}
            brainModuleId={props.brainModuleId}
            brainMissionId={props.brainMissionId}
            brainAgentId={props.brainAgentId}
            sandboxPath={props.sandboxPath}
            sandboxQuery={props.sandboxQuery}
            askSelectedFileId={props.askSelectedFileId}
            brainRetrieveStage={props.brainRetrieveStage}
          />
          {props.brainSandbox ? (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
              {props.brainSandbox.error ? (
                <p className="text-sm text-red-700 dark:text-red-300">{props.brainSandbox.error}</p>
              ) : null}
              {!props.brainSandbox.fileId && props.sandboxPath ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  No published document at this path for the current scope.
                </p>
              ) : null}
              {props.brainSandbox.indexCards.length > 0 || props.brainSandbox.relevantChunks.length > 0 ? (
                <>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">What LiNKbrain would return</h3>
                  {props.brainSandbox.indexCards.length > 0 ? (
                    <ul className="mt-2 space-y-2">
                      {props.brainSandbox.indexCards.map((c) => (
                        <li key={c.card_key} className="text-sm">
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">{c.title}</span>
                          <p className="text-zinc-600 dark:text-zinc-400">{c.summary}</p>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {props.brainSandbox.relevantChunks.length > 0 ? (
                    <ul className="mt-4 space-y-3">
                      {props.brainSandbox.relevantChunks.map((c) => (
                        <li key={c.chunkId} className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
                          {c.content}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ) : props.sandboxQuery ? (
                <p className="text-sm text-zinc-500">No matching passages in this scope yet.</p>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === "audit" ? <LinkbrainAuditPanel /> : null}

      {tab === "orgScope" ? <LinkbrainOrgScopePanel nodes={data.orgNodes} orgMetaError={data.orgMetaError} /> : null}
    </div>
  );
}
