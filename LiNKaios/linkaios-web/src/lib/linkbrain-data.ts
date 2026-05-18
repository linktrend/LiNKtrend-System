import {
  enrichBrainVirtualFilesWithPublishState,
  listBrainDraftsForInbox,
  listBrainLegalEntities,
  listBrainOrgNodes,
  listBrainVirtualFilesByScopeAndOrgTag,
  listMemoryEntries,
  listMissions,
  type BrainInboxItemType,
  type BrainInboxRow,
  type BrainLegalEntityRow,
  type BrainOrgNodeRow,
  type BrainScope,
  type BrainVirtualFileEnriched,
  type BrainVirtualFileRow,
  type MemoryEntryRow,
} from "@linktrend/linklogic-sdk";
import type { MissionRecord } from "@linktrend/shared-types";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Primary LiNKbrain workspace tabs (legacy `overview` / `library` query values map to Inbox in the page parser). */
export type LinkbrainTab = "inbox" | "project" | "agent" | "company" | "ask";

export type MissionMemoryRow = {
  mission: MissionRecord;
  memoryCount: number;
  lastMemoryAt: string | null;
};

export type LinkbrainAgentOption = { id: string; display_name: string };

export type LinkbrainOverviewBrain = {
  draftCount: number;
  virtualFileCount: number;
  publishedFileCount: number;
  orgNodeCount: number;
  chunksTotal: number;
  chunksWithEmbedding: number;
  /** Chunks belonging to published versions that lack an embedding row (approx., capped scan). */
  publishedChunksMissingEmbedding: number;
  /** Published versions whose `published_at` is older than ~90 days (staleness signal). */
  stalePublishedApprox: number;
  /** Embedding pipeline rows in `failed` state. */
  embedJobsFailed: number;
};

export type LinkbrainPageData = {
  error: string | null;
  lightEntries: Array<{ mission_id: string | null; classification: string; created_at: string }>;
  recentEntries: MemoryEntryRow[];
  libraryEntries: MemoryEntryRow[];
  missions: MissionRecord[];
  missionRows: MissionMemoryRow[];
  agents: LinkbrainAgentOption[];
  classifications: string[];
  totals: {
    entries: number;
    missionsWithMemory: number;
    classifications: number;
  };
  brainDrafts: BrainInboxRow[];
  brainMetaError: string | null;
  /** Governed virtual documents for the active partition (PRD Project / LiNKbot / Company). */
  brainPartitionFiles: BrainVirtualFileEnriched[];
  orgNodes: BrainOrgNodeRow[];
  legalEntities: BrainLegalEntityRow[];
  overviewBrain: LinkbrainOverviewBrain | null;
  orgMetaError: string | null;
};

