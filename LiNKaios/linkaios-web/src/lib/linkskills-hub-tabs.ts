export type LinkskillsHubTabId = "overview" | "skills" | "tools" | "connectors" | "leases";

export const LINKSKILLS_HUB_TABS: { id: LinkskillsHubTabId; href: string; label: string }[] = [
  { id: "overview", href: "/skills", label: "Overview" },
  { id: "skills", href: "/skills/skills", label: "Skills" },
  { id: "tools", href: "/skills/tools", label: "Tools" },
  { id: "connectors", href: "/skills/connectors", label: "Capabilities" },
  { id: "leases", href: "/skills/leases", label: "Leases" },
];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function resolveLinkskillsHubTab(pathname: string): LinkskillsHubTabId {
  if (pathname.startsWith("/skills/leases")) return "leases";
  if (pathname.startsWith("/skills/skills") || /^\/skills\/[0-9a-f-]{36}(\/|$)/i.test(pathname)) return "skills";
  if (pathname.startsWith("/skills/tools")) return "tools";
  if (pathname.startsWith("/skills/connectors")) return "connectors";
  if (pathname === "/skills" || pathname === "/skills/") return "overview";
  return "overview";
}

export function linkskillsHubTabMeta(pathname: string): { id: LinkskillsHubTabId; label: string; href: string } | null {
  const id = resolveLinkskillsHubTab(pathname);
  if (id === "overview") return null;
  const tab = LINKSKILLS_HUB_TABS.find((entry) => entry.id === id);
  return tab ?? null;
}

/** True when the hub tab crumb is not already represented by a path segment label. */
export function linkskillsHubTabNeedsBreadcrumb(pathname: string): boolean {
  const hub = linkskillsHubTabMeta(pathname);
  if (!hub) return false;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length >= 2 && UUID_RE.test(parts[1]!)) return true;
  if (hub.id === "skills" && parts[1] === "skills") return false;
  if (hub.id === "tools" && parts[1] === "tools") return false;
  if (hub.id === "connectors" && parts[1] === "connectors") return false;
  if (hub.id === "leases" && parts[1] === "leases") return false;
  return true;
}
