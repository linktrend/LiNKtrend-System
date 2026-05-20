import { describe, expect, it } from "vitest";

import { buildSkillCatalogEntry, scaffoldSkill, validateSkillManifest } from "./skill.js";

describe("validateSkillManifest", () => {
  it("accepts the golden template format", () => {
    const source = `---
name: test-skill
description: Test skill
version: 0.1.0
engine:
  min_reasoning_tier: balanced
  preferred_model: gpt-5
  context_required: 64000
tooling:
  policy: cli-first
  jit_enabled_if: generalist_or_gt10_tools
  jit_tool_threshold: 10
permissions: [fs_read, fs_write]
---
# test`;
    const out = validateSkillManifest(source);
    expect(out.ok).toBe(true);
    expect(out.manifest?.frontmatter.name).toBe("test-skill");
  });

  it("rejects invalid semver and missing required fields", () => {
    const source = `---
name: bad-skill
version: one
engine:
  min_reasoning_tier: balanced
---`;
    const out = validateSkillManifest(source);
    expect(out.ok).toBe(false);
    expect(out.errors.some((e) => e.path === "version")).toBe(true);
    expect(out.errors.some((e) => e.path === "description")).toBe(true);
    expect(out.errors.some((e) => e.path === "tooling")).toBe(true);
    expect(out.errors.some((e) => e.path === "permissions")).toBe(true);
  });
});

describe("scaffoldSkill", () => {
  it("generates expected skeleton paths and templated skill file", () => {
    const out = scaffoldSkill("My New Skill", { version: "0.2.0", releaseTag: "sdk-v0.2.0" });
    expect(out.skillDir).toBe("skills/my-new-skill");
    expect(out.files.map((f) => f.path)).toEqual([
      "skills/my-new-skill/SKILL.md",
      "skills/my-new-skill/references/schemas.json",
      "skills/my-new-skill/.workdir/tasks/.gitkeep",
      "skills/my-new-skill/.workdir/tasks/{{task_id}}/.gitkeep",
    ]);
    const skillMd = out.files.find((f) => f.path.endsWith("SKILL.md"))?.content ?? "";
    expect(skillMd).toContain("name: my-new-skill");
    expect(skillMd).toContain("version: 0.2.0");
    expect(skillMd).toContain("release_tag: sdk-v0.2.0");
  });
});

describe("buildSkillCatalogEntry", () => {
  it("builds a run-scoped catalog record", () => {
    const parsed = validateSkillManifest(`---
name: catalog-skill
description: Catalog skill
version: 1.0.0
engine:
  min_reasoning_tier: balanced
  preferred_model: gpt-5
  context_required: 64000
tooling:
  policy: cli-first
  jit_enabled_if: generalist_or_gt10_tools
  jit_tool_threshold: 10
permissions: [fs_read]
---
# catalog`);

    expect(parsed.ok).toBe(true);
    const entry = buildSkillCatalogEntry(parsed.manifest!, "cap.test.action");
    expect(entry.id).toBe("catalog-skill@1.0.0");
    expect(entry.runtime_disclosure.run_scoped_manifest).toBe(true);
    expect(entry.public_contract.execution_mode).toBe("client_side_jit");
  });
});
