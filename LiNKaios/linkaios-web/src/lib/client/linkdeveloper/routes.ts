/** LiNKdeveloper Client surface routes (Wave 8.11 — Linktrend tenant). */

export const LINKDEVELOPER_CLIENT_BASE = "/linkdeveloper";

export const LINKDEVELOPER_PROJECT_TABS = [
  "overview",
  "plan",
  "build",
  "validation",
  "launch",
  "activity",
] as const;

export type LinkdeveloperProjectTab = (typeof LINKDEVELOPER_PROJECT_TABS)[number];

export const LINKDEVELOPER_CLIENT_ROUTES = {
  dashboard: LINKDEVELOPER_CLIENT_BASE,
  projects: `${LINKDEVELOPER_CLIENT_BASE}/projects`,
  project: (id: string, tab: LinkdeveloperProjectTab = "overview") =>
    `${LINKDEVELOPER_CLIENT_BASE}/projects/${id}/${tab}`,
} as const;

export function linkdeveloperProjectTabActive(
  tab: LinkdeveloperProjectTab,
  pathname: string,
): boolean {
  return pathname.endsWith(`/${tab}`) || (tab === "overview" && /\/projects\/[^/]+$/.test(pathname));
}

export function formatProjectTabLabel(tab: LinkdeveloperProjectTab): string {
  return tab.charAt(0).toUpperCase() + tab.slice(1);
}
