import {
  DEFAULT_BRAIN_LEGAL_ENTITY_ID,
  type BrainInboxRow,
  type BrainVirtualFileEnriched,
} from "@linktrend/linklogic-sdk";
import type { MissionRecord } from "@linktrend/shared-types";

import type {
  CollectiveInboxDraft,
  CollectiveMemoryFile,
  CollectiveMemoryProvenance,
  CollectiveMemoryTags,
  CollectiveTagFilters,
} from "@/lib/collective-linkbrain";
import {
  matchesCollectiveTagFilters,
  submissionSourceFromFileKind,
  submissionSourceFromInboxType,
} from "@/lib/collective-linkbrain";
import type { LinkbrainAgentOption, LinkbrainPageData, LinkbrainTab } from "@/lib/linkbrain-data";
import { ALL_LICENSEES_SCOPE, type LicensorScope } from "@/lib/app-roles";
import { LICENSEE_REGISTRY } from "@/lib/licensee-registry";

const XYZ = "xyz-marketing";
const LEXOS = "lexos-legal";
const HARBOR = "harbor-dental";

const MISSION_LICENSEE: Record<string, string> = {
  "00000000-0000-4000-8000-00000000d201": XYZ,
  "00000000-0000-4000-8000-00000000d202": XYZ,
  "00000000-0000-4000-8000-00000000d301": LEXOS,
  "00000000-0000-4000-8000-00000000d401": HARBOR,
};

const AGENT_LICENSEE: Record<string, string> = {
  "agent-xyz-ops": XYZ,
  "agent-xyz-copy": XYZ,
  "agent-lexos-paralegal": LEXOS,
  "agent-harbor-frontdesk": HARBOR,
};

const MISSIONS: Record<string, MissionRecord> = {
  "xyz-site-factory": {
    id: "00000000-0000-4000-8000-00000000d201",
    title: "Website Factory — lead pipeline",
    status: "running",
    primary_agent_id: null,
    created_at: "2026-02-01T12:00:00.000Z",
    updated_at: "2026-04-01T15:00:00.000Z",
  },
  "xyz-brand-refresh": {
    id: "00000000-0000-4000-8000-00000000d202",
    title: "Brand refresh Q2",
    status: "running",
    primary_agent_id: null,
    created_at: "2026-03-01T12:00:00.000Z",
    updated_at: "2026-04-10T15:00:00.000Z",
  },
  "lexos-intake": {
    id: "00000000-0000-4000-8000-00000000d301",
    title: "Litigation intake automation",
    status: "running",
    primary_agent_id: null,
    created_at: "2026-01-15T12:00:00.000Z",
    updated_at: "2026-04-05T15:00:00.000Z",
  },
  "harbor-onboarding": {
    id: "00000000-0000-4000-8000-00000000d401",
    title: "New patient onboarding",
    status: "running",
    primary_agent_id: null,
    created_at: "2026-03-20T12:00:00.000Z",
    updated_at: "2026-04-12T15:00:00.000Z",
  },
};

const AGENTS: LinkbrainAgentOption[] = [
  { id: "agent-xyz-ops", display_name: "Ops LiNKbot" },
  { id: "agent-xyz-copy", display_name: "Copy LiNKbot" },
  { id: "agent-lexos-paralegal", display_name: "Paralegal LiNKbot" },
  { id: "agent-harbor-frontdesk", display_name: "Front Desk LiNKbot" },
];

function prov(
  licenseeId: string,
  partition: CollectiveMemoryProvenance["partition"],
  extra?: Partial<CollectiveMemoryProvenance>,
): CollectiveMemoryProvenance {
  return {
    licenseeId,
    licenseeName: LICENSEE_REGISTRY.find((r) => r.id === licenseeId)?.name ?? licenseeId,
    partition,
    ...extra,
  };
}

function tags(partial: CollectiveMemoryTags): CollectiveMemoryTags {
  return partial;
}

