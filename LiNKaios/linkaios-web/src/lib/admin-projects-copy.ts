/**
 * Admin Projects — vendor ops copy for LiNKaios Admin Projects section.
 * Admin Projects are studio vendor work (admin LiNKbots + Plane), not licensee tenant projects.
 */

export const ADMIN_PROJECTS_PAGE = {
  title: "Projects",
  subtitle:
    "Vendor and studio work assigned to admin LiNKbots — tracked on Plane when applicable. Licensee tenant projects live on LiNKaios Client only.",
  emptyTitle: "No vendor projects yet",
  emptyBody:
    "Vendor projects are studio execution tracks — LiNKsuitegen catalogue work, librarian filings, and platform ops led by admin LiNKbots. They are separate from licensee project management on Client.",
  planeHint:
    "When projects are provisioned on Plane, open the workspace from the actions column after confirming context.",
  wizardPageTitle: "Launch Project",
  wizardPageSubtitle:
    "Create vendor-scoped studio work for admin LiNKbots — LiNKsuitegen, librarian filings, or platform ops.",
  wizardTitle: "Launch vendor project",
  wizardTypeHint: "Choose the studio track this project belongs to. Type sets suite and module bindings for orchestration.",
  wizardLaunchHint:
    "Launch creates the project on the licensor tenant, records a governance trace, and provisions Plane when studio credentials are configured.",
  detailSubtitle:
    "Vendor project detail — Plane runs board execution; LiNKaios runs orchestration, approvals, outputs, and traces.",
  draftStatusHint:
    "Draft means the project record exists but orchestration has not started yet. Status advances when the first Run is assigned or execution begins.",
  launchButton: "Launch project",
} as const;

export const ADMIN_PROJECTS_NAV = {
  section: "Projects",
  all: "All Projects",
} as const;

/** @deprecated Use {@link ADMIN_PROJECTS_PAGE}. */
export const ADMIN_PROGRAMS_PAGE = ADMIN_PROJECTS_PAGE;

/** @deprecated Use {@link ADMIN_PROJECTS_NAV}. */
export const ADMIN_PROGRAMS_NAV = ADMIN_PROJECTS_NAV;
