import { parseAppRoleTier, type AppRoleTier } from "@/lib/app-roles";

export type UserAccessDbRole = "admin" | "operator" | "viewer";

const APP_ROLE_TIERS = new Set<AppRoleTier>(["user", "admin", "super_admin"]);

/** Map UI role tier to linkaios.user_access row (DB CHECK constraint). */
export function appRoleTierToUserAccessRole(tier: AppRoleTier): UserAccessDbRole {
  if (tier === "user") return "viewer";
  if (tier === "admin") return "operator";
  return "admin";
}

/** Resolve display tier from DB row + auth user_metadata. */
export function resolveAppRoleTierFromAccess(params: {
  dbRole: UserAccessDbRole | null;
  metadata?: Record<string, unknown> | null;
  email?: string | null;
}): AppRoleTier {
  const metaTier = params.metadata?.app_role_tier;
  if (typeof metaTier === "string" && APP_ROLE_TIERS.has(metaTier as AppRoleTier)) {
    return metaTier as AppRoleTier;
  }
  if (params.dbRole === "viewer") return "user";
  if (params.dbRole === "operator") return "admin";
  if (params.dbRole === "admin") return "admin";
  return parseAppRoleTier(null);
}

export function parseInviteEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function parseInviteFullName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name || name.length < 2) return null;
  return name;
}

export function parseInviteAppRoleTier(raw: string): AppRoleTier | null {
  if (raw === "user" || raw === "admin" || raw === "super_admin") return raw;
  return null;
}
