import type { AgentRecord } from "@linktrend/shared-types";

import { isDemoAgentId } from "@/lib/ui-mocks/entities";

export type AgentFleetScope = "licensor" | "licensee";

export type AgentFleetClassification = {
  scope: AgentFleetScope | null;
  tenantId: string | null;
};

const SCOPE_VALUES = new Set<AgentFleetScope>(["licensor", "licensee"]);

/** Parse `runtime_settings.linkaios_fleet` — interim until `linkaios.agents.tenant_id` ships. */
export function parseAgentFleetClassification(runtimeSettings: unknown): AgentFleetClassification {
  if (!runtimeSettings || typeof runtimeSettings !== "object") {
    return { scope: null, tenantId: null };
  }
  const fleet = (runtimeSettings as Record<string, unknown>).linkaios_fleet;
  if (!fleet || typeof fleet !== "object") {
    return { scope: null, tenantId: null };
  }
  const row = fleet as Record<string, unknown>;
  const scopeRaw = row.scope;
  const scope =
    typeof scopeRaw === "string" && SCOPE_VALUES.has(scopeRaw as AgentFleetScope)
      ? (scopeRaw as AgentFleetScope)
      : null;
  const tenantId = typeof row.tenant_id === "string" && row.tenant_id.trim() ? row.tenant_id.trim() : null;
  return { scope, tenantId };
}

export type IsAdminBotInput = Pick<AgentRecord, "id" | "runtime_settings">;

export type IsAdminBotOptions = {
  /** Vendor/licensor tenant UUID — used when fleet metadata only carries tenant_id. */
  licensorTenantId?: string | null;
  /** Demo fixture agents count as admin bots when UI mocks are on. */
  uiMocksDemoAgent?: boolean;
};

/**
 * True when the agent is part of the vendor (licensor) workforce — not a client tenant bot under monitor.
 * On Admin, only admin bots may show the Projects tab (admin programs).
 */
export function isAdminBot(agent: IsAdminBotInput, options: IsAdminBotOptions = {}): boolean {
  if (options.uiMocksDemoAgent && isDemoAgentId(agent.id)) {
    return true;
  }

  const classification = parseAgentFleetClassification(agent.runtime_settings ?? null);

  if (classification.scope === "licensor") return true;
  if (classification.scope === "licensee") return false;

  if (classification.tenantId && options.licensorTenantId) {
    return classification.tenantId === options.licensorTenantId;
  }

  return false;
}
