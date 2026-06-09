import type { AppRoleTier, ShellNavSection } from "@/lib/app-roles";
import { ROLE_TIER_LABELS, visibleLicensorNavSections } from "@/lib/app-roles";
import type { AppSurface } from "@/lib/app-surface";
import type { CommandCentreRole } from "@/lib/command-centre-access";
import { COMPANY_FIXTURES } from "@/lib/company-fixtures";
import { LICENSEE_REGISTRY } from "@/lib/licensee-registry";
import { BUSINESS_PROCESSES } from "@/lib/ui-mocks/modules-catalog-business";
import { DEMO_SIDEBAR_MISSIONS } from "@/lib/ui-mocks/entities";
import { MODULES_CATALOG_DEMO } from "@/lib/ui-mocks/modules-catalog-demo";

export type OperatorAccessItem = {
  id: string;
  label: string;
  detail?: string;
};

export type OperatorWorkspaceAccessScope = {
  variant: "workspace";
  companies: OperatorAccessItem[];
  modules: OperatorAccessItem[];
  processes: OperatorAccessItem[];
  projects: OperatorAccessItem[];
};

export type OperatorPlatformAccessScope = {
  variant: "platform";
  roleTier: AppRoleTier;
  roleTierLabel: string;
  licensees: OperatorAccessItem[];
  navSections: OperatorAccessItem[];
};

export type OperatorAccessScope = OperatorWorkspaceAccessScope | OperatorPlatformAccessScope;

export function isPlatformAccessScope(scope: OperatorAccessScope): scope is OperatorPlatformAccessScope {
  return scope.variant === "platform";
}

export function isWorkspaceAccessScope(scope: OperatorAccessScope): scope is OperatorWorkspaceAccessScope {
  return scope.variant === "workspace";
}

const LICENSOR_NAV_SECTION_LABELS: Record<ShellNavSection, string> = {
  overview: "Overview",
  work: "Work",
  customer_service: "Customer Service",
  projects: "Projects",
  linkbots: "LiNKbots",
  suites: "Suites",
  linkskills: "LiNKskills",
  linkbrain: "LiNKbrain",
  company: "Licensees",
  metrics: "Metrics",
  settings: "Settings",
};

const STUDIO_COMPANY: OperatorAccessItem = {
  id: "linktrend-studio",
  label: "LiNKtrend",
  detail: "Venture studio",
};

function moduleName(moduleId: string): string | undefined {
  return MODULES_CATALOG_DEMO.modules.find((row) => row.id === moduleId)?.name;
}

function dedupeAccessItems(items: OperatorAccessItem[]): OperatorAccessItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function catalogProcessesForAdmin(): OperatorAccessItem[] {
  const core = MODULES_CATALOG_DEMO.processes
    .filter((row) => row.published)
    .map((row) => ({
      id: row.id,
      label: row.name,
      detail: moduleName(row.moduleId),
    }));

  const business = BUSINESS_PROCESSES.map((row) => ({
    id: row.id,
    label: row.name,
    detail: moduleName(row.moduleId),
  }));

  return dedupeAccessItems([...core, ...business]);
}

function websiteFactoryProcess(): OperatorAccessItem {
  const process = MODULES_CATALOG_DEMO.processes.find((row) => row.id === "website-factory");
  return {
    id: "website-factory",
    label: process?.name ?? "Lead to preview site",
    detail: moduleName("linksites"),
  };
}

function isStudioEmail(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  return normalized.endsWith("@linktrend.media") || normalized.endsWith("@linktrend.com");
}

function licenseesForPlatformRole(roleTier: AppRoleTier): OperatorAccessItem[] {
  const rows = roleTier === "user" ? LICENSEE_REGISTRY.slice(0, 2) : LICENSEE_REGISTRY;
  return rows.map((row) => ({
    id: row.id,
    label: row.name,
    detail: `${row.plan} · ${row.status}`,
  }));
}

function navSectionsForPlatformRole(roleTier: AppRoleTier): OperatorAccessItem[] {
  return visibleLicensorNavSections(roleTier).map((section) => ({
    id: section,
    label: LICENSOR_NAV_SECTION_LABELS[section],
  }));
}

function resolvePlatformAccessScope(roleTier: AppRoleTier): OperatorPlatformAccessScope {
  return {
    variant: "platform",
    roleTier,
    roleTierLabel: ROLE_TIER_LABELS[roleTier],
    licensees: licenseesForPlatformRole(roleTier),
    navSections: navSectionsForPlatformRole(roleTier),
  };
}

/** MVO fixture until admin user-assignment API is wired. */
export function resolveOperatorAccessScope(params: {
  email: string;
  role?: CommandCentreRole;
  surface?: AppSurface;
  appRoleTier?: AppRoleTier;
}): OperatorAccessScope {
  if (params.surface === "admin") {
    return resolvePlatformAccessScope(params.appRoleTier ?? "admin");
  }

  const role = params.role ?? "operator";
  const studio = isStudioEmail(params.email);

  if (role === "admin" && studio) {
    return {
      variant: "workspace",
      companies: [
        STUDIO_COMPANY,
        ...COMPANY_FIXTURES.slice(0, 2).map((company) => ({
          id: company.id,
          label: company.displayName,
        })),
      ],
      modules: MODULES_CATALOG_DEMO.modules
        .filter((row) => row.published)
        .slice(0, 6)
        .map((row) => ({ id: row.id, label: row.name })),
      processes: catalogProcessesForAdmin(),
      projects: DEMO_SIDEBAR_MISSIONS.map((mission) => ({
        id: mission.id,
        label: mission.title,
      })),
    };
  }

  if (role === "viewer") {
    return {
      variant: "workspace",
      companies: [STUDIO_COMPANY],
      modules: [{ id: "linksites", label: moduleName("linksites") ?? "LinkSites" }],
      processes: [websiteFactoryProcess()],
      projects: DEMO_SIDEBAR_MISSIONS.slice(0, 1).map((mission) => ({
        id: mission.id,
        label: mission.title,
      })),
    };
  }

  const clientCompany = COMPANY_FIXTURES[0]!;
  return {
    variant: "workspace",
    companies: [{ id: clientCompany.id, label: clientCompany.displayName }],
    modules: [{ id: "linksites", label: moduleName("linksites") ?? "LinkSites" }],
    processes: [websiteFactoryProcess()],
    projects: DEMO_SIDEBAR_MISSIONS.slice(0, 2).map((mission) => ({
      id: mission.id,
      label: mission.title,
    })),
  };
}
