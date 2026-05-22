/** Copy and tab config for `/settings/access` (client org roles & permissions). */

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
  adminNote:
    "Workspace Admins manage human operator roles for this client organization. LiNKbot service accounts and Linktrend vendor operators are governed separately.",
  nonAdminNote:
    "Only workspace Admins can change team roles. You can review what each role allows on the Role permissions tab.",
  addTeamMember: "Add Team Member",
  inviteTeamMemberTitle: "Invite team member",
  inviteTeamMemberBody:
    "Send an invitation email to add a human user to this workspace. Invitations are recorded for audit; delivery is stubbed in this MVO build.",
} as const;

export type RolePermissionRow = {
  id: string;
  label: string;
  description: string;
  admin: boolean;
  operator: boolean;
  viewer: boolean;
};

export const ROLE_PERMISSION_MATRIX: RolePermissionRow[] = [
  {
    id: "view-workspace",
    label: "View workspace data",
    description: "Dashboards, projects, LiNKbots, metrics, and read-only settings.",
    admin: true,
    operator: true,
    viewer: true,
  },
  {
    id: "run-operations",
    label: "Run day-to-day operations",
    description: "Start projects, approve drafts, and use operator controls.",
    admin: true,
    operator: true,
    viewer: false,
  },
  {
    id: "manage-integrations",
    label: "Manage integrations & data",
    description: "API keys, imports/exports, and tenant integration settings.",
    admin: true,
    operator: true,
    viewer: false,
  },
  {
    id: "manage-billing",
    label: "Manage billing & subscriptions",
    description: "Payment methods, LiNKaios plan, and suite subscriptions.",
    admin: true,
    operator: false,
    viewer: false,
  },
  {
    id: "manage-team",
    label: "Manage team roles",
    description: "Assign Admin, Operator, or Viewer to client users.",
    admin: true,
    operator: false,
    viewer: false,
  },
  {
    id: "platform-controls",
    label: "Platform operator controls",
    description: "Routing, traces, governance previews, and cross-tenant tooling.",
    admin: true,
    operator: false,
    viewer: false,
  },
];

export const CLIENT_ROLES = [
  {
    id: "admin",
    label: "Admin",
    summary: "Full workspace control — settings, billing, team roles, and protected approvals.",
  },
  {
    id: "operator",
    label: "Operator",
    summary: "Day-to-day execution — run projects and use operator tools without billing or role management.",
  },
  {
    id: "viewer",
    label: "Viewer",
    summary: "Read-only access to workspace data for stakeholders who should not change anything.",
  },
] as const;
