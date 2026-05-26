/**
 * LiNKbrain read-scope expansion — items are stored in a home partition; sharing
 * controls which upstream pools retrieval may include (never for restricted items).
 */

import type { TenantTopologyMode } from "@/lib/tenant-topology";

export type MemoryHomePartition = "brand" | "legal_entity" | "licensee";

export type MemorySharingTier = MemoryHomePartition | "platform_anonymized";

export type MemorySharingPolicy = {
  /** Where new writes are anchored by default. */
  homePartition: MemoryHomePartition;
  /** Ordered pools LiNKbrain may include on read (home is always first). */
  readTiers: MemorySharingTier[];
  crossLicenseeAnonymized: boolean;
};

export type MemorySharingOptions = {
  topology: TenantTopologyMode;
  /** Tenant industry label — drives sensitive-industry cross-licensee default. */
  industryLabel?: string;
  /** Explicit tenant override (e.g. agency with strict client walls). */
  strictClientWalls?: boolean;
};

const SENSITIVE_INDUSTRY_KEYWORDS = ["legal", "health", "medical", "dental", "financial", "bank", "insurance"] as const;

function isSensitiveIndustry(industryLabel: string | undefined): boolean {
  if (!industryLabel?.trim()) return false;
  const lower = industryLabel.toLowerCase();
  return SENSITIVE_INDUSTRY_KEYWORDS.some((k) => lower.includes(k));
}

/**
 * Resolve default LiNKbrain sharing for a licensee topology.
 *
 * - Single entity / single brand: home = brand (collapsed with entity until expansion).
 * - Single entity / many brands: segregated by brand; share within legal entity.
 * - Many entities: segregated by entity and brand; share within licensee unless strict walls.
 */
export function resolveMemorySharingPolicy(options: MemorySharingOptions): MemorySharingPolicy {
  const { topology, industryLabel, strictClientWalls } = options;
  const crossLicenseeAnonymized = !isSensitiveIndustry(industryLabel);

  if (topology === "single_entity_single_brand") {
    return {
      homePartition: "brand",
      readTiers: ["brand"],
      crossLicenseeAnonymized,
    };
  }

  if (topology === "single_entity_many_brands") {
    return {
      homePartition: "brand",
      readTiers: ["brand", "legal_entity"],
      crossLicenseeAnonymized,
    };
  }

  // many_entities_many_brands
  if (strictClientWalls) {
    return {
      homePartition: "brand",
      readTiers: ["brand", "legal_entity"],
      crossLicenseeAnonymized,
    };
  }

  return {
    homePartition: "brand",
    readTiers: ["brand", "legal_entity", "licensee"],
    crossLicenseeAnonymized,
  };
}

/** Future retrieval hook — maps policy tiers to Supabase / RPC filter sets. */
export function memorySharingTierLabel(tier: MemorySharingTier): string {
  switch (tier) {
    case "brand":
      return "This brand";
    case "legal_entity":
      return "Company-wide (all brands)";
    case "licensee":
      return "Licensee portfolio";
    case "platform_anonymized":
      return "Anonymized platform learnings";
  }
}
