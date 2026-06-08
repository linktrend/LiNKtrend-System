"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { useAppSurface } from "@/components/app-surface-provider";
import { useAppRole } from "@/components/role-preview-provider";
import { useBreadcrumbLabels } from "@/components/breadcrumb-label-registry";
import {
  buildModulesBreadcrumbItems,
  moduleBreadcrumbHubForAccess,
  parseModuleProfileId,
} from "@/lib/modules-page-copy";
import { useModuleSubscriptions } from "@/hooks/use-module-subscriptions";
import { resolveSettingsSubpageMeta } from "@/lib/shell-page-meta";
import { enrichShellBreadcrumbs } from "@/lib/shell-breadcrumb-hubs";
import { fixtureLicensedByModule } from "@/lib/ui-mocks/modules-catalog-demo";
import { LICENSEES_PAGE_HEADER } from "@/lib/company-page-copy";
import { formatUiLabel, SHELL } from "@/lib/ui-standards";

const STATIC_LABELS: Record<string, string> = {
  work: "Work",
  alerts: "Alerts",
  messages: "Messages",
  sessions: "Sessions",
  workers: "LiNKbots",
  missions: "Projects",
  projects: "Projects",
  skills: "LiNKskills",
  tools: "Tools",
  connectors: "Capabilities",
  modules: "Suites",
  suites: "Suites",
  marketplace: "Marketplace",
  "my-modules": "My Suites",
  "my-suites": "My Suites",
  "lexos-litigation": "LEXOS Litigation",
  "research-development": "Research & Development",
  "finance-accounting": "Finance & Accounting",
  "human-resources": "Human Resources",
  "legal-compliance": "Legal & Compliance",
  "business-development": "Business Development",
  "software-development": "Software Development",
  "content-creation": "Content Creation",
  "customer-success": "Customer Success",
  "project-types": "Modules",
  linksites: "LinkSites",
  linkapps: "LiNKapps",
  "linktrend-media": "Linktrend Media",
  "website-factory": "WebsiteFactory MVO",
  "app-factory-operator": "App Factory Operator",
  brain: "LiNKbrain",
  models: "Models",
  memory: "LiNKbrain",
  metrics: "Metrics",
  company: "Company",
  licensees: LICENSEES_PAGE_HEADER.title,
  gateway: "Integration routing",
  settings: "Settings",
  user: "User",
  access: "Access",
  platform: "Platform",
  traces: "System logs",
  governance: "Governance",
  devtools: "Devtools",
  admin: "Admin",
  login: "Login",
};

const DEMO_AGENT_LABEL: Record<string, string> = {
  "demo-lisa": "Lisa (CEO)",
  "demo-eric": "Eric (CTO)",
};

const DEMO_MISSION_LABEL: Record<string, string> = {
  "demo-smb": "SMB Website Builder",
  "demo-ai-edu": "Ai Edu Channel",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function segmentLabel(
  seg: string,
  fixtureLabelsInNav: boolean,
  uuidLabels: Record<string, string>,
  prevSeg?: string,
): string {
  if (fixtureLabelsInNav) {
    if (DEMO_AGENT_LABEL[seg]) return DEMO_AGENT_LABEL[seg];
    if (DEMO_MISSION_LABEL[seg]) return DEMO_MISSION_LABEL[seg];
  }
  if (STATIC_LABELS[seg]) return STATIC_LABELS[seg];
  if (UUID_RE.test(seg) && uuidLabels[seg]) return uuidLabels[seg]!;
  if (UUID_RE.test(seg) && prevSeg === "sessions") return "Session";
  if (UUID_RE.test(seg)) return `…${seg.slice(0, 8)}`;
  return formatUiLabel(seg.replace(/-/g, " "));
}

export function AutoBreadcrumbs(props: { fixtureLabelsInNav?: boolean }) {
  const fixtureLabelsInNav = Boolean(props.fixtureLabelsInNav);
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const { href: appHref, routePath } = useAppSurface();
  const { kind } = useAppRole();
  const route = routePath(pathname);
  const uuidLabels = useBreadcrumbLabels();
  const parts = route.split("/").filter(Boolean);
  const fixtureLicensed = useMemo(() => fixtureLicensedByModule(), []);
  const { accessFor } = useModuleSubscriptions(fixtureLicensed);
  const moduleProfileId = parseModuleProfileId(route);
  const moduleHubForProfile = moduleProfileId
    ? moduleBreadcrumbHubForAccess(accessFor(moduleProfileId))
    : null;

  const items: { href?: string; label: string }[] = [];

  if (route === "/memory" || route.startsWith("/memory/")) {
    items.push({ href: appHref("/memory?tab=inbox"), label: "LiNKbrain" });
    if (route !== "/memory" && route !== "/memory/") {
      let acc = "";
      for (let i = 1; i < parts.length; i++) {
        const seg = parts[i]!;
        acc += `/${seg}`;
        const prev = i > 0 ? parts[i - 1] : undefined;
        items.push({ href: appHref(`/memory${acc}`), label: segmentLabel(seg, fixtureLabelsInNav, uuidLabels, prev) });
      }
    }
    enrichShellBreadcrumbs(route, searchParams, items, kind);
  } else if (route === "/client" || route === "/client/" || route === "/app" || route === "/app/") {
    items.push({ href: appHref("/client"), label: "LiNKaios" }, { label: "Overview" });
  } else if (route === "/suites" || route.startsWith("/suites/")) {
    items.push(
      ...buildModulesBreadcrumbItems(route, searchParams.get("tab"), uuidLabels, moduleHubForProfile).map((item) =>
        item.href ? { ...item, href: appHref(item.href) } : item,
      ),
    );
  } else {
    items.push({ href: appHref("/client"), label: "LiNKaios" });
    let acc = "";
    for (let i = 0; i < parts.length; i++) {
      const seg = parts[i]!;
      acc += `/${seg}`;
      const prev = i > 0 ? parts[i - 1] : undefined;
      let label = segmentLabel(seg, fixtureLabelsInNav, uuidLabels, prev);
      if (parts[0] === "settings" && i === parts.length - 1) {
        if (acc === "/settings/access" && kind === "licensor") {
          label = formatUiLabel("Operator roles & permissions");
        } else if (acc === "/settings/api-keys" && kind === "licensor") {
          label = formatUiLabel("Platform secrets");
        } else {
          const meta = resolveSettingsSubpageMeta(acc);
          if (meta) label = formatUiLabel(meta.title);
        }
      }
      if (parts[0] === "skills" && i === 1 && seg === "skills") label = "Skills";
      if (parts[0] === "skills" && i === 1 && seg === "tools") label = "Tools";
      if (parts[0] === "skills" && i === 1 && seg === "connectors") label = "Capabilities";
      if (parts[0] === "skills" && i === 1 && seg === "leases") label = "Leases";
      items.push({ href: appHref(acc), label });
    }
    enrichShellBreadcrumbs(route, searchParams, items, kind);
  }

  return (
    <nav aria-label="Breadcrumb" className={SHELL.breadcrumbNav}>
      <ol className={SHELL.breadcrumbList}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.href ?? "cur"}-${item.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 ? <span className={SHELL.breadcrumbSep} aria-hidden>/</span> : null}
              {last || !item.href ? (
                <span className={SHELL.breadcrumbCurrent}>{item.label}</span>
              ) : (
                <Link href={appHref(item.href)} className={SHELL.breadcrumbLink}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
