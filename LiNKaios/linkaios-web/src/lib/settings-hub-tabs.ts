import { canSeePlatformSettingsTab, type AppActorKind, type AppRoleTier } from "@/lib/app-roles";

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

export type SettingsHubTabsOptions = {
  kind?: AppActorKind;
  role?: AppRoleTier;
};

export function settingsHubTabLabel(id: SettingsHubTabId, kind?: AppActorKind): string {
  if (id === "data" && kind === "licensor") return "Data";
  return SETTINGS_HUB_TABS.find((tab) => tab.id === id)?.label ?? id;
}

function resolveSettingsHubTabsOptions(
  options?: AppRoleTier | SettingsHubTabsOptions,
): SettingsHubTabsOptions {
  if (typeof options === "string") return { role: options };
  return options ?? {};
}

function withActorTabLabels(tabs: typeof SETTINGS_HUB_TABS, kind?: AppActorKind) {
  if (kind !== "licensor") return tabs;
  return tabs.map((tab) => (tab.id === "data" ? { ...tab, label: "Data" } : tab));
}

export function visibleSettingsHubTabs(
  showPlatformTab: boolean,
  options?: AppRoleTier | SettingsHubTabsOptions,
) {
  const { kind, role } = resolveSettingsHubTabsOptions(options);
  let tabs = withActorTabLabels(SETTINGS_HUB_TABS, kind);

  const platformVisible =
    showPlatformTab && (kind ? canSeePlatformSettingsTab(kind, role ?? "user") : showPlatformTab);
  if (!platformVisible) {
    tabs = tabs.filter((tab) => tab.id !== "platform");
  }

  if (role === "user") {
    tabs = tabs.filter((tab) => tab.id === "account" || tab.id === "preferences");
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
    path.startsWith("/settings/linkguard") ||
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
