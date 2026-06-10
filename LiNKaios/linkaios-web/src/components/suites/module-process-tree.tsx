"use client";

import { useState, type ReactNode } from "react";

import { ChevronDown, ChevronRight } from "lucide-react";

import { SuiteBuilderEditButton } from "@/components/admin/suite-builder-modals";
import { ISSUE_DEPENDENCY_TYPE_LABELS } from "@/lib/suite-composition";
import type { ModuleProcessTreeVariant } from "@/lib/suites-page-copy";
import type { ModuleProcess, ModuleWorkflow, ModuleIssueTemplate } from "@/lib/ui-mocks/modules-catalog-demo";

type TreeLevel = "Module" | "Phase" | "Issue" | "Assignee";

type AssigneeLine = { role: "linkbot" | "automation" | "human"; name: string; description: string };

/** Shared column split so detail blocks align across sibling issues and assignees. */
const ISSUE_ROW_GRID =
  "grid min-h-[5rem] w-full grid-cols-[42%_minmax(0,1fr)] items-stretch gap-x-3 py-2";

function LevelLabel(props: { level: TreeLevel }) {
  const tone: Record<TreeLevel, string> = {
    Module: "bg-violet-100 text-violet-900 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-100 dark:ring-violet-800",
    Phase: "bg-sky-100 text-sky-900 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-100 dark:ring-sky-800",
    Issue: "bg-amber-100 text-amber-900 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-800",
    Assignee: "bg-emerald-100 text-emerald-900 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-800",
  };

  return (
    <span
      className={`inline-flex shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${tone[props.level]}`}
    >
      {props.level}
    </span>
  );
}

function assigneeLines(executors: ModuleIssueTemplate["executors"]): AssigneeLine[] {
  const lines: AssigneeLine[] = [];

  for (const ex of executors) {
    const description = ex.description ?? ex.name;

    if (ex.kind === "agent") {
      lines.push({ role: "linkbot", name: ex.name, description });
    } else if (ex.kind === "automation") {
      lines.push({ role: "automation", name: ex.name, description });
    } else if (ex.kind === "hybrid") {
      const parts = ex.name.split(/\s+\+\s+/);
      if (parts.length >= 2) {
        lines.push({
          role: "linkbot",
          name: parts[0]!.trim(),
          description: `${description} — judgment and orchestration`,
        });
        lines.push({
          role: "automation",
          name: parts.slice(1).join(" + ").trim(),
          description: `${description} — deterministic automation steps`,
        });
      } else {
        lines.push({
          role: "linkbot",
          name: ex.name,
          description: `${description} — judgment and orchestration`,
        });
        lines.push({
          role: "automation",
          name: ex.name,
          description: `${description} — deterministic automation steps`,
        });
      }
    }
  }

  return lines;
}

function assigneeSurfaceLabel(role: AssigneeLine["role"]): string {
  if (role === "linkbot") return "LiNKbot session";
  if (role === "automation") return "LiNKautowork automation";
  return "Human approval surface";
}

function assigneeRoleLabel(role: AssigneeLine["role"]): string {
  if (role === "linkbot") return "LiNKbot";
  if (role === "automation") return "Automation";
  return "Human";
}

