/**
 * LinkSites qualification phase helpers (LTS-102).
 */

export type LinksitesQualificationRecord = {
  run_id: string;
  tenant_id: string;
  business_type: string;
  industry: string;
  qualified_at: string;
  audit_event_ref?: string;
};

export function buildQualificationFromResearchBundle(params: {
  tenant_id: string;
  run_id: string;
  lead_research_bundle: Record<string, unknown>;
  lead_input?: Record<string, unknown>;
}): LinksitesQualificationRecord {
  const industry =
    (typeof params.lead_input?.industry === "string" && params.lead_input.industry) ||
    (Array.isArray(params.lead_research_bundle.comparable_businesses) &&
      typeof (params.lead_research_bundle.comparable_businesses as Array<Record<string, unknown>>)[0]
        ?.industry === "string" &&
      String(
        (params.lead_research_bundle.comparable_businesses as Array<Record<string, unknown>>)[0]
          ?.industry,
      )) ||
    "professional_services";

  const business_type =
    (typeof params.lead_input?.business_type === "string" && params.lead_input.business_type) ||
    "small_business";

  return {
    tenant_id: params.tenant_id,
    run_id: params.run_id,
    business_type,
    industry,
    qualified_at: new Date().toISOString(),
  };
}
