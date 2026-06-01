/**
 * LinkSites template selection phase helpers (LTS-103).
 * Templates come from LiNKsites external registry — not invented in monorepo.
 */

import type { LinksitesQualificationRecord } from "../qualification/qualification.js";

export const LINKSITES_REGISTRY_SOURCE = "linksites_external" as const;

export type TemplateSelectionRecord = {
  run_id: string;
  tenant_id: string;
  template_id: string;
  registry_source: typeof LINKSITES_REGISTRY_SOURCE;
  selected_at: string;
  audit_event_ref?: string;
};

const INDUSTRY_TEMPLATE_MAP: Record<string, string> = {
  professional_services: "professional_v1",
  dental: "professional_v1",
  local_service: "local_service_v1",
  retail: "retail_v1",
};

/**
 * Select a template ID from LiNKsites registry guidance based on qualification signals.
 */
export function selectTemplateFromRegistry(params: {
  tenant_id: string;
  run_id: string;
  industry: string;
  qualification?: Pick<LinksitesQualificationRecord, "business_type" | "industry">;
}): TemplateSelectionRecord {
  const industrySignal = params.qualification?.industry ?? params.industry;
  const normalized = industrySignal.toLowerCase().replace(/\s+/g, "_");
  const businessType = params.qualification?.business_type ?? "small_business";

  let templateId = INDUSTRY_TEMPLATE_MAP[normalized];
  if (!templateId && businessType === "local_service") {
    templateId = "local_service_v1";
  }
  if (!templateId) {
    templateId = "minimal_v1";
  }

  return {
    tenant_id: params.tenant_id,
    run_id: params.run_id,
    template_id: templateId,
    registry_source: LINKSITES_REGISTRY_SOURCE,
    selected_at: new Date().toISOString(),
  };
}
