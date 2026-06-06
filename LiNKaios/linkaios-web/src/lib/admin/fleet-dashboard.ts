/**
 * Fleet v1 dashboard model — OpenClaw profiles, Agent Zero lanes, RAM note (Wave 6.5).
 */

/** Mirror LiNKbot/roles/platform/fleet-v1-openclaw.ts — compile boundary for linkaios-web. */
const FLEET_V1_OPENCLAW_AGENT_IDS = [
  "admin-openclaw",
  "ceo-client",
  "linksites-head",
  "linkdeveloper-orchestrator",
  "linkdeveloper-steward",
] as const;

/** Mirror LiNKbot/roles/platform/agent-zero-lanes.ts */
const FLEET_V1_AGENT_ZERO_LANE_IDS = [
  "az-librarian",
  "az-suitegen-factory",
  "az-linksites-research",
  "az-linksites-build",
  "az-linkdeveloper-analysis",
  "az-linkdeveloper-architecture",
  "az-linkdeveloper-validation",
  "az-linkdeveloper-ops",
] as const;

export type FleetProfileRow = {
  id: string;
  kind: "openclaw" | "agent_zero";
  tenant: "admin" | "client" | "platform";
  suite?: string;
  lastRunLabel: string;
  status: "online" | "idle" | "unknown";
};

export const FLEET_V1_RAM_NOTE =
  "DigitalOcean linkdroplet-00 ships 16 GB RAM — monitor parallel Agent Zero lanes + OpenClaw sub-agents under load (Wave 11.5). Hetzner 64 GB migration deferred.";

export function buildFleetDashboardRows(): FleetProfileRow[] {
  const openclaw: FleetProfileRow[] = FLEET_V1_OPENCLAW_AGENT_IDS.map((id) => ({
    id,
    kind: "openclaw",
    tenant: id === "admin-openclaw" ? "admin" : "client",
    suite:
      id === "linksites-head"
        ? "linksites"
        : id.startsWith("linkdeveloper")
          ? "linkdeveloper"
          : undefined,
    lastRunLabel: "fixture",
    status: "idle",
  }));

  const az: FleetProfileRow[] = FLEET_V1_AGENT_ZERO_LANE_IDS.map((id) => ({
    id,
    kind: "agent_zero",
    tenant: id === "az-librarian" || id === "az-suitegen-factory" ? "platform" : "client",
    suite:
      id === "az-suitegen-factory"
        ? "linksuitegen"
        : id.startsWith("az-linksites")
          ? "linksites"
          : id.startsWith("az-linkdeveloper")
            ? "linkdeveloper"
            : undefined,
    lastRunLabel: "fixture",
    status: "unknown",
  }));

  return [...openclaw, ...az];
}

/** Admin CEO binding — vendor operator routes to admin-openclaw (Wave 6.1). */
export const ADMIN_CEO_OPENCLAW_BINDING = {
  openclawAgentId: "admin-openclaw",
  zulipStream: "# admin-executive",
  inboxPath: "/admin/work/messages",
} as const;
