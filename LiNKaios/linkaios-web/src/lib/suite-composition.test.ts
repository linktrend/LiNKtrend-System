import { describe, expect, it } from "vitest";

import type { ModuleProcess } from "@/lib/ui-mocks/modules-catalog-demo";

import {
  applySuiteCompositionUpsert,
  issueHasComposition,
  suiteCompositionReady,
} from "./suite-composition";

describe("suite composition", () => {
  it("upserts module, phase, and issue with contracts and dependencies", () => {
    let modules: ModuleProcess[] = [];

    const modResult = applySuiteCompositionUpsert(modules, {
      kind: "module",
      name: "Lead to site",
      summary: "MVO module",
      inputContract: "Tenant lease",
      outputContract: "Published preview URL",
    });
    expect(modResult.ok).toBe(true);
    if (!modResult.ok) return;
    modules = modResult.modules;

    const phaseResult = applySuiteCompositionUpsert(modules, {
      kind: "phase",
      moduleId: modules[0]!.id,
      name: "Intake",
      summary: "Lead intake phase",
      concurrency: "sequential",
    });
    expect(phaseResult.ok).toBe(true);
    if (!phaseResult.ok) return;
    modules = phaseResult.modules;

    const issueAResult = applySuiteCompositionUpsert(modules, {
      kind: "issue",
      moduleId: modules[0]!.id,
      phaseId: modules[0]!.workflows[0]!.id,
      title: "Import lead",
      inputContract: "Lead CSV",
      outputContract: "Normalized lead record",
    });
    expect(issueAResult.ok).toBe(true);
    if (!issueAResult.ok) return;
    modules = issueAResult.modules;

    const issueAId = modules[0]!.workflows[0]!.issues[0]!.id;

    const issueBResult = applySuiteCompositionUpsert(modules, {
      kind: "issue",
      moduleId: modules[0]!.id,
      phaseId: modules[0]!.workflows[0]!.id,
      title: "Qualify lead",
      inputContract: "Normalized lead record",
      outputContract: "Qualification verdict",
      dependencies: [{ dependsOnIssueId: issueAId, dependencyType: "blocked_by" }],
    });
    expect(issueBResult.ok).toBe(true);
    if (!issueBResult.ok) return;
    modules = issueBResult.modules;

    const issueB = modules[0]!.workflows[0]!.issues[1]!;
    expect(issueB.dependencies).toHaveLength(1);
    expect(suiteCompositionReady(modules)).toBe(true);
    expect(issueHasComposition(issueB)).toBe(true);
  });

  it("edits an existing issue in place", () => {
    let modules: ModuleProcess[] = [];
    const chain = [
      { kind: "module" as const, name: "Mod", summary: "S" },
      {
        kind: "phase" as const,
        moduleId: "",
        name: "Phase",
        summary: "P",
      },
      {
        kind: "issue" as const,
        moduleId: "",
        phaseId: "",
        title: "Issue 1",
        inputContract: "in",
        outputContract: "out",
      },
    ];

    for (const step of chain) {
      if (step.kind === "phase") step.moduleId = modules[0]!.id;
      if (step.kind === "issue") {
        step.moduleId = modules[0]!.id;
        step.phaseId = modules[0]!.workflows[0]!.id;
      }
      const result = applySuiteCompositionUpsert(modules, step);
      expect(result.ok).toBe(true);
      if (result.ok) modules = result.modules;
    }

    const issueId = modules[0]!.workflows[0]!.issues[0]!.id;
    const editResult = applySuiteCompositionUpsert(modules, {
      kind: "issue",
      id: issueId,
      moduleId: modules[0]!.id,
      phaseId: modules[0]!.workflows[0]!.id,
      title: "Issue 1 updated",
      inputContract: "new input",
      outputContract: "new output",
    });
    expect(editResult.ok).toBe(true);
    if (!editResult.ok) return;
    expect(editResult.modules[0]!.workflows[0]!.issues[0]!.title).toBe("Issue 1 updated");
  });

  it("binds linkbot and automation to a target issue", () => {
    let modules: ModuleProcess[] = [];
    for (const step of [
      { kind: "module" as const, name: "M", summary: "S" },
    ]) {
      const result = applySuiteCompositionUpsert(modules, step);
      if (result.ok) modules = result.modules;
    }
    const modId = modules[0]!.id;
    const phaseResult = applySuiteCompositionUpsert(modules, {
      kind: "phase",
      moduleId: modId,
      name: "P",
      summary: "phase",
    });
    if (phaseResult.ok) modules = phaseResult.modules;
    const phaseId = modules[0]!.workflows[0]!.id;
    const issueResult = applySuiteCompositionUpsert(modules, {
      kind: "issue",
      moduleId: modId,
      phaseId,
      title: "Work",
      inputContract: "in",
      outputContract: "out",
    });
    if (issueResult.ok) modules = issueResult.modules;
    const issueId = modules[0]!.workflows[0]!.issues[0]!.id;

    const botResult = applySuiteCompositionUpsert(modules, {
      kind: "linkbot",
      moduleId: modId,
      phaseId,
      issueId,
      displayName: "Website Scout",
      roleId: "website_builder_bot",
    });
    expect(botResult.ok).toBe(true);
    if (botResult.ok) modules = botResult.modules;

    const autoResult = applySuiteCompositionUpsert(modules, {
      kind: "automation",
      moduleId: modId,
      phaseId,
      issueId,
      title: "Publish",
      handle: "autowork.linksites.publish",
    });
    expect(autoResult.ok).toBe(true);
    if (autoResult.ok) {
      const executors = autoResult.modules[0]!.workflows[0]!.issues[0]!.executors;
      expect(executors.some((e) => e.kind === "agent")).toBe(true);
      expect(executors.some((e) => e.kind === "automation")).toBe(true);
    }
  });
});
