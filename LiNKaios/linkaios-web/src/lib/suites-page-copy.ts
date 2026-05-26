import {
  MODULES_CATALOG_DEMO,
  moduleStats,
  processesForModule,
  publishedMarketplaceModules,
  type ModuleCatalogueItem,
  type ModuleProcess,
} from "@/lib/ui-mocks/modules-catalog-demo";
import { LICENSEE_HOME_PATH } from "@/lib/app-surface";
import { formatShellPageTitle } from "@/lib/ui-standards";

export type ModuleProcessTreeVariant = "catalogue" | "operational";

export function moduleProcessTreeVariant(owned: boolean): ModuleProcessTreeVariant {
  return owned ? "operational" : "catalogue";
}

export type SuiteProfileTab = "overview" | "modules" | "projects" | "sample-outputs" | "preview" | "subscribe";

/** @deprecated Use SuiteProfileTab */
export type ModuleProfileTab = SuiteProfileTab;

export const SUITE_ROUTE_SEGMENT_LABELS: Record<string, string> = {
  marketplace: "Marketplace",
  "my-suites": "My Suites",
  "my-modules": "My Suites",
  "project-types": "Modules",
  linkapps: "LiNKapps",
};

/** @deprecated */
export const MODULE_ROUTE_SEGMENT_LABELS = SUITE_ROUTE_SEGMENT_LABELS;

export const SUITE_PROFILE_TAB_LABELS: Record<Exclude<SuiteProfileTab, "overview">, string> = {
  modules: "Modules",
  projects: "Projects",
  "sample-outputs": "Sample Outputs",
  preview: "Preview",
  subscribe: "Subscribe",
};

/** @deprecated */
export const MODULE_PROFILE_TAB_LABELS = SUITE_PROFILE_TAB_LABELS;

export function suiteSampleOutputsTabLabel(owned: boolean): string {
  return owned ? "Outputs" : "Sample Outputs";
}

/** @deprecated */
export function moduleSampleOutputsTabLabel(owned: boolean): string {
  return suiteSampleOutputsTabLabel(owned);
}

const SUITE_PROFILE_OVERVIEW_TAB_LABEL = "Overview";

const SUITE_NESTED_SEGMENT_LABELS: Record<string, string> = {
  ventures: "Ventures",
  logs: "Logs",
  squad: "Squad",
};

function formatSlugSegment(slug: string): string {
  if (SUITE_NESTED_SEGMENT_LABELS[slug]) return SUITE_NESTED_SEGMENT_LABELS[slug]!;
  return formatShellPageTitle(slug.replace(/-/g, " "));
}

export function resolveSuiteSegmentLabel(suiteId: string, registryLabels: Record<string, string> = {}): string {
  if (registryLabels[suiteId]?.trim()) return registryLabels[suiteId]!.trim();
  const suite = getSuiteById(suiteId);
  if (suite?.name) return suite.name;
  if (SUITE_ROUTE_SEGMENT_LABELS[suiteId]) return SUITE_ROUTE_SEGMENT_LABELS[suiteId]!;
  return formatSlugSegment(suiteId);
}

/** @deprecated */
export function resolveModuleSegmentLabel(moduleId: string, registryLabels: Record<string, string> = {}): string {
  return resolveSuiteSegmentLabel(moduleId, registryLabels);
}

export function resolveModuleTemplateSegmentLabel(moduleTemplateId: string, registryLabels: Record<string, string> = {}): string {
  if (registryLabels[moduleTemplateId]?.trim()) return registryLabels[moduleTemplateId]!.trim();
  const proc = MODULES_CATALOG_DEMO.processes.find((p) => p.id === moduleTemplateId);
  if (proc?.name) return proc.name;
  return formatSlugSegment(moduleTemplateId);
}

