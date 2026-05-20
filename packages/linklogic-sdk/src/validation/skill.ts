import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type {
  ScaffoldOptions,
  ScaffoldResult,
  SkillCatalogEntry,
  SkillFrontmatter,
  SkillManifest,
  ValidationIssue,
  ValidationResult,
} from "../types/skill.js";

const REQUIRED_FRONTMATTER_FIELDS = ["name", "description", "version", "engine", "tooling", "permissions"] as const;
const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/;

function parseScalar(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseInlineArray(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return [];
  const inner = trimmed.slice(1, -1).trim();
  if (!inner) return [];
  return inner
    .split(",")
    .map((item) => item.trim().replace(/^['\"]|['\"]$/g, ""))
    .filter(Boolean);
}

function parseFrontmatterBlock(block: string): Record<string, unknown> {
  const lines = block.split(/\r?\n/);
  const root: Record<string, unknown> = {};
  let parentKey: string | null = null;

  for (const raw of lines) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    const indented = /^\s+/.test(raw);
    const line = raw.trimEnd();

    if (indented && parentKey) {
      const m = line.trim().match(/^([A-Za-z0-9_]+):\s*(.*)$/);
      if (!m) continue;
      const [, key, value] = m;
      const parent = (root[parentKey] ?? {}) as Record<string, unknown>;
      parent[key] = value.trim().startsWith("[") ? parseInlineArray(value) : parseScalar(value);
      root[parentKey] = parent;
      continue;
    }

    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, value] = m;
    const trimmed = value.trim();
    if (!trimmed) {
      root[key] = {};
      parentKey = key;
      continue;
    }
    root[key] = trimmed.startsWith("[") ? parseInlineArray(trimmed) : parseScalar(trimmed);
    parentKey = null;
  }

  return root;
}

function extractFrontmatter(markdown: string): { block: string | null; body: string } {
  if (!markdown.startsWith("---\n")) {
    return { block: null, body: markdown };
  }
  const end = markdown.indexOf("\n---", 4);
  if (end < 0) {
    return { block: null, body: markdown };
  }
  const block = markdown.slice(4, end);
  const body = markdown.slice(end + 4).replace(/^\r?\n/, "");
  return { block, body };
}

export function validateSkillManifest(skillMd: string): ValidationResult {
  const errors: ValidationIssue[] = [];
  const { block, body } = extractFrontmatter(skillMd);

  if (!block) {
    return { ok: false, manifest: null, errors: [{ path: "frontmatter", message: "Missing YAML frontmatter block" }] };
  }

  const fm = parseFrontmatterBlock(block) as Partial<SkillFrontmatter>;

  for (const field of REQUIRED_FRONTMATTER_FIELDS) {
    if (fm[field] == null || fm[field] === "") {
      errors.push({ path: field, message: `Missing required field: ${field}` });
    }
  }

  if (typeof fm.version !== "string" || !SEMVER_RE.test(fm.version)) {
    errors.push({ path: "version", message: "version must be valid semver (x.y.z)" });
  }

  const engine = (fm.engine ?? {}) as Record<string, unknown>;
  if (!engine.min_reasoning_tier || !engine.preferred_model || typeof engine.context_required !== "number") {
    errors.push({ path: "engine", message: "engine requires min_reasoning_tier, preferred_model, context_required(number)" });
  }

  const tooling = (fm.tooling ?? {}) as Record<string, unknown>;
  if (!tooling.policy || !tooling.jit_enabled_if || typeof tooling.jit_tool_threshold !== "number") {
    errors.push({ path: "tooling", message: "tooling requires policy, jit_enabled_if, jit_tool_threshold(number)" });
  }

  if (!Array.isArray(fm.permissions) || fm.permissions.length === 0) {
    errors.push({ path: "permissions", message: "permissions must be a non-empty array" });
  }

  const manifest: SkillManifest | null = errors.length
    ? null
    : {
        frontmatter: fm as SkillFrontmatter,
        body,
      };

  return { ok: errors.length === 0, manifest, errors };
}

export function loadGoldenTemplate(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const templatePath = resolve(here, "../../templates/skill-golden.md");
  return readFileSync(templatePath, "utf8");
}

function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function scaffoldSkill(name: string, options: ScaffoldOptions = {}): ScaffoldResult {
  const skill = slugifyName(name);
  const template = loadGoldenTemplate()
    .replace(/^# <Skill Name Identifier>/m, `# ${skill}`)
    .replace(/^name: skill-template$/m, `name: ${skill}`)
    .replace(/^version: 1\.2\.0$/m, `version: ${options.version ?? "0.1.0"}`)
    .replace(/^release_tag: sdk-v0\.0\.0$/m, `release_tag: ${options.releaseTag ?? "sdk-v0.1.0"}`)
    .replace(/^  preferred_model: gpt-4\.1$/m, `  preferred_model: ${options.preferredModel ?? "gpt-5"}`)
    .replace(/^  context_required: 64000$/m, `  context_required: ${String(options.contextRequired ?? 64000)}`);

  const schemas = {
    definitions: {
      input: { type: "object", additionalProperties: true },
      output: { type: "object", additionalProperties: true },
      state: {
        type: "object",
        properties: {
          task_id: { type: "string" },
          status: { type: "string" },
        },
        required: ["task_id", "status"],
      },
    },
  };

  const skillDir = `skills/${skill}`;
  const taskPath = `.workdir/tasks/${options.taskIdPlaceholder ?? "{{task_id}}"}`;

  return {
    skillDir,
    files: [
      { path: `${skillDir}/SKILL.md`, content: template },
      { path: `${skillDir}/references/schemas.json`, content: `${JSON.stringify(schemas, null, 2)}\n` },
      { path: `${skillDir}/.workdir/tasks/.gitkeep`, content: "" },
      { path: `${skillDir}/${taskPath}/.gitkeep`, content: "" },
    ],
  };
}

export function buildSkillCatalogEntry(manifest: SkillManifest, capabilityId: string): SkillCatalogEntry {
  return {
    id: `${manifest.frontmatter.name}@${manifest.frontmatter.version}`,
    skill_name: manifest.frontmatter.name,
    skill_version: manifest.frontmatter.version,
    capability_id: capabilityId,
    public_contract: {
      description: manifest.frontmatter.description,
      input_schema_summary: "references/schemas.json#/definitions/input",
      output_schema_summary: "references/schemas.json#/definitions/output",
      execution_mode: "client_side_jit",
    },
    runtime_disclosure: {
      run_scoped_manifest: true,
      tenant_scoped: true,
      capability_scoped: true,
      ttl_seconds: 900,
      token_payload_shape: {
        tenant_id: "string",
        run_id: "string",
        capability_id: capabilityId,
        skill_name: manifest.frontmatter.name,
        exp: 0,
      },
    },
  };
}
