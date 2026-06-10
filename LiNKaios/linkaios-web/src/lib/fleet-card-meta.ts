import type { AgentRecord } from "@linktrend/shared-types";

import { parseAgentFleetClassification } from "@/lib/agent-fleet-classification";
import { buildFleetDashboardRows, type FleetProfileRow } from "@/lib/admin/fleet-dashboard";
import { openClawAgentForRole } from "@/lib/suite-role-mapping";

export type FleetCardMeta = {
  runtimeId: string;
  kind: FleetProfileRow["kind"] | "linkaios";
  runtimeStatus: FleetProfileRow["status"] | LinkbotFleetCardStatus;
};

export type LinkbotFleetCardStatus = "online" | "idle" | "busy" | "unknown" | "inactive";

const FLEET_BY_ID = new Map<string, FleetProfileRow>(
  buildFleetDashboardRows().map((row) => [row.id, row]),
);

/** Exported for native UI launcher — resolves OpenClaw profile id when present. */
export function runtimeIdFromSettingsForNativeUi(runtimeSettings: unknown): string | null {
  return runtimeIdFromSettings(runtimeSettings);
}

function runtimeIdFromSettings(runtimeSettings: unknown): string | null {
  if (!runtimeSettings || typeof runtimeSettings !== "object") return null;
  const raw = runtimeSettings as Record<string, unknown>;
  const fleet = raw.linkaios_fleet;
  if (fleet && typeof fleet === "object") {
    const fleetRow = fleet as Record<string, unknown>;
    for (const key of ["runtime_id", "openclaw_agent_id", "profile_id"]) {
      const v = fleetRow[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  for (const key of ["openclaw_agent_id", "runtime_id"]) {
    const v = raw[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const roleId = typeof raw.role_id === "string" ? raw.role_id : null;
  if (roleId) {
    const mapped = openClawAgentForRole(roleId);
    if (mapped) return mapped;
  }
  return null;
}

/** Fleet v1 runtime row merged onto a LiNKbot registry card. */
export function resolveFleetCardMeta(
  agent: Pick<AgentRecord, "id" | "runtime_settings">,
  presenceStatus?: LinkbotFleetCardStatus,
): FleetCardMeta {
  const runtimeId = runtimeIdFromSettings(agent.runtime_settings ?? null) ?? String(agent.id);
  const fleetRow = FLEET_BY_ID.get(runtimeId);
  if (fleetRow) {
    return {
      runtimeId: fleetRow.id,
      kind: fleetRow.kind,
      runtimeStatus: presenceStatus ?? fleetRow.status,
    };
  }

  const classification = parseAgentFleetClassification(agent.runtime_settings ?? null);
  const kind: FleetCardMeta["kind"] =
    runtimeId.includes("openclaw") || runtimeId.includes("-head") || runtimeId.includes("ceo")
      ? "openclaw"
      : runtimeId.startsWith("az-")
        ? "agent_zero"
        : classification.scope === "licensor"
          ? "openclaw"
          : "linkaios";

  return {
    runtimeId,
    kind,
    runtimeStatus: presenceStatus ?? "unknown",
  };
}

export function formatFleetKindLabel(kind: FleetCardMeta["kind"]): string {
  switch (kind) {
    case "openclaw":
      return "OpenClaw";
    case "agent_zero":
      return "Agent Zero";
    default:
      return "LiNKaios";
  }
}

export function fleetStatusTone(status: LinkbotFleetCardStatus | FleetProfileRow["status"]): string {
  if (status === "online" || status === "busy") return "text-emerald-700 dark:text-emerald-400";
  if (status === "idle") return "text-amber-700 dark:text-amber-400";
  if (status === "inactive") return "text-zinc-500 dark:text-zinc-400";
  return "text-zinc-600 dark:text-zinc-400";
}
