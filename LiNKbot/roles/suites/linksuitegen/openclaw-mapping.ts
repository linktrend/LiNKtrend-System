/**
 * LiNKsuitegen: orchestrator roles → Admin OpenClaw head; factory roles → Agent Zero.
 */

import { FLEET_V1_OPENCLAW_AGENTS } from "../../platform/fleet-v1-openclaw.js";

export const LINKSUITEGEN_OPENCLAW_ORCHESTRATOR_AGENT = FLEET_V1_OPENCLAW_AGENTS.ADMIN;
export const LINKSUITEGEN_AGENT_ZERO_FACTORY_LANE = "az-suitegen-factory";

export const LINKSUITEGEN_ORCHESTRATOR_ROLE_IDS = [
  "suitegen_orchestrator_linkbot",
  "handoff_coordinator_linkbot",
] as const;

export const LINKSUITEGEN_FACTORY_ANALYST_ROLE_IDS = [
  "discovery_analyst_linkbot",
  "bop_architect_linkbot",
  "validation_qa_linkbot",
  "linksuitegen_crm_classifier_linkbot",
] as const;

export type LinksuitegenOrchestratorRoleId = (typeof LINKSUITEGEN_ORCHESTRATOR_ROLE_IDS)[number];
export type LinksuitegenFactoryRoleId = (typeof LINKSUITEGEN_FACTORY_ANALYST_ROLE_IDS)[number];

export const LINKSUITEGEN_ROLE_TO_OPENCLAW_AGENT: Record<LinksuitegenOrchestratorRoleId, string> = {
  suitegen_orchestrator_linkbot: LINKSUITEGEN_OPENCLAW_ORCHESTRATOR_AGENT,
  handoff_coordinator_linkbot: LINKSUITEGEN_OPENCLAW_ORCHESTRATOR_AGENT,
};

export const LINKSUITEGEN_FACTORY_ROLE_TO_AGENT_ZERO_LANE: Record<LinksuitegenFactoryRoleId, string> = {
  discovery_analyst_linkbot: LINKSUITEGEN_AGENT_ZERO_FACTORY_LANE,
  bop_architect_linkbot: LINKSUITEGEN_AGENT_ZERO_FACTORY_LANE,
  validation_qa_linkbot: LINKSUITEGEN_AGENT_ZERO_FACTORY_LANE,
  linksuitegen_crm_classifier_linkbot: LINKSUITEGEN_AGENT_ZERO_FACTORY_LANE,
};

export type LinksuitegenRuntime =
  | { runtime: "openclaw"; agentId: string }
  | { runtime: "agent_zero"; laneId: string };

export function runtimeForLinksuitegenRole(roleId: string): LinksuitegenRuntime | null {
  if (roleId in LINKSUITEGEN_ROLE_TO_OPENCLAW_AGENT) {
    return {
      runtime: "openclaw",
      agentId: LINKSUITEGEN_ROLE_TO_OPENCLAW_AGENT[roleId as LinksuitegenOrchestratorRoleId],
    };
  }
  if (roleId in LINKSUITEGEN_FACTORY_ROLE_TO_AGENT_ZERO_LANE) {
    return {
      runtime: "agent_zero",
      laneId: LINKSUITEGEN_FACTORY_ROLE_TO_AGENT_ZERO_LANE[roleId as LinksuitegenFactoryRoleId],
    };
  }
  return null;
}

export function openClawAgentIdForLinksuitegenRole(roleId: string): string | null {
  return LINKSUITEGEN_ROLE_TO_OPENCLAW_AGENT[roleId as LinksuitegenOrchestratorRoleId] ?? null;
}

export function agentZeroLaneForLinksuitegenRole(roleId: string): string | null {
  return LINKSUITEGEN_FACTORY_ROLE_TO_AGENT_ZERO_LANE[roleId as LinksuitegenFactoryRoleId] ?? null;
}
