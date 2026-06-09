import { describe, expect, it } from "vitest";

import type { ModuleProcess } from "@/lib/ui-mocks/modules-catalog-demo";

import {
  applySuiteCompositionAction,
  extractSuiteAutomations,
  extractSuiteLinkbots,
  suiteBuilderCompleteness,
  withCompositionCounts,
} from "./licensor-suite-catalog";

describe("licensor suite catalog", () => {
  it("adds module through issue and assignee composition chain", () => {
    let modules: ModuleProcess[] = [];
    const steps = ["add_module", "add_phase", "add_issue", "add_linkbot", "add_automation"] as const;
    for (const type of steps) {
      const result = applySuiteCompositionAction(modules, { type });
      expect(result.ok).toBe(true);
      if (result.ok) modules = result.modules;
    }
    const product = withCompositionCounts({
      id: "test",
      name: "Test Suite",
      summary: "Summary",
      publishState: "draft",
      stripeProductId: null,
      modules,
    });
    expect(product.moduleCount).toBe(1);
    expect(product.phaseCount).toBe(1);
    expect(product.issueCount).toBe(1);
    expect(product.linkbotCount).toBe(1);
    expect(product.automationCount).toBe(1);
    expect(extractSuiteLinkbots(product)).toHaveLength(1);
    expect(extractSuiteAutomations(product)).toHaveLength(1);
    expect(suiteBuilderCompleteness(product)).toBeGreaterThanOrEqual(85);
  });

  it("blocks phase add when no module exists", () => {
    const result = applySuiteCompositionAction([], { type: "add_phase" });
    expect(result.ok).toBe(false);
  });
});
