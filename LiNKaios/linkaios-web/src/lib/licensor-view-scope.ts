/**
 * Licensor Admin sidebar View filter — shared scoping for Work, CS, LiNKbots, LiNKbrain, etc.
 */

import {
  ADMIN_SCOPE,
  ALL_LICENSEES_SCOPE,
  isAdminViewScope,
  isAllLicenseesScope,
  isCrossTenantReadOnlyScope,
  isPlatformAllScope,
  isSingleLicenseeScope,
  LICENSOR_TENANT_ID_FALLBACK,
  PLATFORM_ALL_SCOPE,
  type LicensorScope,
} from "@/lib/app-roles";
import { isAdminBot, parseAgentFleetClassification, type IsAdminBotInput } from "@/lib/agent-fleet-classification";
import { LICENSEE_REGISTRY } from "@/lib/licensee-registry";

export {
  ADMIN_SCOPE,
  ALL_LICENSEES_SCOPE,
  LICENSOR_TENANT_ID_FALLBACK,
  PLATFORM_ALL_SCOPE,
  type LicensorScope,
};

export const LICENSOR_SCOPE_PARAM = "scope";

export function isValidLicensorScope(value: string): value is LicensorScope {
  if (value === PLATFORM_ALL_SCOPE || value === ADMIN_SCOPE || value === ALL_LICENSEES_SCOPE) return true;
  return LICENSEE_REGISTRY.some((row) => row.id === value);
}

/** Normalize stored or URL scope values; default View is All (platform). */
export function normalizeLicensorScope(raw: string | null | undefined): LicensorScope {
  if (raw && isValidLicensorScope(raw)) return raw;
  return PLATFORM_ALL_SCOPE;
}

export function parseLicensorScopeParam(raw: string | string[] | undefined): LicensorScope {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "admin") return ADMIN_SCOPE;
  return normalizeLicensorScope(value ?? null);
}

export function licensorViewLabel(scope: LicensorScope, licenseeName?: string): string {
  if (isPlatformAllScope(scope)) return "All";
  if (isAdminViewScope(scope)) return "Admin";
  if (isAllLicenseesScope(scope)) return "All licensees";
  return licenseeName ?? scope;
}

export function resolveLicensorTenantIdForView(fallback?: string | null): string {
  return fallback?.trim() || LICENSOR_TENANT_ID_FALLBACK;
}

export type FleetFilterOptions = {
  licensorTenantId?: string | null;
  uiMocksDemoAgent?: boolean;
};

export function filterFleetAgentsForViewScope<T extends IsAdminBotInput>(
  agents: T[],
  scope: LicensorScope,
  options: FleetFilterOptions = {},
): T[] {
  if (isPlatformAllScope(scope)) return agents;
  if (isAdminViewScope(scope)) {
    return agents.filter((agent) => isAdminBot(agent, options));
  }
  if (isAllLicenseesScope(scope)) {
    return agents.filter((agent) => !isAdminBot(agent, options));
  }
  return agents.filter((agent) => agentMatchesLicenseeScope(agent, scope, options));
}

function agentMatchesLicenseeScope(
  agent: IsAdminBotInput,
  licenseeId: string,
  options: FleetFilterOptions,
): boolean {
  if (isAdminBot(agent, options)) return false;
  const classification = parseAgentFleetClassification(agent.runtime_settings ?? null);
  if (classification.tenantId === licenseeId) return true;
  const licensorId = resolveLicensorTenantIdForView(options.licensorTenantId);
  if (classification.tenantId && classification.tenantId !== licensorId && classification.tenantId !== licenseeId) {
    return false;
  }
  return String(agent.id).includes(licenseeId.split("-")[0] ?? licenseeId);
}

export function filterAgentIdsForViewScope(
  agents: IsAdminBotInput[],
  scope: LicensorScope,
  options: FleetFilterOptions = {},
): Set<string> {
  return new Set(filterFleetAgentsForViewScope(agents, scope, options).map((a) => String(a.id)));
}

export function filterRowsByTenantForViewScope<T extends { tenantId: string }>(
  scope: LicensorScope,
  rows: T[],
  licensorTenantId?: string | null,
): T[] {
  if (isPlatformAllScope(scope)) return rows;
  if (isAdminViewScope(scope)) {
    const licensorId = resolveLicensorTenantIdForView(licensorTenantId);
    return rows.filter((row) => row.tenantId === licensorId);
  }
  if (isAllLicenseesScope(scope)) {
    const licensorId = resolveLicensorTenantIdForView(licensorTenantId);
    return rows.filter((row) => row.tenantId !== licensorId);
  }
  return rows.filter((row) => row.tenantId === scope);
}

/** @deprecated Prefer {@link filterRowsByTenantForViewScope}. */
export function filterRowsForLicensorScope<T extends { tenantId: string }>(
  scope: LicensorScope,
  rows: T[],
): T[] {
  if (isPlatformAllScope(scope) || isAllLicenseesScope(scope)) return rows;
  if (isAdminViewScope(scope)) return rows.filter((row) => row.tenantId === LICENSOR_TENANT_ID_FALLBACK);
  return rows.filter((row) => row.tenantId === scope);
}

