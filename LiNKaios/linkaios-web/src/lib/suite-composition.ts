import type {
  IssueDependency,
  IssueDependencyType,
  ModuleIssueTemplate,
  ModulePhaseTemplate,
  ModuleProcess,
  PhaseConcurrency,
} from "@/lib/ui-mocks/modules-catalog-demo";

export type SuiteEntityKind = "module" | "phase" | "issue";

export type SuiteModuleUpsert = {
  kind: "module";
  id?: string;
  name: string;
  summary: string;
  inputContract?: string;
  outputContract?: string;
  dependsOnModuleIds?: string[];
  rerunsAutomatically?: boolean;
};

export type SuitePhaseUpsert = {
  kind: "phase";
  id?: string;
  moduleId: string;
  name: string;
  summary: string;
  stage?: string;
  inputContract?: string;
  outputContract?: string;
  concurrency?: PhaseConcurrency;
  dependsOnPhaseIds?: string[];
};

export type SuiteIssueUpsert = {
  kind: "issue";
  id?: string;
  moduleId: string;
  phaseId: string;
  title: string;
  description?: string;
  inputContract: string;
  outputContract: string;
  dependencies?: IssueDependency[];
  instructionMd?: string;
  instructionMdFileName?: string;
};

export type SuiteLinkbotUpsert = {
  kind: "linkbot";
  moduleId: string;
  phaseId: string;
  issueId: string;
  displayName: string;
  roleId: string;
  description?: string;
};

export type SuiteAutomationUpsert = {
  kind: "automation";
  moduleId: string;
  phaseId: string;
  issueId: string;
  title: string;
  handle: string;
  description?: string;
  automationJson?: Record<string, unknown>;
};

export type SuiteCompositionUpsert =
  | SuiteModuleUpsert
  | SuitePhaseUpsert
  | SuiteIssueUpsert
  | SuiteLinkbotUpsert
  | SuiteAutomationUpsert;

export type SuiteCompositionUpsertResult =
  | { ok: true; modules: ModuleProcess[] }
  | { ok: false; reason: string };

function nextId(prefix: string, existing: string[]): string {
  let n = existing.length + 1;
  let candidate = `${prefix}-${n}`;
  while (existing.includes(candidate)) {
    n += 1;
    candidate = `${prefix}-${n}`;
  }
  return candidate;
}

function slugifyStage(name: string, fallbackId: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");
  return slug.length > 0 ? `stage.${slug}` : `stage.${fallbackId}`;
}

function findModule(modules: ModuleProcess[], moduleId: string): ModuleProcess | undefined {
  return modules.find((m) => m.id === moduleId);
}

function findPhase(mod: ModuleProcess, phaseId: string): ModulePhaseTemplate | undefined {
  return mod.workflows.find((w) => w.id === phaseId);
}

function findIssue(phase: ModulePhaseTemplate, issueId: string): ModuleIssueTemplate | undefined {
  return phase.issues.find((i) => i.id === issueId);
}

/** Flat list of issues for dependency parent pickers. */
export function listSuiteIssues(modules: ModuleProcess[]): {
  id: string;
  title: string;
  moduleName: string;
  phaseName: string;
}[] {
  const rows: { id: string; title: string; moduleName: string; phaseName: string }[] = [];
  for (const mod of modules) {
    for (const phase of mod.workflows) {
      for (const issue of phase.issues) {
        rows.push({
          id: issue.id,
          title: issue.title,
          moduleName: mod.name,
          phaseName: phase.name,
        });
      }
    }
  }
  return rows;
}

export function listSuitePhases(modules: ModuleProcess[]): {
  id: string;
  name: string;
  moduleId: string;
  moduleName: string;
}[] {
  const rows: { id: string; name: string; moduleId: string; moduleName: string }[] = [];
  for (const mod of modules) {
    for (const phase of mod.workflows) {
      rows.push({ id: phase.id, name: phase.name, moduleId: mod.id, moduleName: mod.name });
    }
  }
  return rows;
}

export function listSuiteModules(modules: ModuleProcess[]): { id: string; name: string }[] {
  return modules.map((m) => ({ id: m.id, name: m.name }));
}

