"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  X,
  BarChart3,
  Bot,
  Brain,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Clock,
  FolderKanban,
  Headphones,
  LayoutDashboard,
  Pin,
  Settings,
  Wrench,
} from "lucide-react";

import { ModulesSidebarSection } from "@/components/suites/modules-sidebar-section";
import { LicensorSuitesSidebarSection } from "@/components/suites/licensor-suites-sidebar-section";

import { useAppRole } from "@/components/role-preview-provider";
import { SidebarRoleBadge } from "@/components/sidebar-role-preview";
import { SidebarLicensorScope } from "@/components/sidebar-licensor-scope";
import { useAppSurface } from "@/components/app-surface-provider";
import { SidebarActiveContext } from "@/components/sidebar-active-context";
import { SignOutButton } from "@/components/sign-out-button";
import { ADMIN_BASE_PATH, LICENSEE_HOME_PATH, stripAppBasePath } from "@/lib/app-surface";
import { canSeeNavSection, visibleLinkbrainTabs } from "@/lib/app-roles";
import { linkbrainTabLabel } from "@/lib/linkbrain-page-copy";
import { effectiveBrandId, parseLicenseeContext } from "@/lib/licensee-context";
import { memoryHref } from "@/lib/memory-href";
import { settingsSectionActive, settingsSidebarItems } from "@/lib/settings-nav";
import { useTenantTopology } from "@/hooks/use-tenant-topology";
import { CUSTOMER_SERVICE_SIDEBAR_ITEMS, customerServiceSectionActive } from "@/lib/customer-service-nav";
import { METRICS_SIDEBAR_ITEMS, metricsSectionActive } from "@/lib/metrics-nav";
import { MEMORY_SIDEBAR_ITEMS, memorySectionActive } from "@/lib/memory-nav";
import { COMPANY_SIDEBAR_ITEMS, companySectionActive } from "@/lib/company-nav";
import { LICENSEES_PAGE_HEADER } from "@/lib/company-page-copy";

