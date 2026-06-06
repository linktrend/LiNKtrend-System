/**
 * Fleet v1 runtime mapping tables for bot-runtime compile boundary.
 * Keep in sync with LiNKbot/roles suite openclaw-mapping and agent-zero-mapping modules.
 */

export const FLEET_V1_OPENCLAW_AGENTS = {
  ADMIN: "admin-openclaw",
  CEO_CLIENT: "ceo-client",
  LINKSITES_HEAD: "linksites-head",
  LINKDEVELOPER_ORCHESTRATOR: "linkdeveloper-orchestrator",
  LINKDEVELOPER_STEWARD: "linkdeveloper-steward",
} as const;

export const FLEET_V1_AGENT_ZERO_LANES = {
  LIBRARIAN: "az-librarian",
  SUITEGEN_FACTORY: "az-suitegen-factory",
  LINKSITES_RESEARCH: "az-linksites-research",
  LINKSITES_BUILD: "az-linksites-build",
  LINKDEVELOPER_ANALYSIS: "az-linkdeveloper-analysis",
  LINKDEVELOPER_ARCHITECTURE: "az-linkdeveloper-architecture",
  LINKDEVELOPER_VALIDATION: "az-linkdeveloper-validation",
  LINKDEVELOPER_OPS: "az-linkdeveloper-ops",
} as const;

export const FLEET_V1_AGENT_ZERO_LANE_IDS = [
  FLEET_V1_AGENT_ZERO_LANES.LIBRARIAN,
  FLEET_V1_AGENT_ZERO_LANES.SUITEGEN_FACTORY,
  FLEET_V1_AGENT_ZERO_LANES.LINKSITES_RESEARCH,
  FLEET_V1_AGENT_ZERO_LANES.LINKSITES_BUILD,
  FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_ANALYSIS,
  FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_ARCHITECTURE,
  FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_VALIDATION,
  FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_OPS,
] as const;

/** OpenClaw agentId per role_id (null roles use Agent Zero or automation). */
export const OPENCLAW_ROLE_TO_AGENT: Record<string, string> = {
  outreach_bot: FLEET_V1_OPENCLAW_AGENTS.LINKSITES_HEAD,
  suite_orchestrator_linkbot: FLEET_V1_OPENCLAW_AGENTS.LINKDEVELOPER_ORCHESTRATOR,
  product_steward_linkbot: FLEET_V1_OPENCLAW_AGENTS.LINKDEVELOPER_STEWARD,
  suitegen_orchestrator_linkbot: FLEET_V1_OPENCLAW_AGENTS.ADMIN,
  handoff_coordinator_linkbot: FLEET_V1_OPENCLAW_AGENTS.ADMIN,
  ceo_client_linkbot: FLEET_V1_OPENCLAW_AGENTS.CEO_CLIENT,
  admin_openclaw_linkbot: FLEET_V1_OPENCLAW_AGENTS.ADMIN,
};

/** Agent Zero lane per role_id. */
export const AGENT_ZERO_ROLE_TO_LANE: Record<string, string> = {
  librarian_bot: FLEET_V1_AGENT_ZERO_LANES.LIBRARIAN,
  lead_scout_bot: FLEET_V1_AGENT_ZERO_LANES.LINKSITES_RESEARCH,
  research_enrichment_bot: FLEET_V1_AGENT_ZERO_LANES.LINKSITES_RESEARCH,
  website_builder_bot: FLEET_V1_AGENT_ZERO_LANES.LINKSITES_BUILD,
  discovery_analyst_linkbot: FLEET_V1_AGENT_ZERO_LANES.SUITEGEN_FACTORY,
  bop_architect_linkbot: FLEET_V1_AGENT_ZERO_LANES.SUITEGEN_FACTORY,
  validation_qa_linkbot: FLEET_V1_AGENT_ZERO_LANES.SUITEGEN_FACTORY,
  linksuitegen_crm_classifier_linkbot: FLEET_V1_AGENT_ZERO_LANES.SUITEGEN_FACTORY,
  market_linkbot: FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_ANALYSIS,
  requirements_linkbot: FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_ANALYSIS,
  architecture_linkbot: FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_ARCHITECTURE,
  platform_linkbot: FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_ARCHITECTURE,
  qa_linkbot: FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_VALIDATION,
  security_linkbot: FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_VALIDATION,
  devops_linkbot: FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_OPS,
};
