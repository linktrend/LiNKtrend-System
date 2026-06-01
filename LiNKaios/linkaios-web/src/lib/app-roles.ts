/**
 * Client (licensee) and licensor (admin) role model — single source of truth for UI gating.
 * Wiring to Supabase RLS follows this matrix; preview roles use RolePreviewProvider in dev.
 *
 * Agent reference (not UI copy):
 * - Licensee User: day-to-day work; limited visibility; most changes need Admin approval.
 * - Licensee Admin: operations + approvals; not team/roles/secrets/org policy.
 * - Licensee Super Admin: team, roles, secrets, billing authority, topology, destructive actions.
 * - Licensor User: customer service (support, Work inbox) for assigned licensees; read-only all-licensees view.
 * - Licensor Admin: platform operations + approvals; not operator team or platform secrets.
 * - Licensor Super Admin: operator team, secrets, governance, destructive platform actions.
 */

import type { LinkbrainTab } from "@/lib/linkbrain-data";

export type AppRoleTier = "user" | "admin" | "super_admin";

export type AppActorKind = "licensee" | "licensor";

export const APP_ROLE_TIERS: AppRoleTier[] = ["user", "admin", "super_admin"];

export const ROLE_TIER_LABELS: Record<AppRoleTier, string> = {
  user: "User",
  admin: "Admin",
  super_admin: "Super Admin",
};

export type ShellNavSection =
  | "overview"
  | "work"
  | "projects"
  | "linkbots"
  | "suites"
  | "linkskills"
  | "linkbrain"
  | "company"
  | "metrics"
  | "settings";

const LICENSEE_NAV: Record<AppRoleTier, ReadonlySet<ShellNavSection>> = {
  user: new Set(["overview", "work", "projects", "linkbots", "suites", "linkskills", "linkbrain", "settings"]),
  admin: new Set([
    "overview",
    "work",
    "projects",
    "linkbots",
    "suites",
    "linkskills",
    "linkbrain",
    "company",
    "metrics",
    "settings",
  ]),
  super_admin: new Set([
    "overview",
    "work",
    "projects",
    "linkbots",
    "suites",
    "linkskills",
    "linkbrain",
    "company",
    "metrics",
    "settings",
  ]),
};

const LICENSOR_NAV: Record<AppRoleTier, ReadonlySet<ShellNavSection>> = {
  user: new Set(["overview", "work", "linkbots", "suites", "linkskills", "linkbrain", "company", "settings"]),
  admin: new Set([
    "overview",
    "work",
    "linkbots",
    "suites",
    "linkskills",
    "linkbrain",
    "company",
    "metrics",
    "settings",
  ]),
  super_admin: new Set([
    "overview",
    "work",
    "linkbots",
    "suites",
    "linkskills",
    "linkbrain",
    "company",
    "metrics",
    "settings",
  ]),
};

export function canSeeNavSection(kind: AppActorKind, role: AppRoleTier, section: ShellNavSection): boolean {
  const map = kind === "licensor" ? LICENSOR_NAV : LICENSEE_NAV;
  return map[role].has(section);
}

export function defaultLandingPath(kind: AppActorKind, role: AppRoleTier): string {
  if (kind === "licensee") {
    return role === "super_admin" ? "/app" : "/work";
  }
  return "/admin";
}

export function canManageBilling(kind: AppActorKind, role: AppRoleTier): boolean {
  if (kind === "licensor") return false;
  return role === "admin" || role === "super_admin";
}

export function canManageTeamRoles(kind: AppActorKind, role: AppRoleTier): boolean {
  if (kind === "licensor") return false;
  return role === "super_admin";
}

/** LiNKtrend staff who can access the Admin app — not licensee workspace users. */
export function canManageLicensorOperatorTeam(kind: AppActorKind, role: AppRoleTier): boolean {
  if (kind !== "licensor") return false;
  return role === "super_admin";
}

/** Platform secrets (Vaultwarden / API access) — Super Admin only on licensor surface. */
export function canManagePlatformSecrets(kind: AppActorKind, role: AppRoleTier): boolean {
  if (kind !== "licensor") return role === "super_admin";
  return role === "super_admin";
}

export function canEditCompanyProfile(kind: AppActorKind, role: AppRoleTier): boolean {
  if (kind === "licensor") return false;
  return role === "admin" || role === "super_admin";
}

export function canAddLegalEntity(kind: AppActorKind, role: AppRoleTier): boolean {
  if (kind === "licensor") return false;
  return role === "super_admin";
}

export function canEditLinkskillsCatalogue(kind: AppActorKind, role: AppRoleTier): boolean {
  return kind === "licensor" && (role === "admin" || role === "super_admin");
}

