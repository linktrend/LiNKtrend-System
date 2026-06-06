/**
 * Tenant isolation guards for brain context and fleet operations (Wave 5.6).
 *
 * LiNKaios enforces tenant_id — not OpenClaw alone.
 */

export type TenantScopedRequest = {
  tenant_id: string;
};

export type TenantIsolationViolation = {
  code: "TENANT_SCOPE_MISMATCH" | "CROSS_TENANT_READ_DENIED";
  message: string;
};

export function assertSameTenant(
  resourceTenantId: string,
  requestTenantId: string,
  context: string,
): TenantIsolationViolation | null {
  if (resourceTenantId !== requestTenantId) {
    return {
      code: "TENANT_SCOPE_MISMATCH",
      message: `${context}: resource tenant ${resourceTenantId} ≠ request tenant ${requestTenantId}`,
    };
  }
  return null;
}

/** Brain context assembly MUST reject cross-tenant scope expansion. */
export function assertBrainContextTenantScope(args: {
  requestTenantId: string;
  scopeTenantId: string;
  operation: string;
}): TenantIsolationViolation | null {
  if (args.scopeTenantId !== args.requestTenantId) {
    return {
      code: "CROSS_TENANT_READ_DENIED",
      message: `Brain ${args.operation} denied: scope tenant ${args.scopeTenantId} ≠ authenticated tenant ${args.requestTenantId}`,
    };
  }
  return null;
}

/** Filter in-memory rows to a single tenant (used in tests and local adapters). */
export function filterRowsByTenant<T extends { tenant_id: string }>(
  rows: T[],
  tenantId: string,
): T[] {
  return rows.filter((row) => row.tenant_id === tenantId);
}

/** Returns true when a cross-tenant brain read would occur. */
export function wouldCrossTenantBrainRead(
  authenticatedTenantId: string,
  memoryObjectTenantId: string,
): boolean {
  return authenticatedTenantId !== memoryObjectTenantId;
}
