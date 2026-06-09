import {
  MODULES_CATALOG_DEMO,
  processesForModule,
  type ModuleProcess,
  type ModuleIssueTemplate,
} from "@/lib/ui-mocks/modules-catalog-demo";

export type LicensorSuitePublishState = "draft" | "ready" | "published";

export type LicensorSuiteProduct = {
  id: string;
  name: string;
  summary: string;
  publishState: LicensorSuitePublishState;
  stripeProductId: string | null;
  modules: ModuleProcess[];
  moduleCount: number;
  phaseCount: number;
  issueCount: number;
  linkbotCount: number;
  automationCount: number;
};

export type LicensorSuiteLinkbotRow = {
  id: string;
  displayName: string;
  role: string;
  moduleName: string;
  phaseName: string;
  issueTitle: string;
};

export type LicensorSuiteAutomationRow = {
  id: string;
  title: string;
  handle: string;
  moduleName: string;
  phaseName: string;
  issueTitle: string;
  description: string;
};

export type SuiteCompletenessChecklist = {
  name: boolean;
  summary: boolean;
  modules: boolean;
  phases: boolean;
  issues: boolean;
  linkbots: boolean;
  automations: boolean;
};

function countComposition(processes: ModuleProcess[]) {
  let phaseCount = 0;
  let issueCount = 0;
  let linkbotCount = 0;
  let automationCount = 0;

  for (const process of processes) {
    phaseCount += process.workflows.length;
    for (const workflow of process.workflows) {
      issueCount += workflow.issues.length;
      for (const issue of workflow.issues) {
        for (const ex of issue.executors) {
          if (ex.kind === "agent") linkbotCount += 1;
          else if (ex.kind === "automation") automationCount += 1;
          else if (ex.kind === "hybrid") {
            linkbotCount += 1;
            automationCount += 1;
          }
        }
      }
    }
  }

  return {
    moduleCount: processes.length,
    phaseCount,
    issueCount,
    linkbotCount,
    automationCount,
  };
}

function productFromModule(
  mod: (typeof MODULES_CATALOG_DEMO.modules)[number],
  publishState: LicensorSuitePublishState,
  stripeProductId: string | null,
): LicensorSuiteProduct {
  const modules = processesForModule(mod.id);
  const counts = countComposition(modules);
  return {
    id: mod.id,
    name: mod.name,
    summary: mod.summary,
    publishState,
    stripeProductId,
    modules,
    ...counts,
  };
}

/** Licensor-managed suite products — seed catalogue for vendor builder. */
export const LICENSOR_SUITE_PRODUCTS: LicensorSuiteProduct[] = [
  productFromModule(MODULES_CATALOG_DEMO.modules.find((m) => m.id === "linksites")!, "published", "prod_linksites"),
  productFromModule(MODULES_CATALOG_DEMO.modules.find((m) => m.id === "linkapps")!, "published", "prod_linkapps"),
  productFromModule(
    MODULES_CATALOG_DEMO.modules.find((m) => m.id === "lexos-litigation")!,
    "ready",
    "prod_lexos_litigation",
  ),
  {
    id: "venture-media",
    name: "Venture Media",
    summary: "Content and campaign operations for media studios — in progress.",
    publishState: "draft",
    stripeProductId: null,
    modules: [],
    moduleCount: 0,
    phaseCount: 0,
    issueCount: 0,
    linkbotCount: 0,
    automationCount: 0,
  },
];

export function withCompositionCounts(
  base: Omit<LicensorSuiteProduct, "moduleCount" | "phaseCount" | "issueCount" | "linkbotCount" | "automationCount">,
): LicensorSuiteProduct {
  return { ...base, ...countComposition(base.modules) };
}

export function resolveLicensorSuiteProduct(suiteId: string): LicensorSuiteProduct | undefined {
  return LICENSOR_SUITE_PRODUCTS.find((row) => row.id === suiteId);
}

export function licensorSuitePublishLabel(state: LicensorSuitePublishState): string {
  if (state === "draft") return "Draft";
  if (state === "ready") return "Ready";
  return "Published";
}

export function licensorSuitePublishTone(state: LicensorSuitePublishState): "neutral" | "warning" | "success" {
  if (state === "draft") return "neutral";
  if (state === "ready") return "warning";
  return "success";
}

export function suiteCompletenessChecklist(product: LicensorSuiteProduct): SuiteCompletenessChecklist {
  return {
    name: product.name.trim().length > 0,
    summary: product.summary.trim().length > 0,
    modules: product.moduleCount > 0,
    phases: product.phaseCount > 0,
    issues: product.issueCount > 0,
    linkbots: product.linkbotCount > 0,
    automations: product.automationCount > 0,
  };
}

