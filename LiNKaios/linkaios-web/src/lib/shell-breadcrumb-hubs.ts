import {
  BILLING_DEFAULT_TAB,
  BILLING_TABS,
  billingTabHref,
  parseBillingTab,
} from "@/lib/billing-page-copy";
import {
  COMPANY_DEFAULT_TAB,
  COMPANY_HUB_PATH,
  COMPANY_TABS,
  companyTabHref,
  companyTabFromSearch,
  isCompanyHubPath,
  isLicenseesHubPath,
  LICENSEES_ADMIN_HUB_PATH,
} from "@/lib/company-page-copy";
import { linkbrainPageTitle } from "@/lib/linkbrain-page-copy";
import type { AppActorKind } from "@/lib/app-roles";
import { linkbrainTabHref, memorySubRouteTabForPath, parseLinkbrainTab } from "@/lib/memory-nav";
import { linkskillsHubTabMeta, linkskillsHubTabNeedsBreadcrumb } from "@/lib/linkskills-hub-tabs";
import { metricsViewFromSearch, metricsViewHref } from "@/lib/metrics-nav";
import type { KpiViewId } from "@/lib/metrics-kpi-views";
import {
  PERMISSIONS_DEFAULT_TAB,
  PERMISSIONS_TABS,
  parsePermissionsTab,
  permissionsTabHref,
} from "@/lib/permissions-page-copy";
import {
  PROJECT_DEFAULT_TAB,
  projectTabHref,
  projectTabLabel,
  parseProjectTab,
} from "@/lib/project-tabs";
import {
  parseSettingsHubTab,
  resolveSettingsHubTabForPath,
  settingsHubTabHref,
  settingsHubTabLabel,
} from "@/lib/settings-hub-tabs";
import {
  SESSION_ACTIVITY_DEFAULT_TAB,
  SESSION_ACTIVITY_TABS,
  parseSessionActivityTab,
  sessionActivityTabHref,
} from "@/lib/session-activity-copy";
import { resolveWorkerDetailTab, WORKER_DETAIL_TABS } from "@/lib/worker-detail-tabs";
import { formatUiLabel } from "@/lib/ui-standards";

export type BreadcrumbItem = { href?: string; label: string };

const METRICS_VIEW_LABELS: Record<KpiViewId, string> = {
  cost: "Cost",
  performance: "Performance",
  reliability: "Reliability",
};

const WORK_SECTIONS: { prefix: string; label: string; href: string }[] = [
  { prefix: "/work/alerts", label: "Alerts", href: "/work/alerts" },
  { prefix: "/work/messages", label: "Messages", href: "/work/messages" },
  { prefix: "/work/sessions", label: "Sessions", href: "/work/sessions" },
];

function insertBeforeLeaf(items: BreadcrumbItem[], crumb: BreadcrumbItem) {
  if (items.length === 0) return;
  items.splice(items.length - 1, 0, crumb);
}

function appendInnerTab(items: BreadcrumbItem[], parentHref: string, tabLabel: string) {
  if (items.length === 0) return;
  const parent = items[items.length - 1]!;
  items[items.length - 1] = { href: parentHref, label: parent.label };
  items.push({ label: formatUiLabel(tabLabel) });
}

function itemHasLabel(items: BreadcrumbItem[], label: string): boolean {
  return items.some((item) => item.label === label);
}

export function enrichSettingsBreadcrumbs(pathname: string, searchParams: URLSearchParams, items: BreadcrumbItem[]) {
  if (items.length === 0) return;

  if (pathname === "/settings" || pathname === "/settings/") {
    const tab = parseSettingsHubTab(searchParams.get("tab"));
    if (tab !== "account") {
      appendInnerTab(items, settingsHubTabHref("account"), settingsHubTabLabel(tab));
    }
    return;
  }

  if (!pathname.startsWith("/settings/")) return;

  const tabId = resolveSettingsHubTabForPath(pathname);
  if (tabId) {
    const hubLabel = formatUiLabel(settingsHubTabLabel(tabId));
    if (!itemHasLabel(items, hubLabel)) {
      insertBeforeLeaf(items, { href: settingsHubTabHref(tabId), label: hubLabel });
    }
  }

  if (pathname === "/settings/access") {
    const tab = parsePermissionsTab(searchParams.get("tab"));
    const tabLabel = PERMISSIONS_TABS.find((entry) => entry.id === tab)?.label;
    if (tabLabel) appendInnerTab(items, permissionsTabHref(PERMISSIONS_DEFAULT_TAB), tabLabel);
    return;
  }

  if (pathname === "/settings/sessions") {
    const tab = parseSessionActivityTab(searchParams.get("tab"));
    const tabLabel = SESSION_ACTIVITY_TABS.find((entry) => entry.id === tab)?.label;
    if (tabLabel) appendInnerTab(items, sessionActivityTabHref(SESSION_ACTIVITY_DEFAULT_TAB), tabLabel);
    return;
  }

  if (pathname === "/settings/billing" || pathname.startsWith("/settings/billing/")) {
    const tab = parseBillingTab(searchParams.get("tab"));
    if (tab !== BILLING_DEFAULT_TAB) {
      const tabLabel = BILLING_TABS.find((entry) => entry.id === tab)?.label;
      if (tabLabel) appendInnerTab(items, billingTabHref(BILLING_DEFAULT_TAB), tabLabel);
    }
  }
}

