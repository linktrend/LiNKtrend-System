/** Copy and tab config for `/admin/settings/access` (LiNKtrend operator roles). */

import {
  LICENSOR_PERMISSION_MATRIX,
  LICENSOR_ROLE_SUMMARIES,
  type LicenseePermissionRow,
} from "@/lib/app-roles";

export const LICENSOR_PERMISSIONS_TABS = [
  { id: "team", label: "Team Members" },
  { id: "roles", label: "Role Permissions" },
] as const;

export type LicensorPermissionsTabId = (typeof LICENSOR_PERMISSIONS_TABS)[number]["id"];

export const LICENSOR_PERMISSIONS_DEFAULT_TAB: LicensorPermissionsTabId = "team";

const LICENSOR_PERMISSIONS_TAB_IDS = new Set<string>(LICENSOR_PERMISSIONS_TABS.map((t) => t.id));

export function parseLicensorPermissionsTab(raw: string | null | undefined): LicensorPermissionsTabId {
  if (raw && LICENSOR_PERMISSIONS_TAB_IDS.has(raw)) return raw as LicensorPermissionsTabId;
  return LICENSOR_PERMISSIONS_DEFAULT_TAB;
}

/** Licensee-relative path — prefix with {@link withAppBasePath} for admin surface links. */
export function licensorPermissionsTabHref(tab: LicensorPermissionsTabId): string {
  if (tab === LICENSOR_PERMISSIONS_DEFAULT_TAB) return "/settings/access";
  return `/settings/access?tab=${tab}`;
}

export const LICENSOR_PERMISSIONS_PAGE_COPY = {
  adminNote: "",
  nonAdminNote: "Super Admin only.",
  addTeamMember: "Add Team Member",
  inviteTeamMemberTitle: "Invite operator",
  inviteTeamMemberBody:
    "Send an invitation email to add a LiNKtrend staff member to the Admin app. Invitations are recorded for audit; delivery is stubbed in this MVO build.",
} as const;

export type LicensorRolePermissionRow = LicenseePermissionRow;

export const LICENSOR_ROLE_PERMISSION_MATRIX: LicensorRolePermissionRow[] = LICENSOR_PERMISSION_MATRIX;

export const LICENSOR_OPERATOR_ROLES = LICENSOR_ROLE_SUMMARIES;
