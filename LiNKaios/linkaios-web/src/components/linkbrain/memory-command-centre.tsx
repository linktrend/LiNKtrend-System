import Link from "next/link";

import { CompanyOrgNarrowSelect, MemoryAgentSelect, MemoryProjectSelect } from "@/components/linkbrain/linkbrain-filters";
import { memoryHref } from "@/lib/memory-href";
import {
  createQuickNoteDraftAction,
  publishBrainDraftFromInboxForm,
  rejectBrainDraftFromForm,
  uploadBrainBinaryFromForm,
} from "@/app/(shell)/memory/brain-actions";
import type { LinkbrainPageData, LinkbrainTab } from "@/lib/linkbrain-data";
import { BADGE, BUTTON } from "@/lib/ui-standards";

import {
  summarizeBrainInboxTextDiff,
  type BrainInboxItemType,
  type BrainInboxRow,
  type BrainRetrieveContextResult,
  type BrainRetrieveStage,
  type BrainScope,
  type BrainVirtualFileEnriched,
} from "@linktrend/linklogic-sdk";

function kindLabel(k: string): string {
  if (k === "daily_log") return "Daily log (append-only)";
  if (k === "quick_note") return "Quick note";
  if (k === "librarian") return "Librarian proposal";
  if (k === "upload") return "Upload";
  return "Standard";
}

function inboxSourceLine(d: BrainInboxRow, data: LinkbrainPageData): string {
  if (d.scope === "company") return "Source: company-wide knowledge";
  if (d.scope === "mission" && d.mission_id) {
    const hit = data.missionRows.find((r) => String(r.mission.id) === String(d.mission_id));
    return hit ? `Source: project “${hit.mission.title}”` : `Source: project id ${d.mission_id}`;
  }
  if (d.scope === "agent" && d.agent_id) {
    const hit = data.agents.find((a) => a.id === d.agent_id);
    return hit ? `Source: LiNKbot “${hit.display_name}”` : `Source: LiNKbot id ${d.agent_id}`;
  }
  return `Source: ${d.scope} scope`;
}