function mockFile(
  id: string,
  logical_path: string,
  scope: BrainVirtualFileEnriched["scope"],
  collective: CollectiveMemoryFile["collective"],
  extra?: Partial<BrainVirtualFileEnriched>,
): CollectiveMemoryFile {
  const now = new Date().toISOString();
  return {
    id,
    logical_path,
    scope,
    mission_id: extra?.mission_id ?? null,
    agent_id: extra?.agent_id ?? null,
    created_at: extra?.created_at ?? now,
    legal_entity_id: extra?.legal_entity_id ?? DEFAULT_BRAIN_LEGAL_ENTITY_ID,
    sensitivity: extra?.sensitivity ?? "internal",
    file_kind: extra?.file_kind ?? "standard",
    has_published: extra?.has_published ?? true,
    published_at: extra?.published_at ?? "2026-03-15T10:00:00.000Z",
    collective,
  };
}

function mockDraft(
  partial: Partial<BrainInboxRow> & Pick<BrainInboxRow, "logical_path" | "inbox_item_type" | "body">,
  collective: CollectiveInboxDraft["collective"],
): CollectiveInboxDraft {
  const now = new Date().toISOString();
  return {
    id: partial.id ?? `draft-${Math.random().toString(36).slice(2, 9)}`,
    file_id: partial.file_id ?? `file-${Math.random().toString(36).slice(2, 9)}`,
    status: partial.status ?? "draft",
    body: partial.body,
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
    collective,
  };
}

const COLLECTIVE_INBOX: CollectiveInboxDraft[] = [
  mockDraft(
    {
      id: "00000000-0000-4000-8000-00000000e501",
      logical_path: "/projects/site-factory/playbook/lead-qualification.md",
      inbox_item_type: "standard",
      scope: "mission",
      mission_id: MISSIONS["xyz-site-factory"]!.id,
      body: "## Anonymised extract\n- Qualify inbound leads on budget band and timeline\n- Route hot leads to preview-site workflow within 24h",
    },
    {
      provenance: prov(XYZ, "project", {
        projectId: MISSIONS["xyz-site-factory"]!.id,
        projectTitle: MISSIONS["xyz-site-factory"]!.title,
      }),
      tags: tags({ industry: "Marketing", pattern: "Lead Intake", useCase: "Workflow Automation" }),
    },
  ),
  mockDraft(
    {
      id: "00000000-0000-4000-8000-00000000e502",
      logical_path: "/agents/ops/escalation-matrix.md",
      inbox_item_type: "edit_proposal",
      scope: "agent",
      agent_id: "agent-xyz-ops",
      body: "## Anonymised update\n- P1 bridge calls require dual approval\n- Warm handoff checklist before customer contact",
      predecessor_body: "## Prior\n- Single approver for P1",
    },
    {
      provenance: prov(XYZ, "agent", { linkbotId: "agent-xyz-ops", linkbotName: "Ops LiNKbot" }),
      tags: tags({ industry: "Marketing", pattern: "Incident Response", useCase: "Retrieval" }),
    },
  ),
  mockDraft(
    {
      id: "00000000-0000-4000-8000-00000000e503",
      logical_path: "/company/policy/conflict-check-policy.md",
      inbox_item_type: "upload",
      scope: "company",
      file_kind: "upload",
      body: "Anonymised policy excerpt — conflict screening steps before matter intake (fixture).",
    },
    {
      provenance: prov(LEXOS, "licensee"),
      tags: tags({ industry: "Legal", pattern: "Governance", useCase: "Document Review" }),
    },
  ),
  mockDraft(
    {
      id: "00000000-0000-4000-8000-00000000e504",
      logical_path: "/projects/onboarding/intake-script.md",
      inbox_item_type: "quick_note",
      scope: "mission",
      mission_id: MISSIONS["harbor-onboarding"]!.id,
      file_kind: "quick_note",
      body: "Anonymised intake script — insurance verification and appointment scheduling cues.",
    },
    {
      provenance: prov(HARBOR, "project", {
        projectId: MISSIONS["harbor-onboarding"]!.id,
        projectTitle: MISSIONS["harbor-onboarding"]!.title,
      }),
      tags: tags({ industry: "Healthcare", pattern: "Onboarding", useCase: "CRM Handoff" }),
    },
  ),
];

