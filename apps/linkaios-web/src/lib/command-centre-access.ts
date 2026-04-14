import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type CommandCentreRole = "admin" | "operator" | "viewer";

function parseBootstrapAdminEmails(): Set<string> {
  const raw = process.env.COMMAND_CENTRE_BOOTSTRAP_ADMIN_EMAILS ?? "";
  const parts = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return new Set(parts);
}

export function isBootstrapAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  return parseBootstrapAdminEmails().has(email.trim().toLowerCase());
}

/**
 * Effective role from a known DB row (or null) plus email (bootstrap admins may have no row).
 */
export function getEffectiveCommandCentreRole(params: {
  dbRole: CommandCentreRole | null;
  email: string | undefined;
}): CommandCentreRole {
  const { dbRole, email } = params;
  if (dbRole === "admin" || dbRole === "operator" || dbRole === "viewer") return dbRole;
  if (isBootstrapAdminEmail(email)) return "admin";
  return "operator";
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

  const rowRole = (data?.role as CommandCentreRole | undefined) ?? null;
  if (rowRole === "admin" || rowRole === "operator" || rowRole === "viewer") {
    return rowRole;
  }
  return getEffectiveCommandCentreRole({ dbRole: null, email: params.email });
}

export function canWriteCommandCentre(role: CommandCentreRole): boolean {
  return role === "admin" || role === "operator";
}

export async function isCommandCentreAdmin(
  supabase: SupabaseClient,
  params: { userId: string; email: string | undefined },
): Promise<boolean> {
  return (await getCommandCentreRoleForUser(supabase, params)) === "admin";
}

export function commandCentreRoleLabel(role: CommandCentreRole): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "viewer":
      return "Viewer · read-only";
    default:
      return "Operator";
  }
}