/** @deprecated */
export function resolveProcessSegmentLabel(processId: string, registryLabels: Record<string, string> = {}): string {
  return resolveModuleTemplateSegmentLabel(processId, registryLabels);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const SUITE_RESERVED_ROUTE_SEGMENTS = new Set([
  "marketplace",
  "my-suites",
  "my-modules",
  "project-types",
  "linkapps",
]);

/** @deprecated */
export const MODULE_RESERVED_ROUTE_SEGMENTS = SUITE_RESERVED_ROUTE_SEGMENTS;

export type SuiteBreadcrumbHub = "my-suites" | "marketplace";

/** @deprecated */
export type ModuleBreadcrumbHub = SuiteBreadcrumbHub;

export function parseSuiteProfileId(pathname: string): string | null {
  const match = pathname.match(/^\/suites\/([^/?]+)/);
  if (!match) return null;
  const segment = match[1]!;
  if (SUITE_RESERVED_ROUTE_SEGMENTS.has(segment)) return null;
  return segment;
}

/** @deprecated */
export function parseModuleProfileId(pathname: string): string | null {
  const suites = parseSuiteProfileId(pathname);
  if (suites) return suites;
  const legacy = pathname.match(/^\/modules\/([^/?]+)/);
  if (!legacy) return null;
  const segment = legacy[1]!;
  if (SUITE_RESERVED_ROUTE_SEGMENTS.has(segment)) return null;
  return segment;
}

export function suiteBreadcrumbHubForAccess(
  access: "none" | "preview" | "subscribed" | "expired" | "cancelled",
): SuiteBreadcrumbHub {
  return access === "subscribed" || access === "preview" ? "my-suites" : "marketplace";
}

/** @deprecated */
export function moduleBreadcrumbHubForAccess(
  access: "none" | "preview" | "subscribed" | "expired" | "cancelled",
): SuiteBreadcrumbHub {
  return suiteBreadcrumbHubForAccess(access);
}

export type BreadcrumbItem = { href?: string; label: string };

export function buildSuitesBreadcrumbItems(
  pathname: string,
  tabRaw: string | null,
  registryLabels: Record<string, string>,
  suiteHubForProfile: SuiteBreadcrumbHub | null = null,
): BreadcrumbItem[] {
  const normalized = pathname.replace(/^\/modules\b/, "/suites").replace(/\/my-modules\b/, "/my-suites");
  const parts = normalized.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [{ href: LICENSEE_HOME_PATH, label: "LiNKaios" }];

  if (parts.length <= 1) {
    items.push({ label: "My Suites" });
    return items;
  }

  const segment = parts[1]!;

  if (segment === "marketplace") {
    items.push({ label: "Marketplace" });
    return items;
  }

  if (segment === "my-suites" || segment === "my-modules") {
    items.push({ label: "My Suites" });
    return items;
  }

  if (segment === "project-types") {
    items.push({ href: "/suites/my-suites", label: "My Suites" });
    items.push({ label: "Modules" });
    if (parts[2]) {
      items.push({ label: resolveModuleTemplateSegmentLabel(parts[2], registryLabels) });
    }
    return items;
  }

  const suiteLabel = resolveSuiteSegmentLabel(segment, registryLabels);
  const hub = suiteHubForProfile ?? "marketplace";
  const hubLabel = hub === "my-suites" ? "My Suites" : "Marketplace";
  const hubPath = hub === "my-suites" ? "/suites/my-suites" : "/suites/marketplace";
  items.push({ href: hubPath, label: hubLabel });
  items.push({ href: `/suites/${segment}`, label: suiteLabel });

  const tab = normalizeSuiteProfileTabParam(tabRaw ?? undefined);
  if (tab && tab !== "overview" && tab in SUITE_PROFILE_TAB_LABELS) {
    const tabLabel =
      tab === "sample-outputs"
        ? suiteSampleOutputsTabLabel(hub === "my-suites")
        : SUITE_PROFILE_TAB_LABELS[tab as Exclude<SuiteProfileTab, "overview">];
    items.push({ label: tabLabel });
    return items;
  }

  if (parts.length > 2) {
    let acc = `/suites/${segment}`;
    for (let i = 2; i < parts.length; i++) {
      const nested = parts[i]!;
      acc += `/${nested}`;
      const isLast = i === parts.length - 1;
      items.push({
        href: isLast ? undefined : acc,
        label: UUID_RE.test(nested)
          ? registryLabels[nested] ?? `…${nested.slice(0, 8)}`
          : formatSlugSegment(nested),
      });
    }
  }

  return items;
}

/** @deprecated */
export function buildModulesBreadcrumbItems(
  pathname: string,
  tabRaw: string | null,
  registryLabels: Record<string, string>,
  moduleHubForProfile: SuiteBreadcrumbHub | null = null,
): BreadcrumbItem[] {
  return buildSuitesBreadcrumbItems(pathname, tabRaw, registryLabels, moduleHubForProfile);
}

export function suiteProfilePageTitle(suite: ModuleCatalogueItem, tab: SuiteProfileTab, owned?: boolean): string {
  const tabLabel =
    tab === "overview"
      ? SUITE_PROFILE_OVERVIEW_TAB_LABEL
      : tab === "sample-outputs" && owned !== undefined
        ? suiteSampleOutputsTabLabel(owned)
        : (SUITE_PROFILE_TAB_LABELS[tab as Exclude<SuiteProfileTab, "overview">] ?? formatSlugSegment(tab));
  return `${suite.name} — ${tabLabel}`;
}

/** @deprecated */
export function moduleProfilePageTitle(
  module: ModuleCatalogueItem,
  tab: SuiteProfileTab,
  owned?: boolean,
): string {
  return suiteProfilePageTitle(module, tab, owned);
}

export function getSuiteById(suiteId: string): ModuleCatalogueItem | undefined {
  return MODULES_CATALOG_DEMO.modules.find((m) => m.id === suiteId);
}

/** @deprecated */
export function getModuleById(moduleId: string): ModuleCatalogueItem | undefined {
  return getSuiteById(moduleId);
}

export function getPublishedSuite(suiteId: string): ModuleCatalogueItem | undefined {
  const suite = getSuiteById(suiteId);
  if (!suite?.published) return undefined;
  return suite;
}

/** @deprecated */
export function getPublishedModule(moduleId: string): ModuleCatalogueItem | undefined {
  return getPublishedSuite(moduleId);
}

function normalizeSuiteProfileTabParam(raw: string | undefined): string | undefined {
  const tab = raw?.trim();
  if (tab === "processes") return "modules";
  return tab;
}

export function parseSuiteProfileTab(raw: string | undefined, owned: boolean): SuiteProfileTab {
  const tab = normalizeSuiteProfileTabParam(raw);
  if (tab === "modules" || tab === "projects" || tab === "sample-outputs") {
    if (tab === "projects" && !owned) return "overview";
    return tab;
  }
  if (!owned && (tab === "preview" || tab === "subscribe")) return tab;
  if (!owned && tab === "overview") return "overview";
  return "overview";
}

/** @deprecated */
export function parseModuleProfileTab(raw: string | undefined, owned: boolean): SuiteProfileTab {
  return parseSuiteProfileTab(raw, owned);
}

export function suiteProfileTabs(owned: boolean): { id: SuiteProfileTab; label: string }[] {
  const base = [
    { id: "overview" as const, label: SUITE_PROFILE_OVERVIEW_TAB_LABEL },
    { id: "modules" as const, label: SUITE_PROFILE_TAB_LABELS.modules },
    { id: "sample-outputs" as const, label: suiteSampleOutputsTabLabel(owned) },
  ];
  if (owned) {
    return [
      base[0]!,
      base[1]!,
      { id: "projects" as const, label: SUITE_PROFILE_TAB_LABELS.projects },
      base[2]!,
    ];
  }
  return [...base, { id: "preview" as const, label: "Preview" }, { id: "subscribe" as const, label: "Subscribe" }];
}

/** @deprecated */
export function moduleProfileTabs(owned: boolean): { id: SuiteProfileTab; label: string }[] {
  return suiteProfileTabs(owned);
}

export function suitesStartProjectHref(props: {
  suiteId: string;
  moduleTemplateId?: string;
  /** @deprecated */
  moduleId?: string;
  processId?: string;
  projectTypeId?: string;
}): string {
  const suiteId = props.suiteId || props.moduleId!;
  const params = new URLSearchParams();
  params.set("suite", suiteId);
  const moduleTemplateId = props.moduleTemplateId ?? props.processId ?? props.projectTypeId;
  if (moduleTemplateId) params.set("modules", moduleTemplateId);
  return `/projects/new?${params.toString()}`;
}

/** @deprecated */
export function modulesStartProjectHref(props: {
  moduleId: string;
  processId?: string;
  projectTypeId?: string;
}): string {
  return suitesStartProjectHref({
    suiteId: props.moduleId,
    moduleTemplateId: props.processId ?? props.projectTypeId,
  });
}

export function suiteProfileHref(suiteId: string, tab: SuiteProfileTab = "overview"): string {
  return tab === "overview" ? `/suites/${suiteId}` : `/suites/${suiteId}?tab=${tab}`;
}

/** @deprecated */
export function moduleProfileHref(moduleId: string, tab: SuiteProfileTab = "overview"): string {
  return suiteProfileHref(moduleId, tab);
}

/** @deprecated */
export function modulesDetailHref(suiteId: string): string {
  return suiteProfileHref(suiteId, "overview");
}

export function modulesForSuite(suiteId: string): ModuleProcess[] {
  return processesForModule(suiteId);
}

export { publishedMarketplaceModules, processesForModule, moduleStats, type ModuleProcess, type ModuleCatalogueItem };