export function issueHasComposition(issue: ModuleIssueTemplate): boolean {
  return (
    issue.inputContract.trim().length > 0 &&
    issue.outputContract.trim().length > 0
  );
}

export function suiteCompositionReady(modules: ModuleProcess[]): boolean {
  let issueCount = 0;
  let composedCount = 0;
  for (const mod of modules) {
    for (const phase of mod.workflows) {
      for (const issue of phase.issues) {
        issueCount += 1;
        if (issueHasComposition(issue)) composedCount += 1;
      }
    }
  }
  return issueCount === 0 || composedCount === issueCount;
}

export function applySuiteCompositionUpsert(
  modules: ModuleProcess[],
  upsert: SuiteCompositionUpsert,
): SuiteCompositionUpsertResult {
  const next = structuredClone(modules);

  if (upsert.kind === "module") {
    const existing = upsert.id ? findModule(next, upsert.id) : undefined;
    if (existing) {
      existing.name = upsert.name.trim();
      existing.summary = upsert.summary.trim();
      existing.inputContract = upsert.inputContract?.trim() || undefined;
      existing.outputContract = upsert.outputContract?.trim() || undefined;
      existing.dependsOnModuleIds = upsert.dependsOnModuleIds?.filter(Boolean);
      if (upsert.rerunsAutomatically !== undefined) {
        existing.rerunsAutomatically = upsert.rerunsAutomatically;
      }
      return { ok: true, modules: next };
    }
    const id = nextId("module", next.map((m) => m.id));
    next.push({
      id,
      name: upsert.name.trim() || `Module ${next.length + 1}`,
      moduleId: id,
      published: false,
      summary: upsert.summary.trim() || "New vendor module recipe.",
      rerunsAutomatically: upsert.rerunsAutomatically ?? false,
      inputContract: upsert.inputContract?.trim() || undefined,
      outputContract: upsert.outputContract?.trim() || undefined,
      dependsOnModuleIds: upsert.dependsOnModuleIds?.filter(Boolean),
      workflows: [],
    });
    return { ok: true, modules: next };
  }

  if (upsert.kind === "phase") {
    const mod = findModule(next, upsert.moduleId);
    if (!mod) return { ok: false, reason: "Select a parent module for this phase." };
    const existing = upsert.id ? findPhase(mod, upsert.id) : undefined;
    if (existing) {
      existing.name = upsert.name.trim();
      existing.summary = upsert.summary.trim();
      existing.stage = upsert.stage?.trim() || slugifyStage(existing.name, existing.id);
      existing.inputContract = upsert.inputContract?.trim() || undefined;
      existing.outputContract = upsert.outputContract?.trim() || undefined;
      existing.concurrency = upsert.concurrency ?? existing.concurrency ?? "sequential";
      existing.dependsOnPhaseIds = upsert.dependsOnPhaseIds?.filter(Boolean);
      return { ok: true, modules: next };
    }
    const phaseIds = mod.workflows.map((w) => w.id);
    const id = nextId("phase", phaseIds);
    mod.workflows.push({
      id,
      name: upsert.name.trim() || `Phase ${mod.workflows.length + 1}`,
      stage: upsert.stage?.trim() || slugifyStage(upsert.name, id),
      summary: upsert.summary.trim() || "New phase grouping for issues.",
      inputContract: upsert.inputContract?.trim() || undefined,
      outputContract: upsert.outputContract?.trim() || undefined,
      concurrency: upsert.concurrency ?? "sequential",
      dependsOnPhaseIds: upsert.dependsOnPhaseIds?.filter(Boolean),
      issues: [],
    });
    return { ok: true, modules: next };
  }

  if (upsert.kind === "issue") {
    const mod = findModule(next, upsert.moduleId);
    if (!mod) return { ok: false, reason: "Select a parent module for this issue." };
    const phase = findPhase(mod, upsert.phaseId);
    if (!phase) return { ok: false, reason: "Select a parent phase for this issue." };
    const existing = upsert.id ? findIssue(phase, upsert.id) : undefined;
    if (existing) {
      existing.title = upsert.title.trim();
      existing.description = upsert.description?.trim();
      existing.inputContract = upsert.inputContract.trim();
      existing.outputContract = upsert.outputContract.trim();
      existing.dependencies = upsert.dependencies?.filter((d) => d.dependsOnIssueId) ?? [];
      existing.instructionMd = upsert.instructionMd;
      existing.instructionMdFileName = upsert.instructionMdFileName;
      return { ok: true, modules: next };
    }
    const issueIds = phase.issues.map((i) => i.id);
    const id = nextId("issue", issueIds);
    phase.issues.push({
      id,
      title: upsert.title.trim() || `Issue ${phase.issues.length + 1}`,
      description: upsert.description?.trim() ?? "Governed issue with input and output contracts.",
      inputContract: upsert.inputContract.trim() || "Issue input contract",
      outputContract: upsert.outputContract.trim() || "Issue output contract",
      dependencies: upsert.dependencies?.filter((d) => d.dependsOnIssueId) ?? [],
      instructionMd: upsert.instructionMd,
      instructionMdFileName: upsert.instructionMdFileName,
      executors: [],
    });
    return { ok: true, modules: next };
  }

  if (upsert.kind === "linkbot") {
    const mod = findModule(next, upsert.moduleId);
    if (!mod) return { ok: false, reason: "Select a target issue module." };
    const phase = findPhase(mod, upsert.phaseId);
    if (!phase) return { ok: false, reason: "Select a target issue phase." };
    const issue = findIssue(phase, upsert.issueId);
    if (!issue) return { ok: false, reason: "Select a target issue for this LiNKbot." };
    const displayName = upsert.displayName.trim();
    if (!displayName) return { ok: false, reason: "LiNKbot display name is required." };
    issue.executors.push({
      kind: "agent",
      name: displayName,
      description: upsert.description?.trim() ?? "Judgment work under governed LiNKbot sessions.",
      roleId: upsert.roleId,
    });
    return { ok: true, modules: next };
  }

  if (upsert.kind === "automation") {
    const mod = findModule(next, upsert.moduleId);
    if (!mod) return { ok: false, reason: "Select a target issue module." };
    const phase = findPhase(mod, upsert.phaseId);
    if (!phase) return { ok: false, reason: "Select a target issue phase." };
    const issue = findIssue(phase, upsert.issueId);
    if (!issue) return { ok: false, reason: "Select a target issue for this automation." };
    const title = upsert.title.trim();
    const handle = upsert.handle.trim();
    if (!title || !handle) return { ok: false, reason: "Automation title and workflow handle are required." };
    issue.executors.push({
      kind: "automation",
      name: title,
      description: upsert.description?.trim() ?? "Deterministic LiNKautowork workflow step.",
      automationJson: upsert.automationJson,
    });
    return { ok: true, modules: next };
  }

  return { ok: false, reason: "Unknown composition upsert." };
}

