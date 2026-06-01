/**
 * Admin fleet LiNKbots troubleshooting and capability admin surfaces (LTS-005).
 * Traceability: PPD §4 Admin fleet troubleshoot.
 */

import { ALL_LICENSEES_SCOPE, type LicensorScope } from "@/lib/app-roles";

export type FleetTroubleshootAction = "view_logs" | "restart_session" | "kill_switch_reset";

export type FleetAgentRow = {
  id: string;
  tenantId: string;
  statusLabel: string;
  lastHeartbeatAt?: string | null;
};

export type CapabilityAdminDefault = {
  capability_id: string;
  label: string;
  studio_default: boolean;
  suite_connector: boolean;
};

export const STUDIO_CAPABILITY_DEFAULTS: CapabilityAdminDefault[] = [
  { capability_id: "cap.plane.execution_tracking", label: "Plane execution tracking", studio_default: true, suite_connector: false },
  { capability_id: "cap.zulip.run_messaging", label: "Zulip project messaging", studio_default: true, suite_connector: false },
  { capability_id: "cap.crm.odoo_shadow", label: "Odoo CRM (shadow)", studio_default: true, suite_connector: true },
  { capability_id: "cap.linksites.publish", label: "LinkSites publish", studio_default: true, suite_connector: true },
];

export function fleetTroubleshootHref(agentId: string, action: FleetTroubleshootAction): string {
  switch (action) {
    case "view_logs":
      return `/workers/${encodeURIComponent(agentId)}/sessions`;
    case "restart_session":
      return `/workers/${encodeURIComponent(agentId)}/sessions?action=restart`;
    case "kill_switch_reset":
      return `/skills?agent=${encodeURIComponent(agentId)}&action=reset_kill_switch`;
  }
}

export function aggregateCrossTenantFleet(scope: LicensorScope, rows: FleetAgentRow[]): FleetAgentRow[] {
  if (scope === ALL_LICENSEES_SCOPE) return rows;
  return rows.filter((row) => row.tenantId === scope);
}

export function assertFleetTroubleshootAllowed(
  scope: LicensorScope,
  agentTenantId: string,
): { allowed: boolean; reason?: string } {
  if (scope === ALL_LICENSEES_SCOPE) {
    return {
      allowed: false,
      reason: "Select a licensee scope before fleet troubleshoot actions",
    };
  }
  if (scope !== agentTenantId) {
    return {
      allowed: false,
      reason: `Cross-tenant fleet action blocked: scope ${scope} ≠ agent tenant ${agentTenantId}`,
    };
  }
  return { allowed: true };
}

export function fleetHealthSummary(rows: FleetAgentRow[]): {
  total: number;
  online: number;
  busy: number;
  idle: number;
  inactive: number;
} {
  const onlineLabels = new Set(["Online", "Busy", "Idle"]);
  return {
    total: rows.length,
    online: rows.filter((r) => onlineLabels.has(r.statusLabel)).length,
    busy: rows.filter((r) => r.statusLabel === "Busy").length,
    idle: rows.filter((r) => r.statusLabel === "Idle").length,
    inactive: rows.filter((r) => r.statusLabel === "Inactive").length,
  };
}

export function studioDefaultsForSuite(suiteId: string): CapabilityAdminDefault[] {
  if (suiteId === "linksites") {
    return STUDIO_CAPABILITY_DEFAULTS.filter((c) => c.suite_connector || c.studio_default);
  }
  return STUDIO_CAPABILITY_DEFAULTS.filter((c) => c.studio_default);
}