export function suiteBuilderCompleteness(product: LicensorSuiteProduct): number {
  if (product.publishState === "published") return 100;
  const checks = Object.values(suiteCompletenessChecklist(product));
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export function canMarkSuiteReady(product: LicensorSuiteProduct): boolean {
  return product.publishState === "draft" && suiteBuilderCompleteness(product) >= 85;
}

export function canPublishSuite(product: LicensorSuiteProduct): boolean {
  return product.publishState === "ready" && product.stripeProductId != null;
}

function slugifyHandle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function humanizeWorkflowHandle(handle: string): string {
  const base = handle.split("/").pop() ?? handle;
  return base.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferRole(name: string): string {
  const normalized = name.trim();
  if (!normalized) return "Assignee";
  if (normalized.endsWith(" Scout")) return normalized;
  if (normalized.endsWith(" Strategist")) return normalized;
  if (normalized.endsWith(" Architect")) return normalized;
  return `${normalized} role`;
}

function automationHandle(name: string, issueId: string): string {
  const slug = slugifyHandle(name) || issueId;
  return `linkautowork/${slug}`;
}

export function extractSuiteLinkbots(product: LicensorSuiteProduct): LicensorSuiteLinkbotRow[] {
  const rows: LicensorSuiteLinkbotRow[] = [];
  for (const mod of product.modules) {
    for (const phase of mod.workflows) {
      for (const issue of phase.issues) {
        for (const ex of issue.executors) {
          if (ex.kind === "agent" || ex.kind === "hybrid") {
            const displayName = ex.kind === "hybrid" ? ex.name.split(/\s+\+\s+/)[0]?.trim() ?? ex.name : ex.name;
            rows.push({
              id: `${mod.id}:${phase.id}:${issue.id}:${slugifyHandle(displayName)}`,
              displayName,
              role: inferRole(displayName),
              moduleName: mod.name,
              phaseName: phase.name,
              issueTitle: issue.title,
            });
          }
        }
      }
    }
  }
  return rows;
}

export function extractSuiteAutomations(product: LicensorSuiteProduct): LicensorSuiteAutomationRow[] {
  const rows: LicensorSuiteAutomationRow[] = [];
  for (const mod of product.modules) {
    for (const phase of mod.workflows) {
      for (const issue of phase.issues) {
        for (const ex of issue.executors) {
          if (ex.kind === "automation") {
            const handle = automationHandle(ex.name, issue.id);
            rows.push({
              id: `${mod.id}:${phase.id}:${issue.id}:${slugifyHandle(ex.name)}`,
              title: humanizeWorkflowHandle(handle),
              handle,
              moduleName: mod.name,
              phaseName: phase.name,
              issueTitle: issue.title,
              description: ex.description ?? ex.name,
            });
          } else if (ex.kind === "hybrid") {
            const autoName = ex.name.split(/\s+\+\s+/).slice(1).join(" + ").trim() || ex.name;
            const handle = automationHandle(autoName, issue.id);
            rows.push({
              id: `${mod.id}:${phase.id}:${issue.id}:${slugifyHandle(autoName)}-auto`,
              title: humanizeWorkflowHandle(handle),
              handle,
              moduleName: mod.name,
              phaseName: phase.name,
              issueTitle: issue.title,
              description: ex.description ?? autoName,
            });
          }
        }
      }
    }
  }
  return rows;
}

function nextId(prefix: string, existing: string[]): string {
  let n = existing.length + 1;
  let candidate = `${prefix}-${n}`;
  while (existing.includes(candidate)) {
    n += 1;
    candidate = `${prefix}-${n}`;
  }
  return candidate;
}

function lastModule(modules: ModuleProcess[]): ModuleProcess | undefined {
  return modules.at(-1);
}

function lastPhase(mod: ModuleProcess) {
  return mod.workflows.at(-1);
}

function lastIssue(phase: ModuleProcess["workflows"][number]) {
  return phase.issues.at(-1);
}

export type SuiteCompositionAction =
  | { type: "add_module" }
  | { type: "add_phase" }
  | { type: "add_issue" }
  | { type: "add_linkbot" }
  | { type: "add_automation" };

export type SuiteCompositionResult = { ok: true; modules: ModuleProcess[] } | { ok: false; reason: string };

export function applySuiteCompositionAction(
  modules: ModuleProcess[],
  action: SuiteCompositionAction,
): SuiteCompositionResult {
  const next = structuredClone(modules);

  if (action.type === "add_module") {
    const moduleIds = next.map((m) => m.id);
    const id = nextId("module", moduleIds);
    next.push({
      id,
      name: `Module ${next.length + 1}`,
      moduleId: id,
      published: false,
      summary: "New vendor module recipe.",
      rerunsAutomatically: false,
      workflows: [],
    });
    return { ok: true, modules: next };
  }

  const mod = lastModule(next);
  if (!mod) {
    return { ok: false, reason: "Add a module before adding phases, issues, or assignees." };
  }

  if (action.type === "add_phase") {
    const phaseIds = mod.workflows.map((w) => w.id);
    const id = nextId("phase", phaseIds);
    mod.workflows.push({
      id,
      name: `Phase ${mod.workflows.length + 1}`,
      stage: `stage.${id}`,
      summary: "New phase grouping for issues.",
      issues: [],
    });
    return { ok: true, modules: next };
  }

  const phase = lastPhase(mod);
  if (!phase) {
    return { ok: false, reason: "Add a phase before adding issues or assignees." };
  }

  if (action.type === "add_issue") {
    const issueIds = phase.issues.map((i) => i.id);
    const id = nextId("issue", issueIds);
    const issue: ModuleIssueTemplate = {
      id,
      title: `Issue ${phase.issues.length + 1}`,
      description: "Governed issue with input and output contracts.",
      inputContract: "Issue input contract",
      outputContract: "Issue output contract",
      executors: [],
    };
    phase.issues.push(issue);
    return { ok: true, modules: next };
  }

  const issue = lastIssue(phase);
  if (!issue) {
    return { ok: false, reason: "Add an issue before assigning LiNKbots or automations." };
  }

  if (action.type === "add_linkbot") {
    const count = issue.executors.filter((e) => e.kind === "agent" || e.kind === "hybrid").length;
    issue.executors.push({
      kind: "agent",
      name: `LiNKbot ${count + 1}`,
      description: "Judgment work under governed LiNKbot sessions.",
    });
    return { ok: true, modules: next };
  }

  if (action.type === "add_automation") {
    const count = issue.executors.filter((e) => e.kind === "automation" || e.kind === "hybrid").length;
    issue.executors.push({
      kind: "automation",
      name: `Automation ${count + 1}`,
      description: "Deterministic LiNKautowork workflow step.",
    });
    return { ok: true, modules: next };
  }

  return { ok: false, reason: "Unknown composition action." };
}
