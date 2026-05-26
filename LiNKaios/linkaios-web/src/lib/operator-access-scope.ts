import type { CommandCentreRole } from "@/lib/command-centre-access";
import { COMPANY_FIXTURES } from "@/lib/company-fixtures";
import { BUSINESS_PROCESSES } from "@/lib/ui-mocks/modules-catalog-business";
import { DEMO_SIDEBAR_MISSIONS } from "@/lib/ui-mocks/entities";
import { MODULES_CATALOG_DEMO } from "@/lib/ui-mocks/modules-catalog-demo";

export type OperatorAccessItem = {
  id: string;
  label: string;
  detail?: string;
};

export type OperatorAccessScope = {
  companies: OperatorAccessItem[];
  modules: OperatorAccessItem[];
  processes: OperatorAccessItem[];
  projects: OperatorAccessItem[];
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

/** MVO fixture until admin user-assignment API is wired. */
export function resolveOperatorAccessScope(params: {
  email: string;
  role?: CommandCentreRole;
}): OperatorAccessScope {
  const role = params.role ?? "operator";
  const studio = isStudioEmail(params.email);

  if (role === "admin" && studio) {
    return {
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
    companies: [{ id: clientCompany.id, label: clientCompany.displayName }],
    modules: [{ id: "linksites", label: moduleName("linksites") ?? "LinkSites" }],
    processes: [websiteFactoryProcess()],
    projects: DEMO_SIDEBAR_MISSIONS.slice(0, 2).map((mission) => ({
      id: mission.id,
      label: mission.title,
    })),
  };
}