/** Licensee users may enable/disable skills and tools for their tenant — not capabilities. */
export function canToggleTenantSkillOrTool(kind: AppActorKind, _role: AppRoleTier): boolean {
  return kind === "licensee";
}

/** Tenant-wide LiNKskills allowlists — Super Admin on licensee; licensor Super Admin for platform policy. */
export function canManageLinkskillsOrgPolicy(kind: AppActorKind, role: AppRoleTier): boolean {
  if (kind === "licensee") return role === "super_admin" || role === "admin" || role === "user";
  return role === "super_admin";
}

export function canSubscribeOrPreviewSuite(kind: AppActorKind, role: AppRoleTier): boolean {
  return canManageBilling(kind, role);
}

export function canAddExtraLinkbot(kind: AppActorKind, role: AppRoleTier): boolean {
  return role === "admin" || role === "super_admin";
}

export function canCreateProject(kind: AppActorKind, role: AppRoleTier): boolean {
  return role === "admin" || role === "super_admin";
}

export function canInteractWithLinkbotSession(kind: AppActorKind, role: AppRoleTier): boolean {
  return role === "admin" || role === "super_admin";
}

export function canConfigureLinkbot(kind: AppActorKind, role: AppRoleTier): boolean {
  return role === "admin" || role === "super_admin";
}

export function canApproveBrainInbox(kind: AppActorKind, role: AppRoleTier): boolean {
  return role === "admin" || role === "super_admin";
}

export function canApproveProjectBudget(kind: AppActorKind, role: AppRoleTier): boolean {
  return kind === "licensee" && (role === "admin" || role === "super_admin");
}

export function canApproveProtectedSideEffect(kind: AppActorKind, role: AppRoleTier): boolean {
  return role === "admin" || role === "super_admin";
}

export function canDeleteWorkspaceAccount(kind: AppActorKind, role: AppRoleTier): boolean {
  if (kind === "licensor") return false;
  if (kind === "licensee") return role === "super_admin";
  return false;
}

/** Suspend / terminate / delete LiNKbots — Super Admin on licensee; Admin+ on licensor. */
export function canManageLinkbotLifecycle(kind: AppActorKind, role: AppRoleTier): boolean {
  if (kind === "licensee") return role === "super_admin";
  if (kind === "licensor") return role === "admin" || role === "super_admin";
  return false;
}

export type LinkbrainTabId = LinkbrainTab;

const LICENSEE_USER_LINKBRAIN_TABS: ReadonlySet<LinkbrainTabId> = new Set(["inbox", "project", "ask"]);

export function visibleLinkbrainTabs(kind: AppActorKind, role: AppRoleTier): LinkbrainTabId[] {
  const all: LinkbrainTabId[] = ["inbox", "project", "agent", "company", "ask", "audit"];
  if (kind === "licensee" && role === "user") {
    return all.filter((t) => LICENSEE_USER_LINKBRAIN_TABS.has(t));
  }
  return all;
}

export function canAccessLinkbrainTab(kind: AppActorKind, role: AppRoleTier, tab: LinkbrainTabId): boolean {
  return visibleLinkbrainTabs(kind, role).includes(tab);
}

export function linkskillsAccessMode(kind: AppActorKind, role: AppRoleTier): "full" | "operational" | "readonly" {
  if (kind === "licensor" && role === "user") return "readonly";
  if (role === "user") return "readonly";
  if (role === "super_admin") return "full";
  return "operational";
}

/** Licensor sidebar scope: all tenants vs one tenant. */
export const ALL_LICENSEES_SCOPE = "__all__" as const;

export type LicensorScope = typeof ALL_LICENSEES_SCOPE | string;

export function isAllLicenseesScope(scope: LicensorScope): boolean {
  return scope === ALL_LICENSEES_SCOPE;
}

/** Licensor User: read-only when All licensees; support writes when one licensee selected. */
export function licensorScopeCanWrite(scope: LicensorScope, role: AppRoleTier): boolean {
  if (role === "super_admin") return true;
  if (role === "admin") return true;
  if (role === "user") return !isAllLicenseesScope(scope);
  return false;
}

export function licensorScopeIsReadOnly(scope: LicensorScope, role: AppRoleTier): boolean {
  return !licensorScopeCanWrite(scope, role);
}

export type LicenseePermissionRow = {
  id: string;
  label: string;
  description: string;
  user: boolean;
  admin: boolean;
  super_admin: boolean;
};

