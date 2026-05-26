/** Copy and tab config for `/settings/access` (client org roles & permissions). */

import {
  LICENSEE_PERMISSION_MATRIX,
  LICENSEE_ROLE_SUMMARIES,
  type LicenseePermissionRow,
} from "@/lib/app-roles";

export const PERMISSIONS_TABS = [
  { id: "team", label: "Team Members" },
  { id: "roles", label: "Role Permissions" },
] as const;

export type PermissionsTabId = (typeof PERMISSIONS_TABS)[number]["id"];

export const PERMISSIONS_DEFAULT_TAB: PermissionsTabId = "team";

const PERMISSIONS_TAB_IDS = new Set<string>(PERMISSIONS_TABS.map((t) => t.id));

export function parsePermissionsTab(raw: string | null | undefined): PermissionsTabId {
  if (raw && PERMISSIONS_TAB_IDS.has(raw)) return raw as PermissionsTabId;
  return PERMISSIONS_DEFAULT_TAB;
}

export function permissionsTabHref(tab: PermissionsTabId): string {
  if (tab === PERMISSIONS_DEFAULT_TAB) return "/settings/access";
  return `/settings/access?tab=${tab}`;
}

export const PERMISSIONS_PAGE_COPY = {
  adminNote: "",
  nonAdminNote: "Super Admin only.",
  addTeamMember: "Add Team Member",
  inviteTeamMemberTitle: "Invite team member",
  inviteTeamMemberBody:
    "Send an invitation email to add a human user to this workspace. Invitations are recorded for audit; delivery is stubbed in this MVO build.",
} as const;

export type RolePermissionRow = LicenseePermissionRow;

export const ROLE_PERMISSION_MATRIX: RolePermissionRow[] = LICENSEE_PERMISSION_MATRIX;

export const CLIENT_ROLES = LICENSEE_ROLE_SUMMARIES;