const COLLECTIVE_FILES: CollectiveMemoryFile[] = [
  mockFile(
    "00000000-0000-4000-8000-00000000f501",
    "/projects/site-factory/patterns/preview-site-handoff.md",
    "mission",
    {
      provenance: prov(XYZ, "project", {
        projectId: MISSIONS["xyz-site-factory"]!.id,
        projectTitle: MISSIONS["xyz-site-factory"]!.title,
      }),
      tags: tags({ industry: "Marketing", pattern: "Lead Intake", useCase: "Workflow Automation" }),
    },
    { mission_id: MISSIONS["xyz-site-factory"]!.id },
  ),
  mockFile(
    "00000000-0000-4000-8000-00000000f502",
    "/projects/brand-refresh/copy-tone-guide.md",
    "mission",
    {
      provenance: prov(XYZ, "project", {
        projectId: MISSIONS["xyz-brand-refresh"]!.id,
        projectTitle: MISSIONS["xyz-brand-refresh"]!.title,
      }),
      tags: tags({ industry: "Marketing", pattern: "Onboarding", useCase: "Retrieval" }),
    },
    { mission_id: MISSIONS["xyz-brand-refresh"]!.id },
  ),
  mockFile(
    "00000000-0000-4000-8000-00000000f503",
    "/agents/copy/session-style-guide.md",
    "agent",
    {
      provenance: prov(XYZ, "agent", { linkbotId: "agent-xyz-copy", linkbotName: "Copy LiNKbot" }),
      tags: tags({ industry: "Marketing", pattern: "Governance", useCase: "Retrieval" }),
    },
    { agent_id: "agent-xyz-copy" },
  ),
  mockFile(
    "00000000-0000-4000-8000-00000000f504",
    "/agents/paralegal/matter-intake-checklist.md",
    "agent",
    {
      provenance: prov(LEXOS, "agent", {
        linkbotId: "agent-lexos-paralegal",
        linkbotName: "Paralegal LiNKbot",
      }),
      tags: tags({ industry: "Legal", pattern: "Lead Intake", useCase: "Document Review" }),
    },
    { agent_id: "agent-lexos-paralegal" },
  ),
  mockFile(
    "00000000-0000-4000-8000-00000000f505",
    "/company/handbook/data-retention-summary.md",
    "company",
    {
      provenance: prov(LEXOS, "licensee"),
      tags: tags({ industry: "Legal", pattern: "Governance", useCase: "Document Review" }),
    },
  ),
  mockFile(
    "00000000-0000-4000-8000-00000000f506",
    "/projects/onboarding/patient-intake-faq.md",
    "mission",
    {
      provenance: prov(HARBOR, "project", {
        projectId: MISSIONS["harbor-onboarding"]!.id,
        projectTitle: MISSIONS["harbor-onboarding"]!.title,
      }),
      tags: tags({ industry: "Healthcare", pattern: "Onboarding", useCase: "CRM Handoff" }),
    },
    { mission_id: MISSIONS["harbor-onboarding"]!.id },
  ),
  mockFile(
    "00000000-0000-4000-8000-00000000f507",
    "/agents/frontdesk/triage-routing.md",
    "agent",
    {
      provenance: prov(HARBOR, "agent", {
        linkbotId: "agent-harbor-frontdesk",
        linkbotName: "Front Desk LiNKbot",
      }),
      tags: tags({ industry: "Healthcare", pattern: "Incident Response", useCase: "Workflow Automation" }),
    },
    { agent_id: "agent-harbor-frontdesk" },
  ),
  mockFile(
    "00000000-0000-4000-8000-00000000f508",
    "/company/standards/hipaa-handling-baseline.md",
    "company",
    {
      provenance: prov(HARBOR, "licensee"),
      tags: tags({ industry: "Healthcare", pattern: "Governance", useCase: "Document Review" }),
    },
  ),
];

function filterByScope<T extends { collective: { provenance: CollectiveMemoryProvenance } }>(
  rows: T[],
  scope: LicensorScope,
): T[] {
  if (scope === ALL_LICENSEES_SCOPE) return rows;
  return rows.filter((r) => r.collective.provenance.licenseeId === scope);
}

