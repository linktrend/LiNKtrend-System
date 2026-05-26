/**
 * Active licensee context — legal entity + brand carried on URL query params until
 * server session context is wired. Propagate with `appendLicenseeContext`.
 */

import { defaultBrandForCompany } from "@/lib/brand-fixtures";
import { COMPANY_DEFAULT_FIXTURE_ID, resolveCompanyFixture } from "@/lib/company-fixtures";
import {
  DEFAULT_TENANT_TOPOLOGY,
  resolveTopologyCompanyId,
  type TenantTopologyMode,
} from "@/lib/tenant-topology";

export const LICENSEE_QUERY_KEYS = {
  companyId: "companyId",
  brandId: "brandId",
} as const;

export type LicenseeContext = {
  companyId: string;
  /** Present only when `brandId` is explicit in the URL (Brand tab drill-in). */
  brandId: string | null;
};

export function parseLicenseeContext(
  searchParams: Pick<URLSearchParams, "get">,
  topology: TenantTopologyMode = DEFAULT_TENANT_TOPOLOGY,
): LicenseeContext {
  const fallback = resolveCompanyFixture(null).id ?? COMPANY_DEFAULT_FIXTURE_ID;
  const rawCompany = searchParams.get(LICENSEE_QUERY_KEYS.companyId);
  const companyId = resolveTopologyCompanyId(topology, rawCompany, fallback);
  const rawBrand = searchParams.get(LICENSEE_QUERY_KEYS.brandId);
  const brandId = rawBrand?.trim() ? rawBrand.trim() : null;
  return { companyId, brandId };
}

/** Brand used for suite entitlements and LiNKbrain partition when URL omits brandId. */
export function effectiveBrandId(ctx: LicenseeContext): string | null {
  if (ctx.brandId) return ctx.brandId;
  return defaultBrandForCompany(ctx.companyId)?.id ?? null;
}

export function licenseeContextParams(ctx: Partial<LicenseeContext>): URLSearchParams {
  const p = new URLSearchParams();
  if (ctx.companyId?.trim()) p.set(LICENSEE_QUERY_KEYS.companyId, ctx.companyId.trim());
  if (ctx.brandId?.trim()) p.set(LICENSEE_QUERY_KEYS.brandId, ctx.brandId.trim());
  return p;
}

/** Append or replace companyId / brandId on an internal path or absolute app path. */
export function appendLicenseeContext(
  href: string,
  ctx: Partial<LicenseeContext>,
  options?: { replace?: boolean },
): string {
  const [pathPart, queryPart] = href.split("?");
  const params = new URLSearchParams(options?.replace ? undefined : queryPart ?? "");
  if (ctx.companyId !== undefined) {
    if (ctx.companyId) params.set(LICENSEE_QUERY_KEYS.companyId, ctx.companyId);
    else params.delete(LICENSEE_QUERY_KEYS.companyId);
  }
  if (ctx.brandId !== undefined) {
    if (ctx.brandId) params.set(LICENSEE_QUERY_KEYS.brandId, ctx.brandId);
    else params.delete(LICENSEE_QUERY_KEYS.brandId);
  }
  const q = params.toString();
  return q ? `${pathPart}?${q}` : (pathPart ?? href);
}

export function mergeLicenseeContextIntoSearch(
  current: Pick<URLSearchParams, "get" | "toString">,
  ctx: LicenseeContext,
): URLSearchParams {
  const p = new URLSearchParams(current.toString());
  p.set(LICENSEE_QUERY_KEYS.companyId, ctx.companyId);
  if (ctx.brandId) p.set(LICENSEE_QUERY_KEYS.brandId, ctx.brandId);
  else p.delete(LICENSEE_QUERY_KEYS.brandId);
  return p;
}
