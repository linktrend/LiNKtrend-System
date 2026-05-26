/**
 * Licensee organisation topology — chosen at signup, drives Company hub layout,
 * active context switchers, LiNKbrain sharing defaults, and billing expansion SKUs.
 */

export const TENANT_TOPOLOGY_MODES = [
  "single_entity_single_brand",
  "single_entity_many_brands",
  "many_entities_many_brands",
] as const;

export type TenantTopologyMode = (typeof TENANT_TOPOLOGY_MODES)[number];

export const DEFAULT_TENANT_TOPOLOGY: TenantTopologyMode = "many_entities_many_brands";

export type TopologyDisplayMode = {
  /** Show legal-entity switcher (Company hub + shell). */
  showCompanySwitcher: boolean;
  /** Show brand switcher when the active entity has more than one brand. */
  showBrandSwitcher: boolean;
  /** Brand tab lists multiple brands (vs inline assets for the sole brand). */
  brandTabIsCatalog: boolean;
};

export function topologyDisplayMode(mode: TenantTopologyMode): TopologyDisplayMode {
  switch (mode) {
    case "single_entity_single_brand":
      return {
        showCompanySwitcher: false,
        showBrandSwitcher: false,
        brandTabIsCatalog: false,
      };
    case "single_entity_many_brands":
      return {
        showCompanySwitcher: false,
        showBrandSwitcher: true,
        brandTabIsCatalog: true,
      };
    case "many_entities_many_brands":
      return {
        showCompanySwitcher: true,
        showBrandSwitcher: true,
        brandTabIsCatalog: true,
      };
  }
}

/** Primary legal entity for single-entity topologies (demo fixture id). */
export const SINGLE_ENTITY_DEMO_COMPANY_ID = "xyz-marketing";

export function companiesVisibleInTopology(mode: TenantTopologyMode, allCompanyIds: string[]): string[] {
  if (mode === "single_entity_single_brand" || mode === "single_entity_many_brands") {
    return [SINGLE_ENTITY_DEMO_COMPANY_ID];
  }
  return allCompanyIds;
}

export function resolveTopologyCompanyId(
  mode: TenantTopologyMode,
  requestedCompanyId: string | null | undefined,
  fallbackCompanyId: string,
): string {
  const visible = companiesVisibleInTopology(mode, [requestedCompanyId ?? fallbackCompanyId, fallbackCompanyId]);
  const allowed = new Set(visible);
  if (requestedCompanyId && allowed.has(requestedCompanyId)) return requestedCompanyId;
  return visible[0] ?? fallbackCompanyId;
}

export type SensitiveIndustryFlag = {
  /** Cross-licensee anonymized learning off by default. */
  crossLicenseeSharingDefault: boolean;
};

const SENSITIVE_INDUSTRY_KEYWORDS = ["legal", "health", "medical", "dental", "financial", "bank", "insurance"] as const;

export function sensitiveIndustryDefaults(industryLabel: string): SensitiveIndustryFlag {
  const lower = industryLabel.toLowerCase();
  const sensitive = SENSITIVE_INDUSTRY_KEYWORDS.some((k) => lower.includes(k));
  return { crossLicenseeSharingDefault: !sensitive };
}

export const TOPOLOGY_MODE_LABELS: Record<TenantTopologyMode, { title: string; description: string }> = {
  single_entity_single_brand: {
    title: "Single company, single brand",
    description: "One legal entity and one market brand. No company or brand switchers.",
  },
  single_entity_many_brands: {
    title: "Single company, many brands",
    description: "One legal entity with multiple consumer or product brands under the Brand tab.",
  },
  many_entities_many_brands: {
    title: "Multiple companies, multiple brands",
    description: "Portfolio or multi-client operator — switch legal entity, then brand within that entity.",
  },
};
