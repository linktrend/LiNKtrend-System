import "server-only";

import {
  DEFAULT_BRAIN_LEGAL_ENTITY_ID,
  type BrainInboxRow,
  type BrainVirtualFileEnriched,
} from "@linktrend/linklogic-sdk";
import type { ProjectRecord } from "@linktrend/shared-types";

import type { CollectiveInboxDraft, CollectiveMemoryFile } from "@/lib/collective-linkbrain";
import type { LinkbrainAgentOption, LinkbrainPageData } from "@/lib/linkbrain-data";
import { LICENSEE_REGISTRY } from "@/lib/licensee-registry";

const XYZ = "xyz-marketing";
const LEXOS = "lexos-legal";

const ADMIN_PROJECT: ProjectRecord = {
  id: "00000000-0000-4000-8000-00000000a101",
  title: "LiNKsuitegen — suite factory",
  status: "running",
  primary_agent_id: null,
  created_at: "2026-01-10T12:00:00.000Z",
  updated_at: "2026-04-01T15:00:00.000Z",
};

const LICENSEE_PROJECTS: ProjectRecord[] = [
  {
    id: "00000000-0000-4000-8000-00000000d201",
    title: "Website Factory — lead pipeline",
    status: "running",
    primary_agent_id: null,
    created_at: "2026-02-01T12:00:00.000Z",
    updated_at: "2026-04-01T15:00:00.000Z",
  },
  {
    id: "00000000-0000-4000-8000-00000000d301",
    title: "Litigation intake automation",
    status: "running",
    primary_agent_id: null,
    created_at: "2026-01-15T12:00:00.000Z",
    updated_at: "2026-04-05T15:00:00.000Z",
  },
];

const ADMIN_AGENTS: LinkbrainAgentOption[] = [
  { id: "agent-librarian", display_name: "Librarian LiNKbot" },
  { id: "agent-lisa", display_name: "Lisa — operator assistant" },
];

const LICENSEE_AGENTS: LinkbrainAgentOption[] = [
  { id: "agent-xyz-ops", display_name: "Ops LiNKbot" },
  { id: "agent-lexos-paralegal", display_name: "Paralegal LiNKbot" },
];

function seedFile(
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
    has_published: true,
    published_at: "2026-03-15T10:00:00.000Z",
    collective,
  };
}

function seedInbox(
  id: string,
  body: string,
  collective: CollectiveInboxDraft["collective"],
  scope: BrainInboxRow["scope"],
  extra?: Partial<BrainInboxRow>,
): CollectiveInboxDraft {
  return {
    id,
    file_id: extra?.file_id ?? `file-${id}`,
    logical_path: extra?.logical_path ?? `inbox/${id}.md`,
    file_kind: extra?.file_kind ?? "standard",
    status: "draft",
    body,
    predecessor_version_id: null,
    predecessor_body: null,
    created_by: "seed:admin-collective",
    created_at: "2026-04-08T09:00:00.000Z",
    published_at: null,
    scope,
    mission_id: extra?.mission_id ?? null,
    agent_id: extra?.agent_id ?? null,
    inbox_item_type: extra?.inbox_item_type ?? "librarian",
    sensitivity: "internal",
    memory_tags: null,
    collective,
  };
}

/** Last-resort AdminDB-shaped fixtures when live collective brain tables are empty (not UI mock overlay). */
export function buildAdminCollectiveBrainSeed(): Pick<
  LinkbrainPageData,
  "brainDrafts" | "brainPartitionFiles" | "missions" | "missionRows" | "agents"