export async function loadLinkbrainPageData(
  supabase: SupabaseClient,
  params: {
    tab: LinkbrainTab;
    missionId?: string;
    classification?: string;
    agentId?: string;
    scope?: "recent" | "all";
    brainScope?: BrainScope;
    brainMissionId?: string;
    brainAgentId?: string;
    orgNodeId?: string;
    inboxItemType?: BrainInboxItemType | null;
    inboxSort?: "asc" | "desc";
    brainFileKindFilter?: string | null;
  },
): Promise<LinkbrainPageData> {
  const empty = (): LinkbrainPageData => ({
    error: null,
    lightEntries: [],
    recentEntries: [],
    libraryEntries: [],
    missions: [],
    missionRows: [],
    agents: [],
    classifications: [],
    totals: { entries: 0, missionsWithMemory: 0, classifications: 0 },
    brainDrafts: [],
    brainMetaError: null,
    brainPartitionFiles: [],
    orgNodes: [],
    legalEntities: [],
    overviewBrain: null,
    orgMetaError: null,
  });

  const { data: lightRaw, error: lightErr } = await supabase
    .schema("linkaios")
    .from("memory_entries")
    .select("mission_id, classification, created_at")
    .order("created_at", { ascending: false })
    .limit(12_000);

  if (lightErr) {
    return { ...empty(), error: lightErr.message };
  }

  const lightEntries = (lightRaw ?? []) as Array<{ mission_id: string | null; classification: string; created_at: string }>;

  const byMission = new Map<string, { count: number; last: string }>();
  const classSet = new Set<string>();
  for (const e of lightEntries) {
    classSet.add(e.classification);
    if (e.mission_id) {
      const cur = byMission.get(e.mission_id) ?? { count: 0, last: e.created_at };
      cur.count += 1;
      if (e.created_at > cur.last) cur.last = e.created_at;
      byMission.set(e.mission_id, cur);
    }
  }

  const { data: missions, error: mErr } = await listMissions(supabase, { limit: 80 });
  if (mErr) {
    return {
      ...empty(),
      error: mErr.message,
      lightEntries,
      classifications: [...classSet].sort(),
      totals: {
        entries: lightEntries.length,
        missionsWithMemory: byMission.size,
        classifications: classSet.size,
      },
    };
  }

  const missionList = missions ?? [];
  const missionRows: MissionMemoryRow[] = missionList.map((m) => {
    const agg = byMission.get(String(m.id));
    return {
      mission: m,
      memoryCount: agg?.count ?? 0,
      lastMemoryAt: agg?.last ?? null,
    };
  });
  missionRows.sort((a, b) => (b.lastMemoryAt ?? "").localeCompare(a.lastMemoryAt ?? ""));

  const { data: agentRows, error: agentErr } = await supabase
    .schema("linkaios")
    .from("agents")
    .select("id, display_name")
    .order("display_name", { ascending: true })
    .limit(200);
  const agents: LinkbrainAgentOption[] =
    agentErr || !agentRows
      ? []
      : (agentRows as { id: string; display_name: string }[]).map((a) => ({
          id: String(a.id),
          display_name: String(a.display_name),
        }));

  const { data: recentEntries, error: rErr } = await listMemoryEntries(supabase, { limit: 20 });
  if (rErr) {
    return {
      ...empty(),
      error: rErr.message,
      lightEntries,
      missions: missionList,
      missionRows,
      agents,
      classifications: [...classSet].sort(),
      totals: {
        entries: lightEntries.length,
        missionsWithMemory: byMission.size,
        classifications: classSet.size,
      },
    };
  }

  let brainDrafts: BrainInboxRow[] = [];
  let brainMetaError: string | null = null;

  if (params.tab === "inbox") {
    const { data, error } = await listBrainDraftsForInbox(supabase, {
      limit: 120,
      inboxItemType: params.inboxItemType ?? null,
      sort: params.inboxSort === "asc" ? "asc" : "desc",
    });
    if (error) brainMetaError = error.message;
    else brainDrafts = data;
  }

  let orgNodes: BrainOrgNodeRow[] = [];
  let legalEntities: BrainLegalEntityRow[] = [];
  let orgMetaError: string | null = null;
  const needOrg = params.tab === "company" || params.tab === "project" || params.tab === "agent";
  if (needOrg) {
    const [oRes, lRes] = await Promise.all([listBrainOrgNodes(supabase), listBrainLegalEntities(supabase)]);
    if (oRes.error) orgMetaError = oRes.error.message;
    else orgNodes = oRes.data;
    if (lRes.error) orgMetaError = orgMetaError ?? lRes.error.message;
    else legalEntities = lRes.data;
  }

  const overviewBrain: LinkbrainOverviewBrain | null = null;

  let brainPartitionFiles: BrainVirtualFileEnriched[] = [];
  const bScope = params.brainScope ?? "company";

  const fk = params.brainFileKindFilter?.trim() || null;

  const loadPartitionFiles = async () => {
    let raw: BrainVirtualFileRow[] = [];
    if (params.tab === "project" && params.brainMissionId?.trim()) {
      const { data, error } = await listBrainVirtualFilesByScopeAndOrgTag(supabase, "mission", {
        missionId: params.brainMissionId.trim(),
        fileKind: fk,
      });
      if (error) brainMetaError = brainMetaError ?? error.message;
      else raw = data;
    } else if (params.tab === "agent" && params.brainAgentId?.trim()) {
      const { data, error } = await listBrainVirtualFilesByScopeAndOrgTag(supabase, "agent", {
        agentId: params.brainAgentId.trim(),
        fileKind: fk,
      });
      if (error) brainMetaError = brainMetaError ?? error.message;
      else raw = data;
    } else if (params.tab === "company") {
      const { data, error } = await listBrainVirtualFilesByScopeAndOrgTag(supabase, "company", {
        orgNodeId: params.orgNodeId?.trim() || null,
        fileKind: fk,
      });
      if (error) brainMetaError = brainMetaError ?? error.message;
      else raw = data;
    } else if (params.tab === "ask") {
      const scopeForAsk =
        bScope === "mission" && params.brainMissionId?.trim()
          ? ("mission" as const)
          : bScope === "agent" && params.brainAgentId?.trim()
            ? ("agent" as const)
            : ("company" as const);
      const { data, error } = await listBrainVirtualFilesByScopeAndOrgTag(supabase, scopeForAsk, {
        missionId: params.brainMissionId?.trim(),
        agentId: params.brainAgentId?.trim(),
        orgNodeId: scopeForAsk === "company" ? params.orgNodeId?.trim() || null : null,
        fileKind: fk,
      });
      if (error) brainMetaError = brainMetaError ?? error.message;
      else raw = data;
    }
    if (raw.length) {
      const { data: enriched, error: enErr } = await enrichBrainVirtualFilesWithPublishState(supabase, raw);
      if (enErr) brainMetaError = brainMetaError ?? enErr.message;
      else brainPartitionFiles = enriched;
    }
  };

  await loadPartitionFiles();

  return {
    error: null,
    lightEntries,
    recentEntries: recentEntries ?? [],
    libraryEntries: [] as MemoryEntryRow[],
    missions: missionList,
    missionRows,
    agents,
    classifications: [...classSet].sort(),
    totals: {
      entries: lightEntries.length,
      missionsWithMemory: byMission.size,
      classifications: classSet.size,
    },
    brainDrafts,
    brainMetaError,
    brainPartitionFiles,
    orgNodes,
    legalEntities,
    overviewBrain,
    orgMetaError,
  };
}
