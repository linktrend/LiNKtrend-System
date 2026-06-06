/**
 * Fleet v1 dashboard model — OpenClaw profiles, Agent Zero lanes (Wave 6.5).
 */

export type FleetOpenClawProfileRow = {
  agentId: string;
  label: string;
  slotKind: "ceo" | "suite_head" | "suite_role";
  tenantKind: "admin" | "client" | "both";
  suiteId: string | null;
  lastRunAt: string | null;
};

export type FleetAgentZeroLaneRow = {
  laneId: string;
  queueName: string;
  label: string;
  lastRunAt: string | null;
};

export type FleetDashboardSummary = {
  openclawProfiles: FleetOpenClawProfileRow[];
  agentZeroLanes: FleetAgentZeroLaneRow[];
  gatewayCap: number;
  ramNoteGb: number;
  hostLabel: string;
};

/** Static fleet v1 registry for Admin dashboard (runtime probes wire in Wave 11). */
export function buildFleetV1DashboardSummary(opts?: {
  lastRuns?: Record<string, string | null>;
  ramNoteGb?: number;
  hostLabel?: string;
}): FleetDashboardSummary {
  const lastRuns = opts?.lastRuns ?? {};

  const openclawProfiles: FleetOpenClawProfileRow[] = [
    {
      agentId: "admin-openclaw",
      label: "Admin CEO / LiNKsuitegen head",
      slotKind: "ceo",
      tenantKind: "admin",
      suiteId: "linksuitegen",
      lastRunAt: lastRuns["admin-openclaw"] ?? null,
    },
    {
      agentId: "ceo-client",
      label: "Client CEO (Linktrend)",
      slotKind: "ceo",
      tenantKind: "client",
      suiteId: null,
      lastRunAt: lastRuns["ceo-client"] ?? null,
    },
    {
      agentId: "linksites-head",
      label: "LinkSites suite head",
      slotKind: "suite_head",
      tenantKind: "client",
      suiteId: "linksites",
      lastRunAt: lastRuns["linksites-head"] ?? null,
    },
    {
      agentId: "linkdeveloper-orchestrator",
      label: "LiNKdeveloper orchestrator",
      slotKind: "suite_head",
      tenantKind: "client",
      suiteId: "linkdeveloper",
      lastRunAt: lastRuns["linkdeveloper-orchestrator"] ?? null,
    },
    {
      agentId: "linkdeveloper-steward",
      label: "LiNKdeveloper product steward",
      slotKind: "suite_role",
      tenantKind: "client",
      suiteId: "linkdeveloper",
      lastRunAt: lastRuns["linkdeveloper-steward"] ?? null,
    },
  ];

  const agentZeroLanes: FleetAgentZeroLaneRow[] = [
    { laneId: "az-librarian", queueName: "linktrend.az.librarian", label: "LiNKbrain librarian", lastRunAt: lastRuns["az-librarian"] ?? null },
    { laneId: "az-suitegen-factory", queueName: "linktrend.az.suitegen-factory", label: "LiNKsuitegen factory analysts", lastRunAt: lastRuns["az-suitegen-factory"] ?? null },
    { laneId: "az-linksites-research", queueName: "linktrend.az.linksites-research", label: "LinkSites research", lastRunAt: lastRuns["az-linksites-research"] ?? null },
    { laneId: "az-linksites-build", queueName: "linktrend.az.linksites-build", label: "LinkSites build", lastRunAt: lastRuns["az-linksites-build"] ?? null },
    { laneId: "az-linkdeveloper-analysis", queueName: "linktrend.az.linkdeveloper-analysis", label: "LiNKdeveloper analysis", lastRunAt: lastRuns["az-linkdeveloper-analysis"] ?? null },
    { laneId: "az-linkdeveloper-architecture", queueName: "linktrend.az.linkdeveloper-architecture", label: "LiNKdeveloper architecture", lastRunAt: lastRuns["az-linkdeveloper-architecture"] ?? null },
    { laneId: "az-linkdeveloper-validation", queueName: "linktrend.az.linkdeveloper-validation", label: "LiNKdeveloper validation", lastRunAt: lastRuns["az-linkdeveloper-validation"] ?? null },
    { laneId: "az-linkdeveloper-ops", queueName: "linktrend.az.linkdeveloper-ops", label: "LiNKdeveloper ops", lastRunAt: lastRuns["az-linkdeveloper-ops"] ?? null },
  ];

  return {
    openclawProfiles,
    agentZeroLanes,
    gatewayCap: 5,
    ramNoteGb: opts?.ramNoteGb ?? 16,
    hostLabel: opts?.hostLabel ?? "linkdroplet-00 (DO launch)",
  };
}
