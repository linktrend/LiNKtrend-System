import Link from "next/link";

import { LinkbrainAddInboxPanel } from "@/components/linkbrain/linkbrain-add-inbox-panel";
import { LinkbrainAskNarrowing } from "@/components/linkbrain/linkbrain-ask-narrowing";
import { CompanyOrgNarrowSelect, MemoryAgentSelect, MemoryProjectSelect } from "@/components/linkbrain/linkbrain-filters";
import { inboxItemTypeLabel, brainFileKindLabel } from "@/components/linkbrain/linkbrain-labels";
import { LinkbrainInboxRow } from "@/components/linkbrain/linkbrain-inbox-row";
import { LinkbrainMemoryDocList } from "@/components/linkbrain/linkbrain-memory-doc-row";
import { LinkbrainWorkspaceFooter } from "@/components/linkbrain/linkbrain-workspace-footer";
import { memoryHref } from "@/lib/memory-href";
import type { LinkbrainPageData, LinkbrainTab } from "@/lib/linkbrain-data";
import { BUTTON } from "@/lib/ui-standards";

import type {
  BrainInboxItemType,
  BrainRetrieveContextResult,
  BrainRetrieveStage,
  BrainScope,
} from "@linktrend/linklogic-sdk";

function ScopeBadge(props: { tone: "client" | "vendor" | "shared"; text: string }) {
  const cls =
    props.tone === "client"
      ? "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200"
      : props.tone === "vendor"
        ? "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200"
        : "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>{props.text}</span>;
}

