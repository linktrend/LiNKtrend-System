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
  blockedCreateTitle: "Client project creation is not available in Admin",
  blockedCreateBody:
    "Launching licensee projects belongs on LiNKaios Client. Vendor projects appear here once provisioned for the studio tenant.",
  blockedDetailTitle: "Client project detail is not available in Admin",
  blockedDetailBody:
    "Tenant project detail and leases belong on LiNKaios Client. Return to Projects for vendor ops work.",
} as const;

export const ADMIN_PROJECTS_NAV = {
  section: "Projects",
  all: "All Projects",
} as const;

/** @deprecated Use {@link ADMIN_PROJECTS_PAGE}. */
export const ADMIN_PROGRAMS_PAGE = ADMIN_PROJECTS_PAGE;

/** @deprecated Use {@link ADMIN_PROJECTS_NAV}. */
export const ADMIN_PROGRAMS_NAV = ADMIN_PROJECTS_NAV;
