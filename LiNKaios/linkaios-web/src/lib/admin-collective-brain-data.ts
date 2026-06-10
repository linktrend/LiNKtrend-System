import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { LicensorScope } from "@/lib/app-roles";
import {
  isAdminViewScope,
  isAllLicenseesScope,
  isPlatformAllScope,
  isSingleLicenseeScope,
  matchesCollectiveDemoLicenseeScope,
} from "@/lib/licensor-view-scope";
import { buildAdminCollectiveBrainSeed } from "@/lib/admin-collective-brain-seed";
import type { LinkbrainPageData, LinkbrainTab } from "@/lib/linkbrain-data";
import type { CollectiveInboxDraft, CollectiveMemoryFile } from "@/lib/collective-linkbrain";

function collectiveLicenseeIdFromTags(memoryTags: unknown): string | null {
  if (!memoryTags || typeof memoryTags !== "object") return null;
  const row = memoryTags as Record<string, unknown>;
  const id = row.collective_licensee_id ?? row.licensee_id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

function rowMatchesViewScope(scope: LicensorScope, licenseeId: string | null, isAdminRow: boolean): boolean {
  if (isPlatformAllScope(scope)) return true;
  if (isAdminViewScope(scope)) return isAdminRow;
  if (isAllLicenseesScope(scope)) return !isAdminRow;
  if (isSingleLicenseeScope(scope)) {
    if (!licenseeId) return false;
    return matchesCollectiveDemoLicenseeScope(scope, licenseeId);
  }
  return true;
}

function filterSeedForTab(
  seed: ReturnType<typeof buildAdminCollectiveBrainSeed>,
  tab: LinkbrainTab,
  scope: LicensorScope,
  missionId?: string,
  agentId?: string,
) {
  const adminProgramIds = new Set([seed.missions[0]?.id].filter(Boolean) as string[]);

  const missions = seed.missions.filter((m) => {
    const isAdmin = adminProgramIds.has(String(m.id));
    const licenseeId = isAdmin ? "linktrend" : m.id.startsWith("00000000-0000-4000-8000-00000000d2") ? "xyz-marketing" : "lexos-legal";
    if (!rowMatchesViewScope(scope, licenseeId, isAdmin)) return false;
    if (tab === "project" && missionId && String(m.id) !== missionId) return false;
    return true;
  });

  const agents = seed.agents.filter((a) => {
    const isAdmin = a.id.startsWith("agent-l");
    const licenseeId = a.id.includes("xyz") ? "xyz-marketing" : a.id.includes("lexos") ? "lexos-legal" : "linktrend";
    if (!rowMatchesViewScope(scope, licenseeId, isAdmin)) return false;
    if (tab === "agent" && agentId && a.id !== agentId) return false;
    return true;
  });

  const inbox = (seed.brainDrafts as CollectiveInboxDraft[]).filter((d) => {
    const licenseeId = d.collective.provenance.licenseeId;
    const isAdmin = licenseeId === "linktrend";
    if (!rowMatchesViewScope(scope, licenseeId, isAdmin)) return false;
    if (tab === "inbox") return true;
    return false;
  });

  const files = (seed.brainPartitionFiles as CollectiveMemoryFile[]).filter((f) => {
    const licenseeId = f.collective.provenance.licenseeId;
    const isAdmin = licenseeId === "linktrend";
    if (!rowMatchesViewScope(scope, licenseeId, isAdmin)) return false;
    if (tab === "project" && f.scope === "mission") {
      if (missionId && String(f.mission_id) !== missionId) return false;
      return true;
    }
    if (tab === "agent" && f.scope === "agent") {
      if (agentId && f.agent_id !== agentId) return false;
      return true;
    }
    if (tab === "company" && f.scope === "company") return true;
    if (tab === "ask") return true;
    return false;
  });

  return {
    ...seed,
    missions,
    missionRows: seed.missionRows.filter((row) => missions.some((m) => m.id === row.mission.id)),
    agents,
    brainDrafts: tab === "inbox" ? inbox : seed.brainDrafts,
    brainPartitionFiles: ["project", "agent", "company", "ask"].includes(tab) ? files : seed.brainPartitionFiles,
  };
}

function hasReviewableContent(data: LinkbrainPageData, tab: LinkbrainTab): boolean {
  if (tab === "inbox") return data.brainDrafts.length > 0;
  if (tab === "project" || tab === "agent" || tab === "company" || tab === "ask") {
    return data.brainPartitionFiles.length > 0;
  }
  return true;
}

/**
 * Admin LiNKbrain: prefer live DB rows; apply view-scope filtering; last-resort seed when empty.
 */
export async function enrichAdminCollectiveBrainPageData(
  _supabase: SupabaseClient,
  data: LinkbrainPageData,
  params: {
    tab: LinkbrainTab;
    licensorScope: LicensorScope;
    missionId?: string;
    agentId?: string;
    adminProgramIds: string[];
  },
): Promise<LinkbrainPageData> {
  let next = { ...data };

  if (params.adminProgramIds.length > 0) {
    const adminIds = new Set(params.adminProgramIds);
    next = {
      ...next,
      missions: next.missions.filter((m) => adminIds.has(String(m.id)) || !isAdminViewScope(params.licensorScope)),
      missionRows: next.missionRows.filter(
        (row) => adminIds.has(String(row.mission.id)) || !isAdminViewScope(params.licensorScope),
      ),
    };
  }

  if (!hasReviewableContent(next, params.tab)) {
    const seed = filterSeedForTab(buildAdminCollectiveBrainSeed(), params.tab, params.licensorScope, params.missionId, params.agentId);
    next = {
      ...next,
      brainDrafts: seed.brainDrafts,
      brainPartitionFiles: seed.brainPartitionFiles,
      missions: seed.missions.length > 0 ? seed.missions : next.missions,
      missionRows: seed.missionRows.length > 0 ? seed.missionRows : next.missionRows,
      agents: seed.agents.length > 0 ? seed.agents : next.agents,
    };
  }

  if (isAdminViewScope(params.licensorScope)) {
    next = {
      ...next,
      brainDrafts: next.brainDrafts.filter((d) => {
        const tagLicensee = collectiveLicenseeIdFromTags(d.memory_tags);
        return d.scope === "mission" || tagLicensee === "linktrend";
      }),
      brainPartitionFiles: next.brainPartitionFiles.filter((f) => {
        const tagLicensee = collectiveLicenseeIdFromTags((f as { memory_tags?: unknown }).memory_tags);
        return f.scope === "mission" || tagLicensee === "linktrend";
      }),
    };
  } else if (isAllLicenseesScope(params.licensorScope)) {
    next = {
      ...next,
      brainDrafts: next.brainDrafts.filter((d) => d.scope !== "mission" || collectiveLicenseeIdFromTags(d.memory_tags) !== "linktrend"),
      brainPartitionFiles: next.brainPartitionFiles.filter(
        (f) => f.scope !== "mission" || collectiveLicenseeIdFromTags((f as { memory_tags?: unknown }).memory_tags) !== "linktrend",
      ),
    };
  } else if (isSingleLicenseeScope(params.licensorScope)) {
    next = {
      ...next,
      brainDrafts: next.brainDrafts.filter((d) => {
        const tagLicensee = collectiveLicenseeIdFromTags(d.memory_tags);
        return !tagLicensee || matchesCollectiveDemoLicenseeScope(params.licensorScope, tagLicensee);
      }),
      brainPartitionFiles: next.brainPartitionFiles.filter((f) => {
        const tagLicensee = collectiveLicenseeIdFromTags((f as { memory_tags?: unknown }).memory_tags);
        return !tagLicensee || matchesCollectiveDemoLicenseeScope(params.licensorScope, tagLicensee);
      }),
    };
  }

  return next;
}
