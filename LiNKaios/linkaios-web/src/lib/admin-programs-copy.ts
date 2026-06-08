/**
 * Admin Programs — vendor ops copy for LiNKaios Admin Projects section.
 * Admin Projects are studio programs (admin LiNKbots + Plane), not licensee tenant projects.
 */

export const ADMIN_PROGRAMS_PAGE = {
  title: "Admin Programs",
  subtitle:
    "Vendor and studio work assigned to admin LiNKbots — tracked on Plane when applicable. Licensee tenant projects live on LiNKaios Client only.",
  emptyTitle: "No admin programs yet",
  emptyBody:
    "Admin programs are vendor-side execution tracks — suite catalogue work, platform ops, and studio programs led by admin LiNKbots. They are separate from licensee project management on Client.",
  planeHint:
    "When programs are provisioned, Plane remains the execution kitchen — open it from the actions column after confirming context.",
  blockedCreateTitle: "Client project creation is not available in Admin",
  blockedCreateBody:
    "Launching licensee projects belongs on LiNKaios Client. Admin will list vendor admin programs here once the data model ships.",
  blockedDetailTitle: "Client project detail is not available in Admin",
  blockedDetailBody:
    "Tenant project detail and leases belong on LiNKaios Client. Return to Admin Programs for vendor ops work.",
} as const;

export const ADMIN_PROGRAMS_NAV = {
  section: "Admin Programs",
  all: "All Programs",
} as const;
