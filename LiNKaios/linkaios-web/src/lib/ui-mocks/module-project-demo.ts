/** Tenant projects — each project selects one or more vendor-published modules from a suite. */

export type ModuleProjectFixture = {
  id: string;
  moduleId: string;
  name: string;
  summary: string;
  /** Published module template ids from the suite catalogue included in this project. */
  processIds: string[];
};

const MODULE_PROJECTS: ModuleProjectFixture[] = [
  {
    id: "demo-smb",
    moduleId: "linksites",
    name: "SMB Website Builder",
    summary: "Single-process project running Lead to preview site for one qualified SMB lead.",
    processIds: ["website-factory"],
  },
  {
    id: "demo-northwind-program",
    moduleId: "linksites",
    name: "Northwind Growth Program",
    summary:
      "Multi-process engagement: preview site generation, recurring site audit, and batch lead qualification for the Northwind account.",
    processIds: ["website-factory", "site-refresh", "lead-qualification-pack"],
  },
];

export { MODULE_PROJECTS };

export function projectsForModule(moduleId: string): ModuleProjectFixture[] {
  return MODULE_PROJECTS.filter((p) => p.moduleId === moduleId);
}

export function projectProcessCountLabel(count: number): string {
  return `${count} module${count === 1 ? "" : "s"} selected from suite catalogue`;
}
