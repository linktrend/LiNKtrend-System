import {
  DEFAULT_BRAIN_LEGAL_ENTITY_ID,
  type BrainInboxRow,
  type BrainLegalEntityRow,
  type BrainOrgNodeRow,
  type BrainVirtualFileEnriched,
  type MemoryEntryRow,
} from "@linktrend/linklogic-sdk";
import type { MissionRecord } from "@linktrend/shared-types";

import type { LinkbrainOverviewBrain, LinkbrainPageData, MissionMemoryRow } from "@/lib/linkbrain-data";

const MOCK_MISSION: MissionRecord = {
  id: "00000000-0000-4000-8000-00000000d101",
  title: "Acme rollout — governance pack",
  status: "running",
  primary_agent_id: null,
  created_at: "2026-03-01T12:00:00.000Z",
  updated_at: "2026-04-12T15:00:00.000Z",
};

function mockMemory(id: string, classification: string, body: string, daysAgo: number): MemoryEntryRow {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return {
    id,
    mission_id: MOCK_MISSION.id,
    classification,
    body,
    metadata: {},
    created_at: d.toISOString(),
  };
}

function mockInboxRow(partial: Partial<BrainInboxRow> & Pick<BrainInboxRow, "logical_path" | "inbox_item_type">): BrainInboxRow {
  const now = new Date().toISOString();
  return {
    id: partial.id ?? "00000000-0000-4000-8000-00000000e101",
    file_id: partial.file_id ?? "00000000-0000-4000-8000-00000000e201",
    status: partial.status ?? "draft",
    body: partial.body ?? "Fixture draft body.",
    predecessor_version_id: partial.predecessor_version_id ?? null,
    created_by: partial.created_by ?? null,
    created_at: partial.created_at ?? now,
    published_at: partial.published_at ?? null,
    logical_path: partial.logical_path,
    scope: partial.scope ?? "company",
    mission_id: partial.mission_id ?? null,
    agent_id: partial.agent_id ?? null,
    file_kind: partial.file_kind ?? "standard",
    sensitivity: partial.sensitivity ?? "internal",
    inbox_item_type: partial.inbox_item_type,
    predecessor_body: partial.predecessor_body ?? null,
  };
}

function mockVirtualFile(p: Partial<BrainVirtualFileEnriched> & Pick<BrainVirtualFileEnriched, "logical_path">): BrainVirtualFileEnriched {
  const now = new Date().toISOString();
  return {
    id: p.id ?? "00000000-0000-4000-8000-00000000f101",
    logical_path: p.logical_path,
    scope: p.scope ?? "company",
    mission_id: p.mission_id ?? null,
    agent_id: p.agent_id ?? null,
    created_at: p.created_at ?? now,
    legal_entity_id: p.legal_entity_id ?? DEFAULT_BRAIN_LEGAL_ENTITY_ID,
    sensitivity: p.sensitivity ?? "internal",
    file_kind: p.file_kind ?? "standard",
    has_published: p.has_published ?? true,
    published_at: p.published_at ?? "2026-03-15T10:00:00.000Z",
  };
}

const MOCK_OVERVIEW: LinkbrainOverviewBrain = {
  draftCount: 6,
  virtualFileCount: 34,
  publishedFileCount: 21,
  orgNodeCount: 12,
  chunksTotal: 4200,
  chunksWithEmbedding: 3980,
  publishedChunksMissingEmbedding: 14,
  stalePublishedApprox: 3,
  embedJobsFailed: 1,
};

