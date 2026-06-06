/**
 * Agent Zero fleet v1 — eight named lanes (STUDIO_FORWARD_PLAN §1.4, Wave 2.3).
 *
 * @see docs/ecosystem/FLEET_AND_RUNTIME_POLICY.md
 */

/** Canonical Agent Zero lane IDs for fleet v1. */
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

export type FleetV1AgentZeroLaneId =
  (typeof FLEET_V1_AGENT_ZERO_LANES)[keyof typeof FLEET_V1_AGENT_ZERO_LANES];

/** Ordered lane list for bootstrap smoke and worker registration. */
export const FLEET_V1_AGENT_ZERO_LANE_IDS: FleetV1AgentZeroLaneId[] = [
  FLEET_V1_AGENT_ZERO_LANES.LIBRARIAN,
  FLEET_V1_AGENT_ZERO_LANES.SUITEGEN_FACTORY,
  FLEET_V1_AGENT_ZERO_LANES.LINKSITES_RESEARCH,
  FLEET_V1_AGENT_ZERO_LANES.LINKSITES_BUILD,
  FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_ANALYSIS,
  FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_ARCHITECTURE,
  FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_VALIDATION,
  FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_OPS,
];

/**
 * NATS / worker queue names — one durable consumer per lane on link-agentzero worker.
 * Prefix matches link-agentzero `AGENTZERO_LANE_QUEUE_PREFIX` convention.
 */
export const AGENT_ZERO_LANE_QUEUE_NAMES: Record<FleetV1AgentZeroLaneId, string> = {
  [FLEET_V1_AGENT_ZERO_LANES.LIBRARIAN]: "linktrend.az.librarian",
  [FLEET_V1_AGENT_ZERO_LANES.SUITEGEN_FACTORY]: "linktrend.az.suitegen-factory",
  [FLEET_V1_AGENT_ZERO_LANES.LINKSITES_RESEARCH]: "linktrend.az.linksites-research",
  [FLEET_V1_AGENT_ZERO_LANES.LINKSITES_BUILD]: "linktrend.az.linksites-build",
  [FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_ANALYSIS]: "linktrend.az.linkdeveloper-analysis",
  [FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_ARCHITECTURE]: "linktrend.az.linkdeveloper-architecture",
  [FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_VALIDATION]: "linktrend.az.linkdeveloper-validation",
  [FLEET_V1_AGENT_ZERO_LANES.LINKDEVELOPER_OPS]: "linktrend.az.linkdeveloper-ops",
};

export function isFleetV1AgentZeroLaneId(value: string): value is FleetV1AgentZeroLaneId {
  return (FLEET_V1_AGENT_ZERO_LANE_IDS as readonly string[]).includes(value);
}

export function queueNameForLane(laneId: FleetV1AgentZeroLaneId): string {
  return AGENT_ZERO_LANE_QUEUE_NAMES[laneId];
}
