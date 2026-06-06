/**
 * Suite role → Agent Zero lane (fleet v1 — STUDIO_FORWARD_PLAN §1.4 / Wave 9.3).
 */

const ROLE_TO_LANE: Record<string, string> = {
  lead_scout_bot: "az-linksites-research",
  research_enrichment_bot: "az-linksites-research",
  website_builder_bot: "az-linksites-build",
  discovery_analyst_linkbot: "az-suitegen-factory",
  bop_architect_linkbot: "az-suitegen-factory",
  validation_qa_linkbot: "az-suitegen-factory",
  linksuitegen_crm_classifier_linkbot: "az-suitegen-factory",
  market_linkbot: "az-linkdeveloper-analysis",
  requirements_linkbot: "az-linkdeveloper-analysis",
  architecture_linkbot: "az-linkdeveloper-architecture",
  platform_linkbot: "az-linkdeveloper-architecture",
  qa_linkbot: "az-linkdeveloper-validation",
  security_linkbot: "az-linkdeveloper-validation",
  devops_linkbot: "az-linkdeveloper-ops",
  librarian_bot: "az-librarian",
};

/** Resolve Agent Zero lane for a LiNKbot role_id. */
export function agentZeroLaneForRole(roleId: string): string | null {
  return ROLE_TO_LANE[roleId] ?? null;
}

export { ROLE_TO_LANE as AGENT_ZERO_ROLE_LANE_MAP };
