import { describe, expect, it } from "vitest";

import {
  getDeclaredToolsFromSkill,
  getSkillWideDefaultDeclaredTools,
  normalizeDeclaredToolNames,
  validateDeclaredToolsForDraftSave,
  validateDeclaredToolsForSkillApprove,
} from "./declared-tools.js";
import type { SkillRecord, ToolRecord } from "@linktrend/shared-types";

describe("normalizeDeclaredToolNames", () => {
  it("dedupes and lowercases", () => {
    expect(normalizeDeclaredToolNames(["Read", " read ", "write"])).toEqual(["read", "write"]);
  });
});

describe("getDeclaredToolsFromSkill", () => {
  it("prefers default_declared_tools column", () => {
    const s = {
      id: "1",
      name: "x",
      version: 1,
      status: "approved",
      body_markdown: "",
      metadata: { declared_tools: ["legacy"] },
      created_at: "",
      updated_at: "",
      default_declared_tools: ["Alpha"],
    } as SkillRecord;
    expect(getDeclaredToolsFromSkill(s)).toEqual(["alpha"]);
  });

  it("getSkillWideDefaultDeclaredTools ignores step_recipe", () => {
    const s = {
      id: "1",
      name: "x",
      version: 1,
      status: "draft",
      body_markdown: "",
      metadata: {},
      created_at: "",
      updated_at: "",
      default_declared_tools: ["read"],
      skill_mode: "stepped" as const,
      step_recipe: [{ ordinal: 1, declared_tools: ["write"] }],
    } as SkillRecord;
    expect(getSkillWideDefaultDeclaredTools(s)).toEqual(["read"]);
  });

  it("unions stepped step declared_tools with skill defaults", () => {
    const s = {
      id: "1",
      name: "x",
      version: 1,
      status: "draft",
      body_markdown: "",
      metadata: {},
      created_at: "",
      updated_at: "",
      default_declared_tools: ["read"],
      skill_mode: "stepped" as const,
      step_recipe: [{ ordinal: 1, declared_tools: ["write"] }, { ordinal: 2, title: "noop" }],
    } as SkillRecord;
    expect(getDeclaredToolsFromSkill(s).sort()).toEqual(["read", "write"]);
  });
});

describe("validateDeclaredToolsForSkillApprove", () => {
  const mkTool = (name: string): ToolRecord =>
    ({
      id: "t",
      name,
      version: 1,
      status: "approved",
      tool_type: "http",
      category: "c",
      description: "d",
      implementation: {},
      metadata: {},
      created_at: "",
      updated_at: "",
    }) as ToolRecord;

  it("allows empty declared with empty org set", () => {
    const map = new Map<string, ToolRecord>();
    const r = validateDeclaredToolsForSkillApprove([], map, new Set());
    expect(r.ok).toBe(true);
  });

  it("rejects when org allowlist empty but skill declares tools", () => {
    const map = new Map([["a", mkTool("a")]]);
    const r = validateDeclaredToolsForSkillApprove(["a"], map, new Set());
    expect(r.ok).toBe(false);
  });

  it("passes when declared subset of org", () => {
    const map = new Map([["a", mkTool("a")]]);
    const r = validateDeclaredToolsForSkillApprove(["a"], map, new Set(["a"]));
    expect(r.ok).toBe(true);
  });
});

describe("validateDeclaredToolsForDraftSave", () => {
  it("rejects unknown catalog names", () => {
    const map = new Map<string, ToolRecord>();
    const r = validateDeclaredToolsForDraftSave(["nope"], map);
    expect(r.ok).toBe(false);
  });
});
