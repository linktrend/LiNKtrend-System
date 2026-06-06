/**
 * OpenClaw fleet v1 — five profiles on one gateway (STUDIO_FORWARD_PLAN Wave 1).
 *
 * @see docs/ecosystem/FLEET_AND_RUNTIME_POLICY.md
 */

/** Canonical OpenClaw agentId values for fleet v1. */
export const FLEET_V1_OPENCLAW_AGENTS = {
  ADMIN: "admin-openclaw",
  CEO_CLIENT: "ceo-client",
  LINKSITES_HEAD: "linksites-head",
  LINKDEVELOPER_ORCHESTRATOR: "linkdeveloper-orchestrator",
  LINKDEVELOPER_STEWARD: "linkdeveloper-steward",
} as const;

export type FleetV1OpenClawAgentId =
  (typeof FLEET_V1_OPENCLAW_AGENTS)[keyof typeof FLEET_V1_OPENCLAW_AGENTS];

/** Ordered list for bootstrap smoke and profile registration. */
export const FLEET_V1_OPENCLAW_AGENT_IDS: FleetV1OpenClawAgentId[] = [
  FLEET_V1_OPENCLAW_AGENTS.ADMIN,
  FLEET_V1_OPENCLAW_AGENTS.CEO_CLIENT,
  FLEET_V1_OPENCLAW_AGENTS.LINKSITES_HEAD,
  FLEET_V1_OPENCLAW_AGENTS.LINKDEVELOPER_ORCHESTRATOR,
  FLEET_V1_OPENCLAW_AGENTS.LINKDEVELOPER_STEWARD,
];

export function isFleetV1OpenClawAgentId(value: string): value is FleetV1OpenClawAgentId {
  return (FLEET_V1_OPENCLAW_AGENT_IDS as readonly string[]).includes(value);
}