export function MemoryCommandCentre(props: {
  tab: LinkbrainTab;
  data: LinkbrainPageData;
  missionFilter?: string;
  classificationFilter?: string;
  agentFilter?: string;
  scope: "recent" | "all";
  brainScope: BrainScope;
  brainMissionId?: string;
  brainAgentId?: string;
  orgNodeId?: string;
  sandboxPath?: string;
  sandboxQuery?: string;
  askSelectedFileId?: string;
  inboxItemType?: BrainInboxItemType | null;
  inboxSort?: "asc" | "desc";
  brainFileKindFilter?: string | null;
  brainSandbox: BrainRetrieveContextResult | null;
  brainRetrieveStage: BrainRetrieveStage;
}) {
  const { tab, data } = props;
  const defaultLegalEntityId = data.legalEntities[0]?.id ?? "";

  if (data.error) {
    return <p className="text-sm text-red-700 dark:text-red-300">{data.error}</p>;
  }

  const projectTitle = data.missions.find((m) => String(m.id) === props.missionFilter)?.title;
  const agentTitle = data.agents.find((a) => a.id === props.agentFilter)?.display_name;

  return (
    <div className="space-y-10">
      {tab === "inbox" ? (
        <section className="space-y-4">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            All knowledge additions — from operators, LiNKbots, or imports — land here first. Edit, then{" "}
            <strong>Approve</strong> to record in LiNKbrain or <strong>Reject</strong> to discard.
          </p>
          {data.brainMetaError ? <p className="text-sm text-amber-800 dark:text-amber-200">{data.brainMetaError}</p> : null}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium text-zinc-600 dark:text-zinc-400">Type:</span>
            <Link
              href={memoryHref("inbox", { mission: props.missionFilter, agent: props.agentFilter, org: props.orgNodeId })}
              className={`rounded-full border px-2.5 py-1 ${!props.inboxItemType ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900" : "border-zinc-200 dark:border-zinc-700"}`}
            >
              All
            </Link>
            {(["upload", "quick_note", "librarian", "edit_proposal", "standard"] as const).map((t) => (
              <Link
                key={t}
                href={memoryHref("inbox", {
                  mission: props.missionFilter,
                  agent: props.agentFilter,
                  org: props.orgNodeId,
                  inboxItem: t,
                })}
                className={`rounded-full border px-2.5 py-1 ${props.inboxItemType === t ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900" : "border-zinc-200 dark:border-zinc-700"}`}
              >
                {inboxItemTypeLabel(t)}
              </Link>
            ))}
            <span className="ml-2 font-medium text-zinc-600 dark:text-zinc-400">Sort:</span>
            <Link
              href={memoryHref("inbox", {
                mission: props.missionFilter,
                agent: props.agentFilter,
                org: props.orgNodeId,
                inboxItem: props.inboxItemType ?? undefined,
              })}
              className={`rounded-full border px-2.5 py-1 ${props.inboxSort !== "asc" ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900" : "border-zinc-200 dark:border-zinc-700"}`}
            >
              Newest
            </Link>
            <Link
              href={memoryHref("inbox", {
                mission: props.missionFilter,
                agent: props.agentFilter,
                org: props.orgNodeId,
                inboxItem: props.inboxItemType ?? undefined,
                inboxSort: "asc",
              })}
              className={`rounded-full border px-2.5 py-1 ${props.inboxSort === "asc" ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900" : "border-zinc-200 dark:border-zinc-700"}`}
            >
              Oldest
            </Link>
          </div>
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
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Select a project to view approved memory. To add or change items, use the panel below — new content goes to{" "}
            <strong>Inbox</strong> for approval first.
          </p>
          <div className="flex flex-wrap gap-2">
            <ScopeBadge tone="client" text="Client view" />
            <ScopeBadge tone="shared" text="Shared published" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Project</label>
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
              <LinkbrainAddInboxPanel
                scope="mission"
                contextLabel={projectTitle ?? "Selected project"}
                returnTab="project"
                legalEntityId={defaultLegalEntityId}
                missionId={props.missionFilter}
              />
              <Link href={`/memory/drafts/new?scope=mission&missionId=${encodeURIComponent(props.missionFilter)}`} className={BUTTON.secondaryRow}>
                New structured draft
              </Link>
            </>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a project to list governed documents.</p>
          )}
        </section>
      ) : null}

      {tab === "agent" ? (
        <section className="space-y-6">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Select a LiNKbot to view approved memory for this tenant. Additions go to <strong>Inbox</strong> before they
            are recorded.
          </p>
          <div className="flex flex-wrap gap-2">
            <ScopeBadge tone="client" text="Client view" />
            <ScopeBadge tone="shared" text="Shared published" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">LiNKbot</label>
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
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Filter by kind:</span>
                <Link
                  href={memoryHref("agent", {
                    agent: props.agentFilter,
                    classification: props.classificationFilter,
                    scope: props.scope === "all" ? "all" : undefined,
                    brainScope: "agent",
                    brainAgent: props.agentFilter,
                  })}
                  className={`rounded-full border px-2.5 py-1 ${!props.brainFileKindFilter ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900" : "border-zinc-200 dark:border-zinc-700"}`}
                >
                  All kinds
                </Link>
                {(["standard", "daily_log", "upload", "librarian", "quick_note"] as const).map((k) => (
                  <Link
                    key={k}
                    href={memoryHref("agent", {
                      agent: props.agentFilter,
                      classification: props.classificationFilter,
                      scope: props.scope === "all" ? "all" : undefined,
                      brainScope: "agent",
                      brainAgent: props.agentFilter,
                      bKind: k,
                    })}
                    className={`rounded-full border px-2.5 py-1 ${props.brainFileKindFilter === k ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900" : "border-zinc-200 dark:border-zinc-700"}`}
                  >
                    {brainFileKindLabel(k)}
                  </Link>
                ))}
              </div>
              <LinkbrainMemoryDocList
                files={data.brainPartitionFiles}
                scopeLabel={agentTitle ?? "LiNKbot"}
                agentId={props.agentFilter}
              />
              <LinkbrainAddInboxPanel
                scope="agent"
                contextLabel={agentTitle ?? "Selected LiNKbot"}
                returnTab="agent"
                legalEntityId={defaultLegalEntityId}
                agentId={props.agentFilter}
              />
              <Link href={`/memory/drafts/new?scope=agent&agentId=${encodeURIComponent(props.agentFilter)}`} className={BUTTON.secondaryRow}>
                New structured draft
              </Link>
            </>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a LiNKbot to list governed documents.</p>
          )}
        </section>
      ) : null}

      {tab === "company" ? (
        <section className="space-y-6">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Company memory for this tenant. There is one company context — view approved items below and add new knowledge
            through Inbox approval.
          </p>
          <div className="flex flex-wrap gap-2">
            <ScopeBadge tone="client" text="Client view" />
            <ScopeBadge tone="vendor" text="Vendor-only (hidden)" />
          </div>
          {data.orgMetaError ? <p className="text-sm text-amber-800 dark:text-amber-200">{data.orgMetaError}</p> : null}
          <CompanyOrgNarrowSelect nodes={data.orgNodes} selectedOrgId={props.orgNodeId} />
          {data.brainMetaError ? <p className="text-sm text-amber-800 dark:text-amber-200">{data.brainMetaError}</p> : null}
          <LinkbrainMemoryDocList files={data.brainPartitionFiles} scopeLabel="Company" />
          <LinkbrainAddInboxPanel
            scope="company"
            contextLabel="Company-wide"
            returnTab="company"
            legalEntityId={defaultLegalEntityId}
          />
          <Link href="/memory/drafts/new?scope=company" className={BUTTON.secondaryRow}>
            New structured draft
          </Link>
        </section>
      ) : null}

      {tab === "ask" ? (
        <section className="space-y-4">
          <LinkbrainAskNarrowing
            data={data}
            brainScope={props.brainScope}
            brainMissionId={props.brainMissionId}
            brainAgentId={props.brainAgentId}
            missionFilter={props.missionFilter}
            agentFilter={props.agentFilter}
            orgNodeId={props.orgNodeId}
          />
          <form method="get" action="/memory" className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <input type="hidden" name="tab" value="ask" />
            <input type="hidden" name="b_scope" value={props.brainScope} />
            <input type="hidden" name="b_path" value={props.sandboxPath ?? ""} />
            {props.brainMissionId ? <input type="hidden" name="b_mission" value={props.brainMissionId} /> : null}
            {props.brainAgentId ? <input type="hidden" name="b_agent" value={props.brainAgentId} /> : null}
            <div>
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Document (optional narrow step)</label>
              <select
                name="b_file"
                defaultValue={props.askSelectedFileId ?? ""}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="">All documents in scope…</option>
                {data.brainPartitionFiles.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.logical_path}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Question</label>
              <input
                name="b_query"
                type="text"
                defaultValue={props.sandboxQuery ?? ""}
                placeholder="What do you need to find?"
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Retrieval depth</label>
              <select
                name="b_stage"
                defaultValue={props.brainRetrieveStage}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="full">Full (cards + passages)</option>
                <option value="orientation">Orientation (company map + doc cards)</option>
                <option value="index_cards">Index cards only</option>
                <option value="chunks">Passages only</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Preview retrieval
            </button>
          </form>
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
                        <li key={c.chunkId} className="text-sm whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
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

      <LinkbrainWorkspaceFooter overviewBrain={data.overviewBrain} />
    </div>
  );
}
