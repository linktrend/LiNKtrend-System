import type { AgentRecord } from "@linktrend/shared-types";

import { isDemoAgentId } from "@/lib/ui-mocks/entities";

export type AgentFleetScope = "licensor" | "licensee";

export type AgentFleetClassification = {
  scope: AgentFleetScope | null;
  tenantId: string | null;
};

const SCOPE_VALUES = new Set<AgentFleetScope>(["licensor", "licensee"]);

/** Parse `runtime_settings.linkaios_fleet` — supplements `linkaios.agents.tenant_id` when unset. */
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

export type IsAdminBotInput = Pick<AgentRecord, "id" | "runtime_settings"> & {
  tenant_id?: string | null;
};

export type IsAdminBotOptions = {
  /** Vendor/licensor tenant UUID — used when fleet metadata only carries tenant_id. */
  licensorTenantId?: string | null;
  /** Demo fixture agents count as admin bots when UI mocks are on. */
  uiMocksDemoAgent?: boolean;
};

/** Canonical tenant id for View scoping — prefers `agents.tenant_id` column when set. */
export function resolveAgentTenantId(agent: IsAdminBotInput): string | null {
  const column = agent.tenant_id?.trim();
  if (column) return column;
  return parseAgentFleetClassification(agent.runtime_settings ?? null).tenantId;
}

/**
 * True when the agent is part of the vendor (licensor) workforce — not a client tenant bot under monitor.
 * On Admin, only admin bots may show the Projects tab (vendor projects).
 */
export function isAdminBot(agent: IsAdminBotInput, options: IsAdminBotOptions = {}): boolean {
  if (options.uiMocksDemoAgent && isDemoAgentId(agent.id)) {
    return true;
  }

  const classification = parseAgentFleetClassification(agent.runtime_settings ?? null);
  const tenantId = resolveAgentTenantId(agent);

  if (classification.scope === "licensor") return true;
  if (classification.scope === "licensee") return false;

  if (tenantId && options.licensorTenantId) {
    return tenantId === options.licensorTenantId;
  }

  return false;
}

/** Tenant id for licensee View filter — null when agent is licensor-scoped. */
export function resolveAgentLicenseeTenantId(
  agent: IsAdminBotInput,
  options: IsAdminBotOptions = {},
): string | null {
  if (isAdminBot(agent, options)) return null;
  return resolveAgentTenantId(agent);
}