function filesForTab(tab: LinkbrainTab, missionId?: string, agentId?: string): CollectiveMemoryFile[] {
  let pool = COLLECTIVE_FILES;
  if (tab === "project") {
    pool = pool.filter((f) => f.collective.provenance.partition === "project");
    if (missionId) pool = pool.filter((f) => f.mission_id === missionId);
  } else if (tab === "agent") {
    pool = pool.filter((f) => f.collective.provenance.partition === "agent");
    if (agentId) pool = pool.filter((f) => f.agent_id === agentId);
  } else if (tab === "company") {
    pool = pool.filter((f) => f.collective.provenance.partition === "licensee");
  }
  return pool;
}

export type LicensorCollectiveOverlay = {
  collectiveInbox: CollectiveInboxDraft[];
  collectiveFiles: CollectiveMemoryFile[];
  collectiveFileMap: Map<string, CollectiveMemoryFile>;
  collectiveInboxMap: Map<string, CollectiveInboxDraft>;
};

export function buildLicensorCollectiveOverlay(params: {
  tab: LinkbrainTab;
  licensorScope: LicensorScope;
  missionId?: string;
  agentId?: string;
  tagFilters?: CollectiveTagFilters;
}): LicensorCollectiveOverlay {
  let collectiveInbox = filterByScope(COLLECTIVE_INBOX, params.licensorScope);
  let collectiveFiles = filterByScope(filesForTab(params.tab, params.missionId, params.agentId), params.licensorScope);

  const tagFilters = params.tagFilters ?? {};
  if (tagFilters.industry || tagFilters.pattern || tagFilters.useCase || tagFilters.submissionSource) {
    collectiveInbox = collectiveInbox.filter((d) =>
      matchesCollectiveTagFilters(d.collective.tags, tagFilters, submissionSourceFromInboxType(d.inbox_item_type)),
    );
    collectiveFiles = collectiveFiles.filter((f) =>
      matchesCollectiveTagFilters(f.collective.tags, tagFilters, submissionSourceFromFileKind(f.file_kind)),
    );
  }

  return {
    collectiveInbox,
    collectiveFiles,
    collectiveFileMap: new Map(collectiveFiles.map((f) => [f.id, f])),
    collectiveInboxMap: new Map(collectiveInbox.map((d) => [d.id, d])),
  };
}

/** Replace tenant-scoped lists with multi-licensee collective fixtures for licensor admin. */
export function applyLicensorCollectivePageOverlay(
  data: LinkbrainPageData,
  params: {
    tab: LinkbrainTab;
    licensorScope?: LicensorScope;
    missionId?: string;
    agentId?: string;
  },
): LinkbrainPageData {
  const scope = params.licensorScope ?? ALL_LICENSEES_SCOPE;

  const missions = Object.values(MISSIONS).filter((m) => {
    if (scope === ALL_LICENSEES_SCOPE) return true;
    if (scope === XYZ) return m.id.startsWith("00000000-0000-4000-8000-00000000d2");
    if (scope === LEXOS) return m.id === MISSIONS["lexos-intake"]!.id;
    if (scope === HARBOR) return m.id === MISSIONS["harbor-onboarding"]!.id;
    return true;
  });

  const agents = AGENTS.filter((a) => {
    if (scope === ALL_LICENSEES_SCOPE) return true;
    if (scope === XYZ) return a.id.startsWith("agent-xyz");
    if (scope === LEXOS) return a.id.startsWith("agent-lexos");
    if (scope === HARBOR) return a.id.startsWith("agent-harbor");
    return true;
  });

  const overlay = buildLicensorCollectiveOverlay({
    tab: params.tab,
    licensorScope: scope,
    missionId: params.missionId,
    agentId: params.agentId,
  });

  return {
    ...data,
    error: null,
    brainMetaError: null,
    missions,
    agents,
    missionRows: missions.map((m) => ({
      mission: m,
      memoryCount: 3,
      lastMemoryAt: new Date().toISOString(),
    })),
    brainDrafts: overlay.collectiveInbox,
    brainPartitionFiles: overlay.collectiveFiles,
  };
}

export { COLLECTIVE_INBOX, COLLECTIVE_FILES, MISSIONS as COLLECTIVE_DEMO_MISSIONS, AGENTS as COLLECTIVE_DEMO_AGENTS };