function BrainPartitionDocTable(props: {
  files: BrainVirtualFileEnriched[];
  mission?: string;
  classification?: string;
  agent?: string;
  scope?: "recent" | "all";
  org?: string;
}) {
  if (props.files.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">No governed documents in this partition yet.</p>;
  }
  return (
    <ul className="mt-4 space-y-2">
      {props.files.map((f) => (
        <li
          key={f.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{f.logical_path}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {kindLabel(f.file_kind)} · {f.sensitivity}
              {f.has_published ? (
                <span className="ml-2 text-emerald-700 dark:text-emerald-400">Available</span>
              ) : (
                <span className="ml-2 text-amber-800 dark:text-amber-200">Not yet available</span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link href={`/memory/files/${f.id}`} className="text-sky-700 underline dark:text-sky-400">
              Open
            </Link>
            <Link
              href={`/memory/drafts/new?scope=${encodeURIComponent(f.scope)}&logicalPath=${encodeURIComponent(f.logical_path)}${f.mission_id ? `&missionId=${encodeURIComponent(f.mission_id)}` : ""}${f.agent_id ? `&agentId=${encodeURIComponent(f.agent_id)}` : ""}`}
              className="text-zinc-700 underline dark:text-zinc-300"
            >
              New draft
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
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

  return (
    <div className="space-y-10">
      {tab === "project" ? (
        <section className="space-y-6">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Choose a <strong>project</strong> to see its LiNKbrain documents. Notes and uploads land in{" "}
            <strong>Inbox</strong> until you approve them.
          </p>
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
              <BrainPartitionDocTable
                files={data.brainPartitionFiles}
                mission={props.missionFilter}
                classification={props.classificationFilter}
                agent={props.agentFilter}
                scope={props.scope}
              />
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Quick note → Inbox</h3>
                <form action={createQuickNoteDraftAction} className="mt-3 space-y-2">
                  <input type="hidden" name="scope" value="mission" />
                  <input type="hidden" name="missionId" value={props.missionFilter} />
                  <input type="hidden" name="returnTab" value="project" />
                  <input type="hidden" name="legalEntityId" value={defaultLegalEntityId} />
                  <textarea
                    name="noteBody"
                    rows={4}
                    placeholder="Short note (markdown)"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">Sensitivity</label>
                  <select name="sensitivity" className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950">
                    <option value="internal">internal</option>
                    <option value="public">public</option>
                    <option value="confidential">confidential</option>
                    <option value="restricted">restricted</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    Save to inbox as draft
                  </button>
                </form>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Binary upload → Inbox</h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">PDF, images, plain text, or markdown (up to 25 MiB).</p>
                <form action={uploadBrainBinaryFromForm} encType="multipart/form-data" className="mt-3 space-y-2">
                  <input type="hidden" name="scope" value="mission" />
                  <input type="hidden" name="missionId" value={props.missionFilter} />
                  <input type="hidden" name="returnTab" value="project" />
                  <input type="hidden" name="legalEntityId" value={defaultLegalEntityId} />
                  <input type="hidden" name="sensitivity" value="internal" />
                  <input type="file" name="file" required className="block w-full text-sm" />
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                  >
                    Upload to inbox
                  </button>
                </form>
              </div>
              <div>
                <Link
                  href={`/memory/drafts/new?scope=mission&missionId=${encodeURIComponent(props.missionFilter)}`}
                  className={BUTTON.secondaryRow}
                >
                  New draft for this project
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a project to list governed documents.</p>
          )}
        </section>
      ) : null}

      {tab === "agent" ? (
        <section className="space-y-6">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Choose a <strong>LiNKbot</strong> to see the documents tied to that bot.
          </p>
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
                    {k}
                  </Link>
                ))}
              </div>
              <BrainPartitionDocTable
                files={data.brainPartitionFiles}
                mission={props.missionFilter}
                agent={props.agentFilter}
                scope={props.scope}
              />
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Quick note → Inbox</h3>
                <form action={createQuickNoteDraftAction} className="mt-3 space-y-2">
                  <input type="hidden" name="scope" value="agent" />
                  <input type="hidden" name="agentId" value={props.agentFilter} />
                  <input type="hidden" name="returnTab" value="agent" />
                  <input type="hidden" name="legalEntityId" value={defaultLegalEntityId} />
                  <textarea
                    name="noteBody"
                    rows={4}
                    placeholder="Short note (markdown)"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                  <select name="sensitivity" className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950">
                    <option value="internal">internal</option>
                    <option value="public">public</option>
                    <option value="confidential">confidential</option>
                    <option value="restricted">restricted</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    Save to inbox as draft
                  </button>
                </form>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Binary upload → Inbox</h3>
                <form action={uploadBrainBinaryFromForm} encType="multipart/form-data" className="mt-3 space-y-2">
                  <input type="hidden" name="scope" value="agent" />
                  <input type="hidden" name="agentId" value={props.agentFilter} />
                  <input type="hidden" name="returnTab" value="agent" />
                  <input type="hidden" name="legalEntityId" value={defaultLegalEntityId} />
                  <input type="hidden" name="sensitivity" value="internal" />
                  <input type="file" name="file" required className="block w-full text-sm" />
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                  >
                    Upload to inbox
                  </button>
                </form>
              </div>
              <div>
                <Link
                  href={`/memory/drafts/new?scope=agent&agentId=${encodeURIComponent(props.agentFilter)}`}
                  className={BUTTON.secondaryRow}
                >
                  New draft for this LiNKbot
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a LiNKbot to list governed documents.</p>
          )}
        </section>
      ) : null}

      {tab === "company" ? (
        <section className="space-y-6">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            <strong>Company</strong>-wide documents. Optionally narrow the list using organisation tags.
          </p>
          {data.orgMetaError ? <p className="text-sm text-amber-800 dark:text-amber-200">{data.orgMetaError}</p> : null}
          <CompanyOrgNarrowSelect nodes={data.orgNodes} selectedOrgId={props.orgNodeId} />
          {data.brainMetaError ? <p className="text-sm text-amber-800 dark:text-amber-200">{data.brainMetaError}</p> : null}
          <BrainPartitionDocTable
            files={data.brainPartitionFiles}
            mission={props.missionFilter}
            agent={props.agentFilter}
            org={props.orgNodeId}
            scope={props.scope}
          />
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Quick note → Inbox</h3>
            <form action={createQuickNoteDraftAction} className="mt-3 space-y-2">
              <input type="hidden" name="scope" value="company" />
              <input type="hidden" name="returnTab" value="company" />
              <input type="hidden" name="legalEntityId" value={defaultLegalEntityId} />
              <textarea
                name="noteBody"
                rows={4}
                placeholder="Short note (markdown)"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <select name="sensitivity" className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950">
                <option value="internal">internal</option>
                <option value="public">public</option>
                <option value="confidential">confidential</option>
                <option value="restricted">restricted</option>
              </select>
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Save to inbox as draft
              </button>
            </form>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Binary upload → Inbox</h3>
            <form action={uploadBrainBinaryFromForm} encType="multipart/form-data" className="mt-3 space-y-2">
              <input type="hidden" name="scope" value="company" />
              <input type="hidden" name="returnTab" value="company" />
              <input type="hidden" name="legalEntityId" value={defaultLegalEntityId} />
              <input type="hidden" name="sensitivity" value="internal" />
              <input type="file" name="file" required className="block w-full text-sm" />
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
              >
                Upload to inbox
              </button>
            </form>
          </div>
          <div>
            <Link href="/memory/drafts/new?scope=company" className={BUTTON.secondaryRow}>
              New company-wide draft
            </Link>
          </div>
        </section>
      ) : null}

      {tab === "inbox" ? (
        <section className="space-y-4">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Review incoming drafts. Approve to publish, reject to archive, or open a draft to edit.
          </p>
          {data.brainMetaError ? <p className="text-sm text-amber-800 dark:text-amber-200">{data.brainMetaError}</p> : null}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium text-zinc-600 dark:text-zinc-400">Type:</span>
            <Link
              href={memoryHref("inbox", {
                mission: props.missionFilter,
                agent: props.agentFilter,
                org: props.orgNodeId,
              })}
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
                {t.replace("_", " ")}
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
              <li className="text-sm text-zinc-500 dark:text-zinc-400">No drafts.</li>
            ) : (
              data.brainDrafts.map((d) => (
                <li
                  key={d.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{d.logical_path || "Draft"}</p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {d.inbox_item_type.replace(/_/g, " ")} · {d.file_kind}
                      </p>
                    </div>
                    <span className={`shrink-0 ${BADGE.pending}`}>Pending</span>
                  </div>
                  {d.inbox_item_type === "edit_proposal" && d.predecessor_body != null ? (
                    <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                      {summarizeBrainInboxTextDiff(d.predecessor_body, d.body).summary}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">{inboxSourceLine(d, data)}</p>
                  <p className="mt-3 line-clamp-8 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">{d.body}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    <span>{d.created_at.replace("T", " ").slice(0, 19)}</span>
                    <span className="capitalize">{d.sensitivity}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link href={`/memory/drafts/${d.id}`} className={BUTTON.editRow}>
                      Edit
                    </Link>
                    <form action={publishBrainDraftFromInboxForm} className="inline">
                      <input type="hidden" name="versionId" value={d.id} />
                      <button type="submit" className={BUTTON.approveRow}>
                        Approve
                      </button>
                    </form>
                    <form action={rejectBrainDraftFromForm} className="inline">
                      <input type="hidden" name="versionId" value={d.id} />
                      <button type="submit" className={BUTTON.rejectRow}>
                        Reject
                      </button>
                    </form>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}

      {tab === "ask" ? (
        <section className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Pick a document, type a question, and preview matching excerpts. Your knowledge base is not changed here.
          </p>
          <form method="get" action="/memory" className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <input type="hidden" name="tab" value="ask" />
            <input type="hidden" name="b_scope" value={props.brainScope} />
            <input type="hidden" name="b_path" value={props.sandboxPath ?? ""} />
            {props.brainMissionId ? <input type="hidden" name="b_mission" value={props.brainMissionId} /> : null}
            {props.brainAgentId ? <input type="hidden" name="b_agent" value={props.brainAgentId} /> : null}
            {props.missionFilter ? <input type="hidden" name="mission" value={props.missionFilter} /> : null}
            {props.agentFilter ? <input type="hidden" name="agent" value={props.agentFilter} /> : null}
            {props.orgNodeId ? <input type="hidden" name="org" value={props.orgNodeId} /> : null}
            <div>
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Document</label>
              <select
                name="b_file"
                defaultValue={props.askSelectedFileId ?? ""}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="">Choose a document…</option>
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
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Retrieval stage</label>
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
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Progressive disclosure: start with orientation or cards, then switch to passages when you need grounded
                excerpts.
              </p>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Preview
            </button>
          </form>
          {props.brainSandbox ? (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
              {props.brainSandbox.error ? (
                <p className="text-sm text-red-700 dark:text-red-300">{props.brainSandbox.error}</p>
              ) : null}
              {!props.brainSandbox.fileId ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  No published document at this path for the current scope. Create and publish a draft first.
                </p>
              ) : (
                <>
                  {props.brainSandbox.mapIndexCards && props.brainSandbox.mapIndexCards.length > 0 ? (
                    <>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Company orientation map</h3>
                      <ul className="mt-2 space-y-2">
                        {props.brainSandbox.mapIndexCards.map((c) => (
                          <li key={c.card_key} className="text-sm">
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{c.title}</span>
                            <p className="text-zinc-600 dark:text-zinc-400">{c.summary}</p>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Index cards</h3>
                  {props.brainSandbox.indexCards.length === 0 ? (
                    <p className="text-sm text-zinc-500">None yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {props.brainSandbox.indexCards.map((c) => (
                        <li key={c.card_key} className="text-sm">
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">{c.title}</span>
                          <p className="text-zinc-600 dark:text-zinc-400">{c.summary}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                  <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Passages</h3>
                  {props.brainSandbox.relevantChunks.length === 0 ? (
                    <p className="text-sm text-zinc-500">No chunks yet — publish to chunk the body.</p>
                  ) : (
                    <ul className="mt-2 space-y-3">
                      {props.brainSandbox.relevantChunks.map((c) => (
                        <li key={c.chunkId} className="text-sm">
                          <p className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">{c.content}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                  {props.brainSandbox.publishedExcerpt ? (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Approved text
                      </summary>
                      <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-white p-3 text-xs dark:bg-zinc-950">
                        {props.brainSandbox.publishedExcerpt}
                      </pre>
                    </details>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
