import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { parseAppRoleTier, type AppRoleTier } from "./app-roles";
import type { CommandCentreRole } from "./command-centre-shared";
import { getEffectiveCommandCentreRole, isBootstrapAdminEmail } from "./command-centre-shared";

export type { CommandCentreRole };
export {
  canWriteCommandCentre,
  commandCentreRoleLabel,
  getEffectiveCommandCentreRole,
  isBootstrapAdminEmail,
} from "./command-centre-shared";

/**
 * App role tier from linkaios.user_access (User / Admin / Super Admin).
 */
export async function getAppRoleTierForUser(
  supabase: SupabaseClient,
  params: { userId: string; email: string | undefined },
): Promise<AppRoleTier> {
  const { data } = await supabase
    .schema("linkaios")
    .from("user_access")
    .select("role")
    .eq("user_id", params.userId)
    .maybeSingle();

  const rowRole = data?.role as string | undefined;
  if (rowRole) return parseAppRoleTier(rowRole);
  if (isBootstrapAdminEmail(params.email)) return "super_admin";
  return "admin";
}

/**
 * Role for the signed-in user: DB row wins; else bootstrap admin emails; else implicit operator.
 */
export async function getCommandCentreRoleForUser(
  supabase: SupabaseClient,
  params: { userId: string; email: string | undefined },
): Promise<CommandCentreRole> {
  const { data } = await supabase
    .schema("linkaios")
    .from("user_access")
    .select("role")
    .eq("user_id", params.userId)
    .maybeSingle();

  const rowRole = data?.role as string | undefined;
  if (rowRole === "super_admin" || rowRole === "admin") return "admin";
  if (rowRole === "operator" || rowRole === "viewer") return rowRole;
  return getEffectiveCommandCentreRole({ dbRole: null, email: params.email });
}

export async function isCommandCentreAdmin(
  supabase: SupabaseClient,
  params: { userId: string; email: string | undefined },
): Promise<boolean> {
  const { data } = await supabase
    .schema("linkaios")
    .from("user_access")
    .select("role")
    .eq("user_id", params.userId)
    .maybeSingle();
  const rowRole = data?.role as string | undefined;
  if (rowRole === "super_admin" || rowRole === "admin") return true;
  return getEffectiveCommandCentreRole({ dbRole: null, email: params.email }) === "admin";
}