> {
  const xyzName = LICENSEE_REGISTRY.find((r) => r.id === XYZ)?.name ?? XYZ;
  const lexosName = LICENSEE_REGISTRY.find((r) => r.id === LEXOS)?.name ?? LEXOS;

  const inbox: CollectiveInboxDraft[] = [
    seedInbox(
      "seed-inbox-admin-1",
      "Studio playbook update: librarian triage checklist for collective inbox approvals.",
      {
        provenance: {
          licenseeId: "linktrend",
          licenseeName: "LiNKtrend Admin",
          partition: "project",
          projectId: ADMIN_PROJECT.id,
          projectTitle: ADMIN_PROJECT.title,
        },
        tags: { pattern: "Governance", useCase: "Retrieval" },
      },
      "mission",
      { mission_id: ADMIN_PROJECT.id, inbox_item_type: "librarian" },
    ),
    seedInbox(
      "seed-inbox-xyz-1",
      "Anonymised lead qualification heuristic — SMB website vertical (review before publish).",
      {
        provenance: {
          licenseeId: XYZ,
          licenseeName: xyzName,
          partition: "licensee",
        },
        tags: { industry: "Marketing", pattern: "Lead Intake", useCase: "CRM Handoff" },
      },
      "company",
    ),
  ];

  const files: CollectiveMemoryFile[] = [
    seedFile(
      "seed-file-admin-project",
      "admin/suite-factory/runbook.md",
      "mission",
      {
        provenance: {
          licenseeId: "linktrend",
          licenseeName: "LiNKtrend Admin",
          partition: "project",
          projectId: ADMIN_PROJECT.id,
          projectTitle: ADMIN_PROJECT.title,
        },
        tags: { pattern: "Governance" },
      },
      { mission_id: ADMIN_PROJECT.id },
    ),
    seedFile(
      "seed-file-xyz-company",
      "collective/marketing/lead-qualification.md",
      "company",
      {
        provenance: { licenseeId: XYZ, licenseeName: xyzName, partition: "licensee" },
        tags: { industry: "Marketing", useCase: "CRM Handoff" },
      },
    ),
    seedFile(
      "seed-file-xyz-agent",
      "agents/ops/daily-log.md",
      "agent",
      {
        provenance: {
          licenseeId: XYZ,
          licenseeName: xyzName,
          partition: "agent",
          linkbotId: "agent-xyz-ops",
          linkbotName: "Ops LiNKbot",
        },
        tags: { pattern: "Lead Intake" },
      },
      { agent_id: "agent-xyz-ops", file_kind: "daily_log" },
    ),
    seedFile(
      "seed-file-lexos-company",
      "collective/legal/intake-policy.md",
      "company",
      {
        provenance: { licenseeId: LEXOS, licenseeName: lexosName, partition: "licensee" },
        tags: { industry: "Legal", useCase: "Document Review" },
      },
    ),
  ];

  const missions = [ADMIN_PROJECT, ...LICENSEE_PROJECTS];
  const agents = [...ADMIN_AGENTS, ...LICENSEE_AGENTS];

  return {
    brainDrafts: inbox,
    brainPartitionFiles: files,
    missions,
    missionRows: missions.map((mission) => ({
      mission,
      memoryCount: 1,
      lastMemoryAt: "2026-04-01T15:00:00.000Z",
    })),
    agents,
  };
}

export type AdminCollectiveAuditSeedRow = {
  event_type: string;
  mission_id: string | null;
  mission_title: string | null;
  licensee_id?: string | null;
  licensee_name?: string | null;
  admin_context?: boolean;
  created_at: string;
};

/** Last-resort audit rows for Admin LiNKbrain when traces are empty (not UI mock overlay). */
export function buildAdminCollectiveAuditSeed(): AdminCollectiveAuditSeedRow[] {
  const xyzName = LICENSEE_REGISTRY.find((r) => r.id === XYZ)?.name ?? XYZ;
  const lexosName = LICENSEE_REGISTRY.find((r) => r.id === LEXOS)?.name ?? LEXOS;
  const now = Date.now();

  return [
    {
      event_type: "linkskills.lease.executed",
      mission_id: ADMIN_PROJECT.id,
      mission_title: ADMIN_PROJECT.title,
      licensee_id: "linktrend",
      licensee_name: "LiNKtrend Admin",
      admin_context: true,
      created_at: new Date(now - 7_200_000).toISOString(),
    },
    {
      event_type: "brain.collective.inbox_received",
      mission_id: LICENSEE_PROJECTS[0]!.id,
      mission_title: LICENSEE_PROJECTS[0]!.title,
      licensee_id: XYZ,
      licensee_name: xyzName,
      admin_context: false,
      created_at: new Date(now - 86_400_000).toISOString(),
    },
    {
      event_type: "brain.collective.approved",
      mission_id: LICENSEE_PROJECTS[1]!.id,
      mission_title: LICENSEE_PROJECTS[1]!.title,
      licensee_id: LEXOS,
      licensee_name: lexosName,
      admin_context: false,
      created_at: new Date(now - 172_800_000).toISOString(),
    },
  ];
}