function AssigneeBlock(props: { executors: ModuleIssueTemplate["executors"] }) {
  const lines = assigneeLines(props.executors);

  return (
    <div className="ml-6 border-l border-emerald-200/80 pl-3 dark:border-emerald-900/50">
      {lines.length > 0 ? (
        <ul className="mb-2 space-y-2 pb-2">
          {lines.map((line, index) => (
            <li key={`${line.role}-${index}`}>
              <div className={ISSUE_ROW_GRID}>
                <div className="flex min-w-0 flex-col">
                  <span className="flex min-h-5 min-w-0 items-center gap-2">
                    <LevelLabel level="Assignee" />
                    <span className="min-w-0 truncate text-sm font-semibold leading-5 text-zinc-900 dark:text-zinc-100">
                      {assigneeRoleLabel(line.role)}
                    </span>
                  </span>
                  <p className="mt-1 line-clamp-3 min-h-[3rem] text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
                    {line.description}
                  </p>
                </div>
                <div className="flex h-full min-w-0 flex-col border-l border-zinc-200 pl-3 dark:border-zinc-700">
                  <div className="min-h-5 shrink-0" aria-hidden />
                  <div className="mt-1 min-h-[3rem] space-y-1 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
                    <p className="line-clamp-2">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Runner:</span> {line.name}
                    </p>
                    <p className="line-clamp-2">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Surface:</span>{" "}
                      {assigneeSurfaceLabel(line.role)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-2 pb-2 text-sm text-zinc-500 dark:text-zinc-400">
          No assignee bound — this issue is human-only in the fixture.
        </p>
      )}
    </div>
  );
}

function dependencySummary(issue: ModuleIssueTemplate, processes: ModuleProcess[]): string | null {
  const deps = issue.dependencies ?? [];
  if (deps.length === 0) return null;
  const issueIndex = new Map<string, string>();
  for (const mod of processes) {
    for (const phase of mod.workflows) {
      for (const row of phase.issues) {
        issueIndex.set(row.id, row.title);
      }
    }
  }
  return deps
    .map((d) => `${ISSUE_DEPENDENCY_TYPE_LABELS[d.dependencyType]} ${issueIndex.get(d.dependsOnIssueId) ?? d.dependsOnIssueId}`)
    .join("; ");
}

function IssueRow(props: {
  issue: ModuleIssueTemplate;
  processes: ModuleProcess[];
  editable?: boolean;
  onEditIssue?: (issue: ModuleIssueTemplate, moduleId: string, phaseId: string) => void;
  moduleId: string;
  phaseId: string;
}) {
  const [open, setOpen] = useState(false);
  const depLine = dependencySummary(props.issue, props.processes);

  return (
    <div className="ml-6 border-l border-amber-200/80 pl-3 dark:border-amber-900/40">
      <div className={ISSUE_ROW_GRID}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-full min-w-0 items-start gap-2 text-left"
        >
          {open ? (
            <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
          ) : (
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
          )}
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="flex min-h-5 min-w-0 items-center gap-2">
              <LevelLabel level="Issue" />
              <span className="min-w-0 truncate text-sm font-semibold leading-5 text-zinc-900 dark:text-zinc-100">
                {props.issue.title}
              </span>
              {props.editable && props.onEditIssue ? (
                <SuiteBuilderEditButton
                  label={`Edit ${props.issue.title}`}
                  onClick={() => props.onEditIssue?.(props.issue, props.moduleId, props.phaseId)}
                />
              ) : null}
            </span>
            <p className="mt-1 line-clamp-3 min-h-[3rem] text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
              {props.issue.description ?? "Governed task template with input/output contracts"}
            </p>
          </span>
        </button>
        <div className="flex h-full min-w-0 flex-col border-l border-zinc-200 pl-3 dark:border-zinc-700">
          <div className="min-h-5 shrink-0" aria-hidden />
          <div className="mt-1 min-h-[3rem] space-y-1 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
            <p className="line-clamp-2">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Input:</span> {props.issue.inputContract}
            </p>
            <p className="line-clamp-2">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Output:</span> {props.issue.outputContract}
            </p>
            {depLine ? (
              <p className="line-clamp-2">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Deps:</span> {depLine}
              </p>
            ) : null}
            {props.issue.instructionMdFileName ? (
              <p className="line-clamp-1">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Guide:</span>{" "}
                {props.issue.instructionMdFileName}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      {open ? (
        <div className="pb-2">
          <AssigneeBlock executors={props.issue.executors} />
        </div>
      ) : null}
    </div>
  );
}

function PhaseRow(props: {
  workflow: ModuleWorkflow;
  processes: ModuleProcess[];
  moduleId: string;
  editable?: boolean;
  onEditPhase?: (phase: ModuleWorkflow, moduleId: string) => void;
  onEditIssue?: (issue: ModuleIssueTemplate, moduleId: string, phaseId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const concurrencyLabel =
    props.workflow.concurrency === "parallel" ? "Parallel lanes" : props.workflow.concurrency === "sequential" ? "Sequential" : null;

  return (
    <div className="ml-3 border-l border-sky-200/80 pl-3 dark:border-sky-900/40">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-start gap-2 py-2 text-left">
        {open ? (
          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-zinc-400" />
        ) : (
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-zinc-400" />
        )}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex min-h-5 min-w-0 flex-wrap items-center gap-2">
            <LevelLabel level="Phase" />
            <span className="text-sm font-semibold leading-5 text-zinc-900 dark:text-zinc-100">{props.workflow.name}</span>
            <span className="text-xs font-medium text-zinc-500">· {props.workflow.stage}</span>
            {concurrencyLabel ? (
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
                {concurrencyLabel}
              </span>
            ) : null}
            {props.editable && props.onEditPhase ? (
              <SuiteBuilderEditButton
                label={`Edit ${props.workflow.name}`}
                onClick={() => props.onEditPhase?.(props.workflow, props.moduleId)}
              />
            ) : null}
          </span>
          <p className="mt-1 line-clamp-3 min-h-[3rem] text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
            {props.workflow.summary}
            {props.workflow.inputContract || props.workflow.outputContract
              ? ` Contracts: ${props.workflow.inputContract ?? "—"} → ${props.workflow.outputContract ?? "—"}.`
              : " Stage group inside this module — contains one or more issues."}
          </p>
        </span>
      </button>
      {open ? (
        <div className="space-y-2 pb-2">
          {props.workflow.issues.map((issue) => (
            <IssueRow
              key={issue.id}
              issue={issue}
              processes={props.processes}
              moduleId={props.moduleId}
              phaseId={props.workflow.id}
              editable={props.editable}
              onEditIssue={props.onEditIssue}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function catalogueIntro(owned: boolean) {
  if (owned) {
    return (
      <>
        Vendor module catalogue — recipes you can include when creating a project. Hierarchy:{" "}
        <span className="font-medium text-zinc-800 dark:text-zinc-200">Module</span> →{" "}
        <span className="font-medium text-zinc-800 dark:text-zinc-200">Phase</span> →{" "}
        <span className="font-medium text-zinc-800 dark:text-zinc-200">Issue</span> →{" "}
        <span className="font-medium text-zinc-800 dark:text-zinc-200">Assignee</span> (LiNKbot, automation, or human).
      </>
    );
  }
  return (
    <>
      Published module catalogue — explore phases, issue templates, and assignee bindings before you subscribe. Hierarchy:{" "}
      <span className="font-medium text-zinc-800 dark:text-zinc-200">Module</span> →{" "}
      <span className="font-medium text-zinc-800 dark:text-zinc-200">Phase</span> →{" "}
      <span className="font-medium text-zinc-800 dark:text-zinc-200">Issue</span> →{" "}
      <span className="font-medium text-zinc-800 dark:text-zinc-200">Assignee</span>.
    </>
  );
}

function CatalogueModuleSection(props: {
  processes: ModuleProcess[];
  owned: boolean;
  editable?: boolean;
  onEditModule?: (module: ModuleProcess) => void;
  onEditPhase?: (phase: ModuleWorkflow, moduleId: string) => void;
  onEditIssue?: (issue: ModuleIssueTemplate, moduleId: string, phaseId: string) => void;
}) {
  const [openModuleId, setOpenModuleId] = useState<string | null>(props.processes[0]?.id ?? null);

  if (props.processes.length === 0) {
    return <p className="text-sm text-zinc-500">No modules published for this suite yet.</p>;
  }

  return (
    <section className="space-y-3" aria-label="Module catalogue">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{catalogueIntro(props.owned)}</p>
      {props.processes.map((process) => {
        const open = openModuleId === process.id;
        return (
          <article key={process.id} className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <button
              type="button"
              onClick={() => setOpenModuleId(open ? null : process.id)}
              className="flex w-full items-start gap-2 px-4 py-3 text-left"
            >
              {open ? (
                <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-zinc-400" />
              ) : (
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-zinc-400" />
              )}
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <LevelLabel level="Module" />
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{process.name}</span>
                  {props.editable && props.onEditModule ? (
                    <SuiteBuilderEditButton
                      label={`Edit ${process.name}`}
                      onClick={() => props.onEditModule?.(process)}
                    />
                  ) : null}
                  {process.rerunsAutomatically ? (
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
                      Continuous run
                    </span>
                  ) : null}
                </span>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{process.summary}</p>
                <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  Vendor-published module — select when adding a project to this suite
                </p>
              </span>
            </button>
            {open ? (
              <div className="space-y-2 border-t border-zinc-100 px-2 pb-3 pt-2 dark:border-zinc-800">
                {process.workflows.map((wf) => (
                  <PhaseRow
                    key={wf.id}
                    workflow={wf}
                    processes={props.processes}
                    moduleId={process.id}
                    editable={props.editable}
                    onEditPhase={props.onEditPhase}
                    onEditIssue={props.onEditIssue}
                  />
                ))}
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}

export function ModuleProcessTree(props: {
  processes: ModuleProcess[];
  variant?: ModuleProcessTreeVariant | "builder";
  onEditModule?: (module: ModuleProcess) => void;
  onEditPhase?: (phase: ModuleWorkflow, moduleId: string) => void;
  onEditIssue?: (issue: ModuleIssueTemplate, moduleId: string, phaseId: string) => void;
}) {
  const variant = props.variant ?? "catalogue";
  const owned = variant === "operational";
  const editable = variant === "builder";

  if (props.processes.length === 0) {
    return <p className="text-sm text-zinc-500">No modules published for this suite yet.</p>;
  }

  return (
    <CatalogueModuleSection
      processes={props.processes}
      owned={owned}
      editable={editable}
      onEditModule={props.onEditModule}
      onEditPhase={props.onEditPhase}
      onEditIssue={props.onEditIssue}
    />
  );
}