export const LICENSEE_PERMISSION_MATRIX: LicenseePermissionRow[] = [
  {
    id: "view-workspace",
    label: "View Workspace Data",
    description: "Overview, assigned projects, LiNKbots, and read-only LiNKskills catalogue.",
    user: true,
    admin: true,
    super_admin: true,
  },
  {
    id: "run-operations",
    label: "Run Day-To-Day Operations",
    description: "Work inbox, messages, and sessions. Sensitive actions need Admin approval.",
    user: true,
    admin: true,
    super_admin: true,
  },
  {
    id: "approve-work-requests",
    label: "Approve User Requests",
    description: "Sign off on leases, outbound actions, and config changes raised by Users.",
    user: false,
    admin: true,
    super_admin: true,
  },
  {
    id: "manage-projects-bots",
    label: "Manage Projects & LiNKbots",
    description: "Create projects, configure bots, assign skills, and approve leases without escalation.",
    user: false,
    admin: true,
    super_admin: true,
  },
  {
    id: "manage-company",
    label: "Edit Company & Org",
    description: "Company profile, brands, and org structure.",
    user: false,
    admin: true,
    super_admin: true,
  },
  {
    id: "add-entity",
    label: "Add Company Or Brand",
    description: "Create new legal entities and brands.",
    user: false,
    admin: false,
    super_admin: true,
  },
  {
    id: "manage-billing",
    label: "Manage Billing & Subscriptions",
    description: "Plans, payment methods, and suite marketplace purchases.",
    user: false,
    admin: true,
    super_admin: true,
  },
  {
    id: "manage-team",
    label: "Manage Team & Roles",
    description: "Invite users and assign User, Admin, or Super Admin.",
    user: false,
    admin: false,
    super_admin: true,
  },
  {
    id: "manage-secrets",
    label: "Manage Secrets & API Access",
    description: "Workspace API keys and integration credentials.",
    user: false,
    admin: false,
    super_admin: true,
  },
  {
    id: "org-linkskills-policy",
    label: "Org LiNKskills Policy",
    description: "Org-wide toggles on the Skills catalogue — which licensor skills are on for this workspace.",
    user: false,
    admin: false,
    super_admin: true,
  },
];

export const LICENSEE_ROLE_SUMMARIES: { id: AppRoleTier; label: string; summary: string }[] = [
  { id: "super_admin", label: "Super Admin", summary: "" },
  { id: "admin", label: "Admin", summary: "" },
  { id: "user", label: "User", summary: "" },
];

export const LICENSOR_ROLE_SUMMARIES: { id: AppRoleTier; label: string; summary: string }[] = [
  { id: "super_admin", label: "Super Admin", summary: "" },
  { id: "admin", label: "Admin", summary: "" },
  { id: "user", label: "User", summary: "" },
];

export const LICENSOR_PERMISSION_MATRIX: LicenseePermissionRow[] = [
  {
    id: "view-admin-app",
    label: "View Admin App",
    description: "Licensees registry, collective LiNKbrain, and platform overview.",
    user: true,
    admin: true,
    super_admin: true,
  },
  {
    id: "customer-service-work",
    label: "Customer Service Work",
    description: "Support queue, Work inbox, messages, and sessions for assigned licensees.",
    user: true,
    admin: true,
    super_admin: true,
  },
  {
    id: "approve-operator-requests",
    label: "Approve User Requests",
    description: "Sign off on config, catalogue, and tenant changes raised by platform Users.",
    user: false,
    admin: true,
    super_admin: true,
  },
  {
    id: "global-platform-config",
    label: "Global Platform Config",
    description: "LiNKskills catalogue, connectors, traces, and service-wide operator settings.",
    user: false,
    admin: true,
    super_admin: true,
  },
  {
    id: "manage-licensee-registry",
    label: "Manage Licensee Registry",
    description: "Onboard licensees, billing snapshots, and tenant topology.",
    user: false,
    admin: true,
    super_admin: true,
  },
  {
    id: "manage-operator-team",
    label: "Manage Operator Team",
    description: "Invite LiNKtrend staff and assign User, Admin, or Super Admin.",
    user: false,
    admin: false,
    super_admin: true,
  },
  {
    id: "platform-secrets",
    label: "Platform Secrets & API Access",
    description: "Vaultwarden, platform API keys, and integration credentials.",
    user: false,
    admin: false,
    super_admin: true,
  },
  {
    id: "platform-owner-controls",
    label: "Platform Owner Controls",
    description: "LiNKguard, data cleanup, governance kill switches, and other destructive platform actions.",
    user: false,
    admin: false,
    super_admin: true,
  },
];

export function parseAppRoleTier(raw: string | null | undefined): AppRoleTier {
  if (raw === "admin" || raw === "super_admin" || raw === "user") return raw;
  if (raw === "operator") return "admin";
  if (raw === "viewer") return "user";
  return "admin";
}
