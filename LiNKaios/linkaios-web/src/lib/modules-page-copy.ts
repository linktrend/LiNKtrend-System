import { MODULES_CATALOG_DEMO } from "@/lib/ui-mocks/modules-catalog-demo";

export function resolveModulesPageHeader(props: {
  browse: "module" | "project-type";
  moduleId?: string;
  projectTypeId?: string;
}): { title: string; subtitle: string } {
  if (props.browse === "project-type" && props.projectTypeId) {
    const pt = MODULES_CATALOG_DEMO.projectTypes.find((p) => p.id === props.projectTypeId);
    if (pt) {
      const mod = MODULES_CATALOG_DEMO.modules.find((m) => m.id === pt.moduleId);
      return {
        title: pt.name,
        subtitle: `Project type in ${mod?.name ?? "module"} — pre-defined workflows and template tasks. Start a project from this type; operators cannot invent new process shapes yet.`,
      };
    }
  }

  if (props.browse === "module" && props.moduleId) {
    const mod = MODULES_CATALOG_DEMO.modules.find((m) => m.id === props.moduleId);
    if (mod) {
      return {
        title: mod.name,
        subtitle: `${mod.summary} Browse project types, then start a governed project when ready.`,
      };
    }
  }

  if (props.browse === "project-type") {
    return {
      title: "Project types",
      subtitle: "Pre-defined process templates across modules — each type bundles workflows and template tasks. Projects are started from these types only.",
    };
  }

  return {
    title: "Modules",
    subtitle: "Service modules for your tenant — each module offers pre-defined project types (process templates), workflows, and template tasks. Live work appears under Projects.",
  };
}

export function modulesStartProjectHref(props: { moduleId?: string; projectTypeId?: string }): string {
  const params = new URLSearchParams();
  if (props.moduleId) params.set("module", props.moduleId);
  if (props.projectTypeId) params.set("projectType", props.projectTypeId);
  const q = params.toString();
  return q ? `/projects/new?${q}` : "/projects/new";
}