export function matchesLicenseeRegistryId(scope: LicensorScope, licenseeId: string): boolean {
  if (isPlatformAllScope(scope) || isAllLicenseesScope(scope)) return true;
  if (isAdminViewScope(scope)) return false;
  return scope === licenseeId;
}

export function filterSupportTicketsForViewScope<T extends { licenseeId: string }>(
  scope: LicensorScope,
  rows: T[],
): T[] {
  if (isPlatformAllScope(scope) || isAllLicenseesScope(scope)) return rows;
  if (isAdminViewScope(scope)) return [];
  return rows.filter((row) => row.licenseeId === scope);
}

const LICENSOR_TENANT_SLUGS = new Set(["linktrend", "calusa"]);

/** Normalize lease `tenant_id` (UUID or slug) to a View-scope key. */
export function normalizeLeaseTenantKey(tenantId: string, licensorTenantId?: string | null): string {
  const licensorId = resolveLicensorTenantIdForView(licensorTenantId);
  const normalized = tenantId.trim().toLowerCase();
  if (normalized === licensorId.toLowerCase() || LICENSOR_TENANT_SLUGS.has(normalized)) {
    return licensorId;
  }
  const registryMatch = LICENSEE_REGISTRY.find(
    (row) => normalized === row.id.toLowerCase() || normalized.includes(row.id.toLowerCase()),
  );
  return registryMatch?.id ?? tenantId;
}

/** Filter LinkSkills lease rows by sidebar View (Admin surface). */
export function filterLeasesForViewScope<T extends { tenant_id: string }>(
  scope: LicensorScope,
  leases: T[],
  licensorTenantId?: string | null,
): T[] {
  if (isPlatformAllScope(scope)) return leases;
  return leases.filter((lease) => {
    const tenantKey = normalizeLeaseTenantKey(lease.tenant_id, licensorTenantId);
    if (isAdminViewScope(scope)) {
      const licensorId = resolveLicensorTenantIdForView(licensorTenantId);
      return tenantKey === licensorId;
    }
    if (isAllLicenseesScope(scope)) {
      const licensorId = resolveLicensorTenantIdForView(licensorTenantId);
      return tenantKey !== licensorId;
    }
    return tenantKey === scope || lease.tenant_id === scope;
  });
}

export function matchesCollectiveDemoLicenseeScope(scope: LicensorScope, licenseeId: string): boolean {
  if (isPlatformAllScope(scope) || isAllLicenseesScope(scope)) return true;
  if (isAdminViewScope(scope)) return false;
  return scope === licenseeId;
}

export function assertTenantScopedAccess(
  activeScope: LicensorScope,
  resourceTenantId: string,
  licensorTenantId?: string | null,
): { allowed: boolean; reason?: string } {
  if (isCrossTenantReadOnlyScope(activeScope)) {
    return {
      allowed: false,
      reason: "Cross-tenant mutation blocked in this view — select Admin or one licensee first",
    };
  }
  if (isAdminViewScope(activeScope)) {
    const licensorId = resolveLicensorTenantIdForView(licensorTenantId);
    if (resourceTenantId !== licensorId) {
      return {
        allowed: false,
        reason: "Admin view only permits studio tenant mutations",
      };
    }
    return { allowed: true };
  }
  if (activeScope !== resourceTenantId) {
    return {
      allowed: false,
      reason: `Cross-tenant access denied: view ${activeScope} cannot access tenant ${resourceTenantId}`,
    };
  }
  return { allowed: true };
}

export function aggregateCrossTenantFleet<T extends { tenantId: string }>(
  scope: LicensorScope,
  rows: T[],
  licensorTenantId?: string | null,
): T[] {
  return filterRowsByTenantForViewScope(scope, rows, licensorTenantId);
}

export function assertFleetTroubleshootAllowed(
  scope: LicensorScope,
  agentTenantId: string,
  licensorTenantId?: string | null,
): { allowed: boolean; reason?: string } {
  if (isCrossTenantReadOnlyScope(scope)) {
    return {
      allowed: false,
      reason: "Select Admin or one licensee before fleet troubleshoot actions",
    };
  }
  if (isAdminViewScope(scope)) {
    const licensorId = resolveLicensorTenantIdForView(licensorTenantId);
    if (agentTenantId !== licensorId) {
      return {
        allowed: false,
        reason: "Admin view only supports studio admin LiNKbots",
      };
    }
    return { allowed: true };
  }
  if (scope !== agentTenantId) {
    return {
      allowed: false,
      reason: `Cross-tenant fleet action blocked: view ${scope} ≠ agent tenant ${agentTenantId}`,
    };
  }
  return { allowed: true };
}

export function matchesLicensorScope(scope: LicensorScope, licenseeId: string): boolean {
  return matchesCollectiveDemoLicenseeScope(scope, licenseeId);
}

export { isCrossTenantReadOnlyScope, isPlatformAllScope, isAdminViewScope, isAllLicenseesScope, isSingleLicenseeScope };