export const ISSUE_DEPENDENCY_TYPE_LABELS: Record<IssueDependencyType, string> = {
  blocked_by: "Blocked by",
  can_run_after: "Can run after",
  must_finish_before: "Must finish before",
  can_run_in_parallel_with: "Can run in parallel with",
};

export const PHASE_CONCURRENCY_LABELS: Record<PhaseConcurrency, string> = {
  sequential: "Sequential — issues run in order",
  parallel: "Parallel — issues may run concurrently",
};

/** Preset LiNKbot role profiles for suite composition (vendor catalogue). */
export const SUITE_LINKBOT_ROLE_PRESETS: { roleId: string; label: string; description: string }[] = [
  { roleId: "lead_scout_bot", label: "Lead Scout", description: "Lead discovery and first-pass qualification." },
  { roleId: "research_enrichment_bot", label: "Research Enrichment", description: "Research and provenance-backed enrichment." },
  { roleId: "website_builder_bot", label: "Website Builder", description: "Template-guided website package generation." },
  { roleId: "outreach_bot", label: "Outreach", description: "Governed draft-only outreach." },
  { roleId: "product_steward_linkbot", label: "Product Steward", description: "Product run stewardship and triage." },
  { roleId: "suite_orchestrator_linkbot", label: "Suite Orchestrator", description: "Cross-phase orchestration and dispatch." },
];
