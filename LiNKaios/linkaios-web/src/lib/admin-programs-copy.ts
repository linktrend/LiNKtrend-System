/**
 * Admin Projects — vendor ops copy for LiNKaios Admin Projects section.
 * Admin Projects are studio programs (admin LiNKbots + Plane), not licensee tenant projects.
 */

export const ADMIN_PROGRAMS_PAGE = {
  title: "Projects",
  subtitle:
    "Vendor and studio work assigned to admin LiNKbots — tracked on Plane when applicable. Licensee tenant projects live on LiNKaios Client only.",
  emptyTitle: "No projects yet",
  emptyBody:
    "Projects are vendor-side execution tracks — suite catalogue work, platform ops, and studio programs led by admin LiNKbots. They are separate from licensee project management on Client.",
  planeHint:
    "When programs are provisioned, Plane remains the execution kitchen — open it from the actions column after confirming context.",
  blockedCreateTitle: "Client project creation is not available in Admin",
  blockedCreateBody:
    "Launching licensee projects belongs on LiNKaios Client. Admin will list vendor projects here once the data model ships.",
  blockedDetailTitle: "Client project detail is not available in Admin",
  blockedDetailBody:
    "Tenant project detail and leases belong on LiNKaios Client. Return to Projects for vendor ops work.",
} as const;

export const ADMIN_PROGRAMS_NAV = {
  section: "Projects",
  all: "All Projects",
} as const;
