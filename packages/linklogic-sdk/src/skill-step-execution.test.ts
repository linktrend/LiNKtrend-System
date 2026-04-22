import { describe, expect, it } from "vitest";

import type { SkillRecord } from "@linktrend/shared-types";

import {
  buildResolvedStepExecution,
  effectiveDeclaredToolsForStep,
  parseStepRecipeEntries,
} from "./skill-step-execution.js";

const baseSkill = (): SkillRecord =>
  ({
    id: "sk1",
    name: "demo",
    version: 1,
    status: "draft",
    body_markdown: "",
    metadata: {},
    created_at: "",
    updated_at: "",
    default_declared_tools: ["read"],
    default_model: "gemini-flash",
    skill_mode: "stepped",
    step_recipe: [
      {
        ordinal: 1,
        title: "A",
        declared_tools: ["write"],
        script_ids: ["s1"],
        reference_ids: ["r1"],
        asset_ids: ["a1"],
      },
    ],
  }) as SkillRecord;

describe("parseStepRecipeEntries", () => {
  it("parses reference_pointers alias", () => {
    const steps = parseStepRecipeEntries([{ ordinal: 2, reference_pointers: ["x", "y"] }]);
    expect(steps[0].ordinal).toBe(2);
    expect(steps[0].reference_ids).toEqual(["x", "y"]);
  });
});

describe("effectiveDeclaredToolsForStep", () => {
  it("unions defaults with step declared_tools", () => {
    const skill = baseSkill();
    const step = parseStepRecipeEntries(skill.step_recipe)[0];
    expect(effectiveDeclaredToolsForStep(skill, step).sort()).toEqual(["read", "write"]);
  });
});

describe("buildResolvedStepExecution", () => {
  it("filters scripts when script_ids set", () => {
    const skill = baseSkill();
    const scripts = [
      { id: "s1", filename: "a.sh", content: "a" },
      { id: "s2", filename: "b.sh", content: "b" },
    ];
    const refs = [
      { id: "r0", label: "wide", kind: "brain_path", target: "/", step_ordinal: null, extra: {} },
      { id: "r1", label: "step", kind: "brain_path", target: "/x", step_ordinal: 2, extra: {} },
    ];
    const assets = [
      { id: "a0", name: "all", storage_uri: "", byte_size: null, step_ordinal: null },
      { id: "a1", name: "one", storage_uri: "s3://", byte_size: 1, step_ordinal: 1 },
    ];
    const out = buildResolvedStepExecution({ skill, scripts, references: refs, assets });
    expect(out).not.toBeNull();
    expect(out![0].scripts.map((s) => s.id)).toEqual(["s1"]);
    expect(out![0].references.map((r) => r.id).sort()).toEqual(["r0", "r1"].sort());
    expect(out![0].assets.map((a) => a.id).sort()).toEqual(["a0", "a1"].sort());
  });

  it("returns null for simple skills", () => {
    const skill = { ...baseSkill(), skill_mode: "simple" } as SkillRecord;
    const out = buildResolvedStepExecution({
      skill,
      scripts: [],
      references: [],
      assets: [],
    });
    expect(out).toBeNull();
  });
});