/** Enrich LiNKbrain command-centre data for UX review when `LINKAIOS_UI_MOCKS` is on. */
export function applyLinkbrainUiMockOverlay(data: LinkbrainPageData): LinkbrainPageData {
  if (data.error) return data;

  const recentEntries =
    data.recentEntries.length >= 4
      ? data.recentEntries
      : [
          mockMemory("mock-mem-1", "briefing", "Q2 priorities — engineering vs GTM alignment (fixture).", 1),
          mockMemory("mock-mem-2", "incident", "Warm handoff checklist for P1 bridge calls (fixture).", 2),
          mockMemory("mock-mem-3", "customer", "Acme stakeholder map — roles and escalation (fixture).", 4),
          ...data.recentEntries,
        ];

  const brainDrafts =
    data.brainDrafts.length >= 3
      ? data.brainDrafts
      : [
          mockInboxRow({
            id: "00000000-0000-4000-8000-00000000e110",
            file_id: "00000000-0000-4000-8000-00000000e210",
            logical_path: "/company/policy/security-baseline.md",
            inbox_item_type: "standard",
            body: "## Draft updates\n- MFA on all admin roles\n- Session TTL 12h",
            status: "draft",
          }),
          mockInboxRow({
            id: "00000000-0000-4000-8000-00000000e111",
            file_id: "00000000-0000-4000-8000-00000000e211",
            logical_path: "/company/notes/q3-planning.md",
            inbox_item_type: "quick_note",
            file_kind: "quick_note",
            body: "Fixture quick note — parking lot for next steering.",
            status: "draft",
          }),
          mockInboxRow({
            id: "00000000-0000-4000-8000-00000000e112",
            file_id: "00000000-0000-4000-8000-00000000e212",
            logical_path: "/company/uploads/vendor-ddq-2026.pdf",
            inbox_item_type: "upload",
            file_kind: "upload",
            body: "Fixture upload — DDQ responses pending review.",
            status: "draft",
          }),
          ...data.brainDrafts,
        ];

  const brainPartitionFiles =
    data.brainPartitionFiles.length >= 3
      ? data.brainPartitionFiles
      : [
          mockVirtualFile({
            id: "00000000-0000-4000-8000-00000000f110",
            logical_path: "/company/handbook/on-call.md",
            has_published: true,
            published_at: "2026-02-20T09:00:00.000Z",
          }),
          mockVirtualFile({
            id: "00000000-0000-4000-8000-00000000f111",
            logical_path: "/company/rfcs/rfc-014-embedding-pipeline.md",
            file_kind: "standard",
            has_published: false,
            published_at: null,
          }),
          mockVirtualFile({
            id: "00000000-0000-4000-8000-00000000f112",
            logical_path: "/company/daily-logs/2026-04-10.md",
            file_kind: "daily_log",
            has_published: true,
            published_at: "2026-04-10T23:59:00.000Z",
          }),
          ...data.brainPartitionFiles,
        ];

  const orgNodes: BrainOrgNodeRow[] =
    data.orgNodes.length >= 2
      ? data.orgNodes
      : [
          {
            id: "00000000-0000-4000-8000-00000000a301",
            dimension: "region",
            label: "Americas",
            parent_id: null,
            valid_from: "2026-01-01",
            valid_to: null,
            sort_order: 0,
            created_at: "2026-01-01T00:00:00.000Z",
          },
          {
            id: "00000000-0000-4000-8000-00000000a302",
            dimension: "department",
            label: "Customer success",
            parent_id: null,
            valid_from: "2026-01-01",
            valid_to: null,
            sort_order: 1,
            created_at: "2026-01-01T00:00:00.000Z",
          },
          ...data.orgNodes,
        ];

  const legalEntities: BrainLegalEntityRow[] =
    data.legalEntities.length >= 1
      ? data.legalEntities
      : [
          {
            id: DEFAULT_BRAIN_LEGAL_ENTITY_ID,
            code: "LINK",
            name: "LiNKtrend Media LLC (fixture)",
            created_at: "2026-01-01T00:00:00.000Z",
          },
          ...data.legalEntities,
        ];

  const missionRows: MissionMemoryRow[] =
    data.missionRows.length >= 1
      ? data.missionRows
      : [{ mission: MOCK_MISSION, memoryCount: 12, lastMemoryAt: new Date().toISOString() }, ...data.missionRows];

  const lightEntries =
    data.lightEntries.length >= 8
      ? data.lightEntries
      : [
          { mission_id: MOCK_MISSION.id, classification: "briefing", created_at: new Date().toISOString() },
          { mission_id: MOCK_MISSION.id, classification: "incident", created_at: new Date().toISOString() },
          ...data.lightEntries,
        ];

  const overviewBrain = data.overviewBrain ?? MOCK_OVERVIEW;

  const classifications = Array.from(new Set([...data.classifications, "briefing", "incident", "customer"])).sort();

  const agentIds = new Set(data.agents.map((a) => a.id));
  const agents =
    data.agents.length >= 2
      ? data.agents
      : [
          ...(agentIds.has("demo-lisa") ? [] : [{ id: "demo-lisa", display_name: "Lisa (CEO)" }]),
          ...(agentIds.has("demo-eric") ? [] : [{ id: "demo-eric", display_name: "Eric (CTO)" }]),
          ...data.agents,
        ];

  return {
    ...data,
    recentEntries,
    brainDrafts,
    brainPartitionFiles,
    orgNodes,
    legalEntities,
    missionRows,
    missions: data.missions.length ? data.missions : [MOCK_MISSION],
    agents,
    lightEntries,
    overviewBrain,
    classifications,
    totals: {
      entries: Math.max(data.totals.entries, lightEntries.length),
      missionsWithMemory: Math.max(data.totals.missionsWithMemory, missionRows.filter((m) => m.memoryCount > 0).length || 1),
      classifications: Math.max(data.totals.classifications, classifications.length),
    },
  };
}
