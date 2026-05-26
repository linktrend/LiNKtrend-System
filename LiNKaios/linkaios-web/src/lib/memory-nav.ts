import type { LinkbrainTab } from "@/lib/linkbrain-data";
import { stripAppBasePath } from "@/lib/app-surface";
import { memoryHref } from "@/lib/memory-href";

export type MemoryNavItem = {
  id: LinkbrainTab;
  label: string;
  href: string;
  match: (path: string, search?: string) => boolean;
};

const ORDERED_TABS: readonly LinkbrainTab[] = ["inbox", "project", "agent", "company", "ask", "audit"];

const LINKBRAIN_TABS: { id: LinkbrainTab; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "project", label: "Project Memory" },
  { id: "agent", label: "LiNKbot Memory" },
  { id: "company", label: "Company Memory" },
  { id: "ask", label: "Ask LiNKbrain" },
  { id: "audit", label: "Audit" },
];

export const LINKBRAIN_NAV_TABS = LINKBRAIN_TABS;

export function parseLinkbrainTab(raw: string | null | undefined): LinkbrainTab {
  const v = raw ?? undefined;
  if (v === "missions") return "project";
  if (v === "sandbox") return "ask";
  if (v === "virtual") return "project";
  if (v === "overview" || v === "library") return "inbox";
  if (v === "orgScope") return "inbox";
  if (v && (ORDERED_TABS as readonly string[]).includes(v)) return v as LinkbrainTab;
  return "inbox";
}

export function linkbrainTabFromSearch(search?: string): LinkbrainTab {
  return parseLinkbrainTab(new URLSearchParams(search ?? "").get("tab"));
}

export function linkbrainTabHref(tab: LinkbrainTab): string {
  if (tab === "inbox") return "/memory";
  return memoryHref(tab, {});
}

function isMemoryHubPath(path: string): boolean {
  return path === "/memory" || path === "/memory/";
}

function memorySubRouteTab(path: string): LinkbrainTab | null {
  if (path.startsWith("/memory/drafts")) return "inbox";
  if (path.startsWith("/memory/files")) return "project";
  if (path.startsWith("/memory/company-structure")) return "inbox";
  if (path.startsWith("/memory/company")) return "company";
  if (path.startsWith("/memory/metrics")) return "audit";
  return null;
}

export function memorySubRouteTabForPath(path: string): LinkbrainTab | null {
  return memorySubRouteTab(path);
}

function normalizeMemoryPath(path: string): string {
  return stripAppBasePath(path);
}

export function matchLinkbrainTab(id: LinkbrainTab, path: string, search?: string): boolean {
  const route = normalizeMemoryPath(path);
  if (route.startsWith("/memory/") && !isMemoryHubPath(route)) {
    const subTab = memorySubRouteTab(route);
    return subTab != null && subTab === id;
  }
  if (!isMemoryHubPath(route)) return false;
  return linkbrainTabFromSearch(search) === id;
}

/** Sidebar sections for LiNKbrain — mirrors hub tab strip on `/memory`. */
export const MEMORY_SIDEBAR_ITEMS: MemoryNavItem[] = LINKBRAIN_NAV_TABS.map((tab) => ({
  id: tab.id,
  label: tab.label,
  href: linkbrainTabHref(tab.id),
  match: (path, search) => matchLinkbrainTab(tab.id, path, search),
}));

export function memorySectionActive(pathname: string): boolean {
  const route = normalizeMemoryPath(pathname);
  return route === "/memory" || route.startsWith("/memory/");
}