export function enrichSkillsBreadcrumbs(pathname: string, items: BreadcrumbItem[]) {
  if (!pathname.startsWith("/skills") || items.length === 0) return;
  if (!linkskillsHubTabNeedsBreadcrumb(pathname)) return;

  const hub = linkskillsHubTabMeta(pathname);
  if (!hub || itemHasLabel(items, hub.label)) return;

  insertBeforeLeaf(items, { href: hub.href, label: formatUiLabel(hub.label) });
}

export function enrichMemoryBreadcrumbs(
  pathname: string,
  searchParams: URLSearchParams,
  items: BreadcrumbItem[],
  actorKind: AppActorKind = "licensee",
) {
  if (!pathname.startsWith("/memory") || items.length === 0) return;

  if (pathname === "/memory" || pathname === "/memory/") {
    const tab = parseLinkbrainTab(searchParams.get("tab"));
    if (tab !== "inbox") {
      items.push({ label: formatUiLabel(linkbrainPageTitle(tab, actorKind)) });
    }
    return;
  }

  const hubTab = memorySubRouteTabForPath(pathname);
  if (!hubTab) return;

  const hubLabel = formatUiLabel(linkbrainPageTitle(hubTab, actorKind));
  if (itemHasLabel(items, hubLabel)) return;

  insertBeforeLeaf(items, { href: linkbrainTabHref(hubTab), label: hubLabel });
}

export function enrichCompanyBreadcrumbs(pathname: string, searchParams: URLSearchParams, items: BreadcrumbItem[]) {
  if (!isCompanyHubPath(pathname)) return;
  const tab = companyTabFromSearch(searchParams.toString());
  if (tab === COMPANY_DEFAULT_TAB) return;

  const tabLabel = COMPANY_TABS.find((entry) => entry.id === tab)?.label;
  if (!tabLabel) return;

  const hubPath = isLicenseesHubPath(pathname) ? LICENSEES_ADMIN_HUB_PATH : COMPANY_HUB_PATH;
  appendInnerTab(items, companyTabHref(COMPANY_DEFAULT_TAB, searchParams.get("companyId"), null, hubPath), tabLabel);
}

export function enrichMetricsBreadcrumbs(pathname: string, searchParams: URLSearchParams, items: BreadcrumbItem[]) {
  if (pathname !== "/metrics" && pathname !== "/metrics/") return;
  const view = metricsViewFromSearch(searchParams.toString());
  if (view === "cost") return;

  appendInnerTab(items, metricsViewHref("cost"), METRICS_VIEW_LABELS[view]);
}

export function enrichProjectBreadcrumbs(pathname: string, searchParams: URLSearchParams, items: BreadcrumbItem[]) {
  const match = pathname.match(/^\/projects\/([^/]+)$/);
  if (!match) return;

  const missionId = match[1]!;
  if (missionId === "new") return;

  const tab = parseProjectTab(searchParams.get("tab") ?? undefined);
  if (tab === PROJECT_DEFAULT_TAB) return;

  appendInnerTab(items, projectTabHref(missionId, PROJECT_DEFAULT_TAB), projectTabLabel(tab));
}

export function enrichWorkerBreadcrumbs(pathname: string, items: BreadcrumbItem[]) {
  const match = pathname.match(/^\/workers\/([^/]+)(?:\/(.+))?$/);
  if (!match) return;

  const agentId = match[1]!;
  if (agentId === "new") return;

  const tab = resolveWorkerDetailTab(pathname, agentId);
  if (!tab) return;

  const tabLabel = formatUiLabel(tab.label);
  const tabSegment = WORKER_DETAIL_TABS.find((entry) => entry.id === tab.id)?.id;
  const parts = pathname.split("/").filter(Boolean);
  const tabIndex = tabSegment ? parts.indexOf(tabSegment) : -1;

  if (tabIndex < 0) return;

  const hasNested = parts.length > tabIndex + 1;
  const tabItemIndex = items.length - (hasNested ? parts.length - tabIndex - 1 : 1);

  if (tabItemIndex < 0 || tabItemIndex >= items.length) return;

  if (itemHasLabel(items, tabLabel) && items[tabItemIndex]?.href === tab.href(agentId)) return;

  items[tabItemIndex] = { href: tab.href(agentId), label: tabLabel };
}

export function enrichWorkBreadcrumbs(pathname: string, items: BreadcrumbItem[]) {
  if (pathname === "/work" || pathname === "/work/") return;

  const section = WORK_SECTIONS.find((entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`));
  if (!section || itemHasLabel(items, section.label)) return;

  insertBeforeLeaf(items, { href: section.href, label: formatUiLabel(section.label) });
}

export function enrichShellBreadcrumbs(
  pathname: string,
  searchParams: URLSearchParams,
  items: BreadcrumbItem[],
  actorKind: AppActorKind = "licensee",
) {
  enrichSettingsBreadcrumbs(pathname, searchParams, items);
  enrichSkillsBreadcrumbs(pathname, items);
  enrichMemoryBreadcrumbs(pathname, searchParams, items, actorKind);
  enrichCompanyBreadcrumbs(pathname, searchParams, items);
  enrichMetricsBreadcrumbs(pathname, searchParams, items);
  enrichProjectBreadcrumbs(pathname, searchParams, items);
  enrichWorkerBreadcrumbs(pathname, items);
  enrichWorkBreadcrumbs(pathname, items);
}
