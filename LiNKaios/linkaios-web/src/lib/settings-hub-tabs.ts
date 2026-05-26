import type { AppRoleTier } from "@/lib/app-roles";

export type SettingsHubTabId = "account" | "security" | "preferences" | "data" | "platform";

export const SETTINGS_HUB_TABS: { id: SettingsHubTabId; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "security", label: "Security" },
  { id: "preferences", label: "Preferences" },
  { id: "data", label: "Data & Integrations" },
  { id: "platform", label: "Platform" },
];

const SETTINGS_HUB_TAB_IDS = new Set<string>(SETTINGS_HUB_TABS.map((t) => t.id));

export function parseSettingsHubTab(raw: string | null): SettingsHubTabId {
  if (raw && SETTINGS_HUB_TAB_IDS.has(raw)) return raw as SettingsHubTabId;
  return "account";
}

export function settingsHubTabHref(id: SettingsHubTabId): string {
  if (id === "account") return "/settings";
  return `/settings?tab=${id}`;
}

export function settingsHubTabLabel(id: SettingsHubTabId): string {
  return SETTINGS_HUB_TABS.find((tab) => tab.id === id)?.label ?? id;
}

export function visibleSettingsHubTabs(showPlatformTab: boolean, role?: AppRoleTier) {
  let tabs = showPlatformTab ? SETTINGS_HUB_TABS : SETTINGS_HUB_TABS.filter((t) => t.id !== "platform");
  if (role === "user") {
    tabs = tabs.filter((t) => t.id === "account" || t.id === "preferences");
  }
  return tabs;
}

/** Parent Settings hub tab for a settings sub-route (null on `/settings` hub only). */
export function resolveSettingsHubTabForPath(path: string): SettingsHubTabId | null {
  if (path === "/settings" || path === "/settings/") return null;
  if (!path.startsWith("/settings/")) return null;

  for (const tab of SETTINGS_HUB_TABS) {
    if (matchSettingsHubTab(tab.id, path)) return tab.id;
  }

  return null;
}

function settingsHubTabFromSearch(search?: string): SettingsHubTabId {
  return parseSettingsHubTab(new URLSearchParams(search ?? "").get("tab"));
}

function isPlatformSubRoute(path: string): boolean {
  return (
    path.startsWith("/settings/platform") ||
    path.startsWith("/settings/advanced") ||
    path.startsWith("/settings/tools") ||
    path.startsWith("/settings/traces") ||
    path.startsWith("/settings/prism") ||
    path.startsWith("/settings/gateway") ||
    path.startsWith("/settings/governance")
  );
}

export function matchSettingsHubTab(id: SettingsHubTabId, path: string, search?: string): boolean {
  if (id === "account" && (path === "/settings/user" || path === "/settings/billing" || path.startsWith("/settings/billing/") || path === "/settings/support" || path.startsWith("/settings/support/"))) {
    return true;
  }

  if (
    id === "security" &&
    (path === "/settings/access" ||
      path.startsWith("/settings/access/") ||
      path === "/settings/login-credentials" ||
      path.startsWith("/settings/login-credentials/") ||
      path === "/settings/two-factor" ||
      path.startsWith("/settings/two-factor/") ||
      path === "/settings/sessions" ||
      path.startsWith("/settings/sessions/"))
  ) {
    return true;
  }

  if (
    id === "preferences" &&
    (path === "/settings/locale" ||
      path.startsWith("/settings/locale/") ||
      path === "/settings/appearance" ||
      path.startsWith("/settings/appearance/") ||
      path === "/settings/notifications" ||
      path.startsWith("/settings/notifications/") ||
      path === "/settings/privacy" ||
      path.startsWith("/settings/privacy/"))
  ) {
    return true;
  }

  if (
    id === "data" &&
    (path === "/settings/data-export" ||
      path.startsWith("/settings/data-export/") ||
      path === "/settings/data-settings" ||
      path.startsWith("/settings/data-settings/") ||
      path === "/settings/integrations" ||
      path.startsWith("/settings/integrations/") ||
      path === "/settings/api-keys" ||
      path.startsWith("/settings/api-keys/"))
  ) {
    return true;
  }

  if (id === "platform" && isPlatformSubRoute(path)) return true;

  if (path !== "/settings" && path !== "/settings/") return false;

  return settingsHubTabFromSearch(search) === id;
}
