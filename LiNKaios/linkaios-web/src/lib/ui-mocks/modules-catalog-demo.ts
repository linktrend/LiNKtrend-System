export type AudienceMode = "client" | "vendor";

export type ModuleIssue = {
  id: string;
  title: string;
  status: "open" | "watch" | "resolved";
  clientSafe: boolean;
};

export type ModuleWorkflow = {
  id: string;
  name: string;
  stage: string;
  clientSafeSummary: string;
  vendorOperationalNote: string;
  issues: ModuleIssue[];
};

export type ModuleProjectType = {
  id: string;
  name: string;
  moduleId: string;
  published: boolean;
  clientLicensed: boolean;
  clientSafeSummary: string;
  vendorOnlyNote: string;
  workflows: ModuleWorkflow[];
};

export type ModuleCatalogueItem = {
  id: string;
  name: string;
  summary: string;
  published: boolean;
  clientLicensed: boolean;
  vendorOwner: string;
};

export type ModulesCatalogModel = {
  modules: ModuleCatalogueItem[];
  projectTypes: ModuleProjectType[];
};

export const MODULES_CATALOG_DEMO: ModulesCatalogModel = {
  modules: [
    {
      id: "linksites",
      name: "LinkSites",
      summary: "Lead-to-preview site delivery module.",
      published: true,
      clientLicensed: true,
      vendorOwner: "Growth Operations",
    },
    {
      id: "linkapps",
      name: "LiNKapps",
      summary: "App Factory execution with milestone governance.",
      published: true,
      clientLicensed: false,
      vendorOwner: "Product Engineering",
    },
    {
      id: "linktrend-media",
      name: "Linktrend Media",
      summary: "Campaign planning, content production, and publishing queues.",
      published: false,
      clientLicensed: false,
      vendorOwner: "Media Studio",
    },
  ],
  projectTypes: [
    {
      id: "website-factory",
      moduleId: "linksites",
      name: "WebsiteFactory MVO",
      published: true,
      clientLicensed: true,
      clientSafeSummary: "Tracks lead intake, preview generation, and review checkpoints.",
      vendorOnlyNote: "Includes vendor lease posture and escalation playbooks.",
      workflows: [
        {
          id: "wf-intake",
          name: "Lead Intake & Qualification",
          stage: "Intake",
          clientSafeSummary: "Captures inbound lead details and qualification state.",
          vendorOperationalNote: "Normalizes CRM payload mappings and de-dup rules.",
          issues: [
            { id: "i-101", title: "Missing industry taxonomy on 2 new leads", status: "watch", clientSafe: true },
            { id: "i-102", title: "CRM dedup threshold tuning", status: "open", clientSafe: false },
          ],
        },
        {
          id: "wf-preview",
          name: "Preview Generation",
          stage: "Build",
          clientSafeSummary: "Builds preview artifact and surfaces review URL.",
          vendorOperationalNote: "Checks workflow retries and connector timeout budget.",
          issues: [
            { id: "i-103", title: "One preview publish retry exceeded SLA", status: "open", clientSafe: true },
          ],
        },
      ],
    },
    {
      id: "app-factory-operator",
      moduleId: "linkapps",
      name: "App Factory Operator",
      published: true,
      clientLicensed: false,
      clientSafeSummary: "Coordinates app concept-to-delivery checkpoints.",
      vendorOnlyNote: "Shows internal readiness gates and resource allocation notes.",
      workflows: [
        {
          id: "wf-scope",
          name: "Scope & Architecture Fit",
          stage: "Scoping",
          clientSafeSummary: "Confirms delivery stages and acceptance gates.",
          vendorOperationalNote: "Includes internal architecture debt risk notes.",
          issues: [
            { id: "i-201", title: "Unassigned architecture reviewer", status: "open", clientSafe: false },
          ],
        },
      ],
    },
  ],
};

export function moduleVisibleToAudience(module: ModuleCatalogueItem, audience: AudienceMode): boolean {
  if (audience === "vendor") return true;
  return module.published && module.clientLicensed;
}

export function projectTypeVisibleToAudience(projectType: ModuleProjectType, audience: AudienceMode): boolean {
  if (audience === "vendor") return true;
  return projectType.published && projectType.clientLicensed;
}

export function issueVisibleToAudience(issue: ModuleIssue, audience: AudienceMode): boolean {
  if (audience === "vendor") return true;
  return issue.clientSafe;
}
