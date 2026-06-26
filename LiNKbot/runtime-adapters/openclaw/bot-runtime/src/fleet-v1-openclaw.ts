/**
 * OpenClaw fleet v1 for bot-runtime.
 *
 * Keep this local to the runtime package so the package builds without
 * reaching outside its source root.
 */

export const FLEET_V1_OPENCLAW_AGENTS = {
  ADMIN: "admin-openclaw",
  CEO_CLIENT: "ceo-client",
  LINKSITES_HEAD: "linksites-head",
  LINKDEVELOPER_ORCHESTRATOR: "linkdeveloper-orchestrator",
  LINKDEVELOPER_STEWARD: "linkdeveloper-steward",
} as const;

export type FleetV1OpenClawAgentId =
  (typeof FLEET_V1_OPENCLAW_AGENTS)[keyof typeof FLEET_V1_OPENCLAW_AGENTS];

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
