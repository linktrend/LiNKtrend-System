import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { CommandCentreRole } from "./command-centre-shared";
import { getEffectiveCommandCentreRole } from "./command-centre-shared";

export type { CommandCentreRole };
export {
  canWriteCommandCentre,
  commandCentreRoleLabel,
  getEffectiveCommandCentreRole,
  isBootstrapAdminEmail,
} from "./command-centre-shared";

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

  const rowRole = (data?.role as CommandCentreRole | undefined) ?? null;
  if (rowRole === "admin" || rowRole === "operator" || rowRole === "viewer") {
    return rowRole;
  }
  return getEffectiveCommandCentreRole({ dbRole: null, email: params.email });
}

export async function isCommandCentreAdmin(
  supabase: SupabaseClient,
  params: { userId: string; email: string | undefined },
): Promise<boolean> {
  return (await getCommandCentreRoleForUser(supabase, params)) === "admin";
}
