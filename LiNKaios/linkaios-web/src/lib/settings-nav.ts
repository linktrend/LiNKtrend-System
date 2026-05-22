import {
  SETTINGS_HUB_TABS,
  matchSettingsHubTab,
  settingsHubTabHref,
  type SettingsHubTabId,
} from "@/lib/settings-hub-tabs";

export type SettingsNavItem = {
  href: string;
  label: string;
  match: (path: string, search?: string) => boolean;
};

/** Sidebar sections for Settings — mirrors Settings hub tabs. */
export const SETTINGS_SIDEBAR_ITEMS: SettingsNavItem[] = SETTINGS_HUB_TABS.map((tab) => ({
  href: settingsHubTabHref(tab.id),
  label: tab.label,
  match: (path, search) => matchSettingsHubTab(tab.id, path, search),
}));

export function settingsSectionActive(pathname: string): boolean {
  return pathname === "/settings" || pathname.startsWith("/settings/");
}

export type { SettingsHubTabId };
