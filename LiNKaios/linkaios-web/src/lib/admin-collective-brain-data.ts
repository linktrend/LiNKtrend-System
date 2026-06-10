import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { LicensorScope } from "@/lib/app-roles";
import {
  isAdminViewScope,
  isAllLicenseesScope,
  isSingleLicenseeScope,
  matchesCollectiveDemoLicenseeScope,
} from "@/lib/licensor-view-scope";
import type { LinkbrainPageData, LinkbrainTab } from "@/lib/linkbrain-data";

function collectiveLicenseeIdFromTags(memoryTags: unknown): string | null {
  if (!memoryTags || typeof memoryTags !== "object") return null;
  const row = memoryTags as Record<string, unknown>;
  const id = row.collective_licensee_id ?? row.licensee_id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

/**
 * Admin LiNKbrain: apply view-scope filtering to live DB rows only (no seed overlays).
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