export type SidebarUser = {
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

function navLinkClass(active: boolean) {
  return (
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors " +
    (active
      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white")
  );
}

function subLinkClass(active: boolean) {
  return (
    "block rounded-md py-1.5 pl-4 pr-2 text-xs font-medium transition-colors " +
    (active
      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100")
  );
}

function footerSubLinkClass(active: boolean) {
  return (
    "block rounded-md py-1.5 pl-4 pr-2 text-xs font-medium transition-colors " +
    (active
      ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100")
  );
}

function placeholderSubItem(label: string, variant: "recent" | "pinned") {
  const Icon = variant === "recent" ? Clock : Pin;
  return (
    <div
      className="cursor-not-allowed rounded-md py-1.5 pl-4 pr-2 text-xs font-medium text-zinc-400 opacity-70 dark:text-zinc-500"
      title="Coming soon"
      aria-disabled="true"
    >
      <span className="inline-flex items-center gap-1.5">
        <Icon className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
        {label}
      </span>
    </div>
  );
}

function initialsForUser(user: SidebarUser): string {
  const raw = (user.displayName ?? user.email ?? "?").trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  if (raw.length >= 2) {
    return raw.slice(0, 2).toUpperCase();
  }
  return raw.slice(0, 1).toUpperCase() || "?";
}

function SidebarUserBlock(props: { user: SidebarUser }) {
  const { user } = props;
  const primary = user.displayName?.trim() || user.email?.split("@")[0] || "Signed in";
  const secondary = user.displayName && user.email && user.displayName !== user.email ? user.email : null;

  return (
    <div className="flex gap-2.5 border-t border-zinc-100 px-3 py-3 dark:border-zinc-800">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-200 ring-1 ring-zinc-300/80 dark:bg-zinc-800 dark:ring-zinc-600">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- OAuth URLs vary; avoid remotePatterns drift.
          <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-zinc-700 dark:text-zinc-200">
            {initialsForUser(user)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 truncate text-sm font-semibold leading-tight text-zinc-900 dark:text-zinc-100">{primary}</p>
          <SidebarRoleBadge />
        </div>
        {secondary ? (
          <p className="mt-0.5 truncate text-xs leading-tight text-zinc-500 dark:text-zinc-400">{secondary}</p>
        ) : user.email && primary !== user.email ? (
          <p className="mt-0.5 truncate text-xs leading-tight text-zinc-500 dark:text-zinc-400">{user.email}</p>
        ) : null}
      </div>
    </div>
  );
}

type AccordionKey =
  | "work"
  | "customer_service"
  | "agents"
  | "projects"
  | "skills"
  | "metrics"
  | "memory"
  | "company"
  | "settings"
  | null;

function accordionKeyForPath(pathname: string): AccordionKey {
  if (pathname.startsWith("/work")) return "work";
  if (customerServiceSectionActive(pathname)) return "customer_service";
  if (pathname.startsWith("/workers") || pathname.startsWith("/fleet")) return "agents";
  if (pathname.startsWith("/projects")) return "projects";
  if (pathname.startsWith("/skills")) return "skills";
  if (metricsSectionActive(pathname)) return "metrics";
  if (memorySectionActive(pathname)) return "memory";
  if (companySectionActive(pathname)) return "company";
  if (settingsSectionActive(pathname)) return "settings";
  return null;
}

export function ShellSidebar(props: {
  user: SidebarUser | null;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  surface?: "licensee" | "admin";
}) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { href: appHref, routePath, isAdmin } = useAppSurface();
  const { kind, role } = useAppRole();
  const route = routePath(pathname);
  const show = (section: Parameters<typeof canSeeNavSection>[2]) => canSeeNavSection(kind, role, section);
  const [openAccordion, setOpenAccordion] = useState<AccordionKey>(() => accordionKeyForPath(route));

  const { mode: topologyMode } = useTenantTopology();
  const licenseeCtx = parseLicenseeContext(searchParams, topologyMode);
  const { companyId } = licenseeCtx;
  const brandForLinks = effectiveBrandId(licenseeCtx);

  useEffect(() => {
    const k = accordionKeyForPath(route);
    if (k) setOpenAccordion((cur) => (cur === k ? cur : k));
    if (props.mobileOpen) props.onMobileOpenChange?.(false);
  }, [route, props.mobileOpen, props.onMobileOpenChange]);

  const workOpen = openAccordion === "work";
  const customerServiceOpen = openAccordion === "customer_service";
  const agentsOpen = openAccordion === "agents";
  const projectsOpen = openAccordion === "projects";
  const skillsOpen = openAccordion === "skills";
  const metricsOpen = openAccordion === "metrics";
  const memoryOpen = openAccordion === "memory";
  const companyOpen = openAccordion === "company";
  const settingsOpen = openAccordion === "settings";

  const toggle = (key: Exclude<AccordionKey, null>) => {
    setOpenAccordion((cur) => {
      if (cur === key) {
        if (key === "agents" && (route.startsWith("/workers") || route.startsWith("/fleet"))) {
          return cur;
        }
        return null;
      }
      return key;
    });
  };

  const agentsSectionActive = route.startsWith("/workers") || route.startsWith("/fleet");
  const workersFleetScope = searchParams.get("scope") === "admin" ? "admin" : "all";
  const workersListRoute = route === "/workers" || route === "/workers/";

  const settingsActive = settingsSectionActive(route);
  const metricsActive = metricsSectionActive(route);
  const memoryActive = memorySectionActive(route);
  const companyActive = companySectionActive(route);
  const subMenuRail = "ml-2 mt-0.5 border-l border-sky-500/35 pl-2 dark:border-sky-400/35";

  const mobileOpen = props.mobileOpen ?? false;
  const setMobileOpen = props.onMobileOpenChange ?? (() => {});
  const homePath = isAdmin ? ADMIN_BASE_PATH : LICENSEE_HOME_PATH;
  const settingsNavItems = settingsSidebarItems(isAdmin, { kind, role }).map((item) => ({
    ...item,
    href: appHref(item.href),
    match: (path: string, search?: string) => item.match(routePath(path), search),
  }));

  const linkbotsFleetLabel = isAdmin ? "All LiNKbots" : "All LiNKbots";
  const visibleMemoryTabs = visibleLinkbrainTabs(kind, role);

  const memoryLink = (tab: (typeof MEMORY_SIDEBAR_ITEMS)[number]["id"]) =>
    appHref(memoryHref(tab, { companyId, brandId: brandForLinks ?? undefined }));

  return (
    <>
      <div
        className={
          "fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden " + (mobileOpen ? "opacity-100" : "pointer-events-none opacity-0")
        }
        aria-hidden
        onClick={() => setMobileOpen(false)}
      />
      <aside
        id="shell-sidebar"
        className={
          "fixed inset-y-0 left-0 z-50 flex h-screen max-h-screen w-60 shrink-0 flex-col overflow-hidden border-r border-zinc-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-950 md:sticky md:top-0 md:z-auto md:translate-x-0 " +
          (mobileOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-zinc-100 px-4 dark:border-zinc-800">
          <Link href={homePath} className="flex min-w-0 items-center gap-2.5" aria-label="LiNKaios home">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-[11px] font-bold tracking-tight text-white dark:bg-zinc-100 dark:text-zinc-900">
              LK
            </span>
            <span className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {isAdmin ? "LiNKaios Admin" : "LiNKaios"}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-100 md:hidden dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-2 py-3" aria-label="Primary">
          {show("overview") ? (
            <Link href={homePath} className={navLinkClass(route === stripAppBasePath(homePath) || pathname === homePath)}>
              <LayoutDashboard className="h-4 w-4 shrink-0 opacity-85" aria-hidden />
              Overview
            </Link>
          ) : null}

          {show("work") ? (
            <div className="mt-1">
              <button
                type="button"
                onClick={() => toggle("work")}
                className={
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 " +
                  (route.startsWith("/work") ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "")
                }
                aria-expanded={workOpen}
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 shrink-0 opacity-85" aria-hidden />
                  Work
                </span>
                {workOpen ? <ChevronDown className="h-4 w-4 text-zinc-400" aria-hidden /> : <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />}
              </button>
              {workOpen ? (
                <div className={subMenuRail}>
                  <Link href={appHref("/work")} className={footerSubLinkClass(route === "/work" || route === "/work/")}>
                    All Work
                  </Link>
                  <Link href={appHref("/work/alerts")} className={subLinkClass(route === "/work/alerts")}>
                    Alerts
                  </Link>
                  <Link href={appHref("/work/messages")} className={subLinkClass(route === "/work/messages")}>
                    Messages
                  </Link>
                  <Link href={appHref("/work/sessions")} className={subLinkClass(route === "/work/sessions")}>
                    Sessions
                  </Link>
                  {isAdmin ? (
                    <Link
                      href={appHref("/customer-service")}
                      className={subLinkClass(customerServiceSectionActive(route))}
                    >
                      Support Tickets
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {isAdmin && show("customer_service") ? (
            <div className="mt-1">
              <button
                type="button"
                onClick={() => toggle("customer_service")}
                className={
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 " +
                  (customerServiceSectionActive(route)
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "")
                }
                aria-expanded={customerServiceOpen}
              >
                <span className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 shrink-0 opacity-85" aria-hidden />
                  Customer Service
                </span>
                {customerServiceOpen ? (
                  <ChevronDown className="h-4 w-4 text-zinc-400" aria-hidden />
                ) : (
                  <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />
                )}
              </button>
              {customerServiceOpen ? (
                <div className={subMenuRail}>
                  {CUSTOMER_SERVICE_SIDEBAR_ITEMS.map((item) => (
                    <Link key={item.id} href={appHref(item.href)} className={subLinkClass(item.match(route))}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {show("projects") ? (
            <div className="mt-1">
              <button
                type="button"
                onClick={() => toggle("projects")}
                className={
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 " +
                  (route.startsWith("/projects") ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "")
                }
                aria-expanded={projectsOpen}
              >
                <span className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 shrink-0 opacity-85" aria-hidden />
                  Projects
                </span>
                {projectsOpen ? <ChevronDown className="h-4 w-4 text-zinc-400" aria-hidden /> : <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />}
              </button>
              {projectsOpen ? (
                <div className={subMenuRail}>
                  <Link href={appHref("/projects")} className={footerSubLinkClass(route === "/projects")}>
                    All Projects
                  </Link>
                  {placeholderSubItem("Recent", "recent")}
                  {placeholderSubItem("Pinned", "pinned")}
                </div>
              ) : null}
            </div>
          ) : null}

          {show("suites") ? (isAdmin ? <LicensorSuitesSidebarSection /> : <ModulesSidebarSection />) : null}

          {show("metrics") ? (
            <div className="mt-1">
              <button
                type="button"
                onClick={() => toggle("metrics")}
                className={
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 " +
                  (metricsActive ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "")
                }
                aria-expanded={metricsOpen}
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 shrink-0 opacity-85" aria-hidden />
                  Metrics
                </span>
                {metricsOpen ? (
                  <ChevronDown className="h-4 w-4 text-zinc-400" aria-hidden />
                ) : (
                  <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />
                )}
              </button>
              {metricsOpen ? (
                <div className={subMenuRail}>
                  {METRICS_SIDEBAR_ITEMS.map((item) => (
                    <Link
                      key={item.id}
                      href={appHref(item.href)}
                      className={subLinkClass(item.match(route, searchParams.toString()))}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {show("linkbots") ? (
            <div className="mt-1">
              <button
                type="button"
                onClick={() => toggle("agents")}
                className={
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 " +
                  (agentsSectionActive
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "")
                }
                aria-expanded={agentsOpen}
              >
                <span className="flex items-center gap-2">
                  <Bot className="h-4 w-4 shrink-0 opacity-85" aria-hidden />
                  LiNKbots
                </span>
                {agentsOpen ? <ChevronDown className="h-4 w-4 text-zinc-400" aria-hidden /> : <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />}
              </button>
              {agentsOpen ? (
                <div className={subMenuRail}>
                  <Link
                    href={appHref("/workers")}
                    className={footerSubLinkClass(workersListRoute && workersFleetScope === "all")}
                  >
                    {linkbotsFleetLabel}
                  </Link>
                  {isAdmin ? (
                    <>
                      <Link
                        href={appHref("/workers?scope=admin")}
                        className={subLinkClass(workersListRoute && workersFleetScope === "admin")}
                      >
                        Admin LiNKbots
                      </Link>
                      <Link href={appHref("/fleet")} className={subLinkClass(route.startsWith("/fleet"))}>
                        Fleet v1
                      </Link>
                    </>
                  ) : null}
                  {placeholderSubItem("Recent", "recent")}
                  {placeholderSubItem("Pinned", "pinned")}
                </div>
              ) : null}
            </div>
          ) : null}

          {show("linkskills") ? (
            <div className="mt-1">
              <button
                type="button"
                onClick={() => toggle("skills")}
                className={
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 " +
                  (route.startsWith("/skills") ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "")
                }
                aria-expanded={skillsOpen}
              >
                <span className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 shrink-0 opacity-85" aria-hidden />
                  LiNKskills
                </span>
                {skillsOpen ? <ChevronDown className="h-4 w-4 text-zinc-400" aria-hidden /> : <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />}
              </button>
              {skillsOpen ? (
                <div className={subMenuRail}>
                  <Link href={appHref("/skills")} className={footerSubLinkClass(route === "/skills" || route === "/skills/")}>
                    Overview
                  </Link>
                  <Link
                    href={appHref("/skills/skills")}
                    className={subLinkClass(
                      route.startsWith("/skills/skills") ||
                        /^\/skills\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(\/|$)/i.test(route),
                    )}
                  >
                    Skills
                  </Link>
                  <Link href={appHref("/skills/tools")} className={subLinkClass(route.startsWith("/skills/tools"))}>
                    Tools
                  </Link>
                  <Link href={appHref("/skills/connectors")} className={subLinkClass(route.startsWith("/skills/connectors"))}>
                    Capabilities
                  </Link>
                  <Link href={appHref("/skills/leases")} className={subLinkClass(route.startsWith("/skills/leases"))}>
                    Leases
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}

          {show("linkbrain") ? (
            <div className="mt-1">
              <button
                type="button"
                onClick={() => toggle("memory")}
                className={
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 " +
                  (memoryActive ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "")
                }
                aria-expanded={memoryOpen}
              >
                <span className="flex items-center gap-2">
                  <Brain className="h-4 w-4 shrink-0 opacity-85" aria-hidden />
                  LiNKbrain
                </span>
                {memoryOpen ? (
                  <ChevronDown className="h-4 w-4 text-zinc-400" aria-hidden />
                ) : (
                  <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />
                )}
              </button>
              {memoryOpen ? (
                <div className={subMenuRail}>
                  {MEMORY_SIDEBAR_ITEMS.filter((item) => visibleMemoryTabs.includes(item.id)).map((item) => (
                    <Link
                      key={item.id}
                      href={memoryLink(item.id)}
                      className={subLinkClass(item.match(route, searchParams.toString()))}
                    >
                      {linkbrainTabLabel(item.id, kind)}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {show("company") ? (
            <div className="mt-1">
              <button
                type="button"
                onClick={() => toggle("company")}
                className={
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 " +
                  (companyActive ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "")
                }
                aria-expanded={companyOpen}
              >
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 shrink-0 opacity-85" aria-hidden />
                  {kind === "licensor" ? LICENSEES_PAGE_HEADER.title : "Company"}
                </span>
                {companyOpen ? (
                  <ChevronDown className="h-4 w-4 text-zinc-400" aria-hidden />
                ) : (
                  <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />
                )}
              </button>
              {companyOpen ? (
                <div className={subMenuRail}>
                  {kind === "licensor" ? (
                    <Link href={appHref("/licensees")} className={subLinkClass(companyActive)}>
                      Registry
                    </Link>
                  ) : (
                    COMPANY_SIDEBAR_ITEMS.map((item) => (
                      <Link
                        key={item.id}
                        href={appHref(item.href(companyId, licenseeCtx.brandId ?? brandForLinks))}
                        className={subLinkClass(item.match(pathname, searchParams.toString()))}
                      >
                        {item.label}
                      </Link>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          {show("settings") ? (
            <div className="mt-1">
              <button
                type="button"
                onClick={() => toggle("settings")}
                className={
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 " +
                  (settingsActive ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "")
                }
                aria-expanded={settingsOpen}
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4 shrink-0 opacity-85" aria-hidden />
                  Settings
                </span>
                {settingsOpen ? (
                  <ChevronDown className="h-4 w-4 text-zinc-400" aria-hidden />
                ) : (
                  <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />
                )}
              </button>
              {settingsOpen ? (
                <div className={subMenuRail}>
                  {settingsNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={subLinkClass(item.match(pathname, searchParams.toString()))}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>

        <div className="shrink-0 border-t border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="space-y-3 px-2 py-3">
            {isAdmin ? <SidebarLicensorScope /> : <SidebarActiveContext />}
          </div>
          {props.user ? (
            <>
              <SidebarUserBlock user={props.user} />
              <div className="px-3 pb-3">
                <SignOutButton className="w-full justify-center border-zinc-300 bg-white px-2 py-2 text-xs dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200" />
              </div>
            </>
          ) : null}
        </div>
      </aside>
    </>
  );
}
