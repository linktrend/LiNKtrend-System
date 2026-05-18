/**
 * Client-safe command-centre helpers (no server-only).
 * Async role resolution lives in `command-centre-access.ts`.
 */

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

export function canWriteCommandCentre(role: CommandCentreRole): boolean {
  return role === "admin" || role === "operator";
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
