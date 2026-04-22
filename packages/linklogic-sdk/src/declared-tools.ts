import type { SkillRecord, ToolRecord } from "@linktrend/shared-types";
import { SKILL_METADATA_DECLARED_TOOLS_KEY } from "@linktrend/shared-types";

export function normalizeDeclaredToolNames(names: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of names) {
    const n = String(raw ?? "")
      .trim()
      .toLowerCase();
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

function readDeclaredToolsFromMetadata(meta: Record<string, unknown> | undefined): string[] {
  if (!meta) return [];
  const raw = meta[SKILL_METADATA_DECLARED_TOOLS_KEY];
  if (!Array.isArray(raw)) return [];
  return normalizeDeclaredToolNames(raw.map((x) => String(x)));
}

function readDeclaredToolsFromStepRecipe(stepRecipe: unknown): string[] {
  let raw = stepRecipe;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const step of raw) {
    if (typeof step !== "object" || step === null) continue;
    const dt = (step as Record<string, unknown>).declared_tools;
    if (!Array.isArray(dt) || dt.length === 0) continue;
    out.push(...dt.map((x) => String(x)));
  }
  return normalizeDeclaredToolNames(out);
}

/**
 * Skill-wide default declared tools only (no `step_recipe` union). Used for per-step merges in execution views.
 */
export function getSkillWideDefaultDeclaredTools(skill: SkillRecord): string[] {
  const row = skill as SkillRecord & { default_declared_tools?: string[] | null };
  if (Array.isArray(row.default_declared_tools) && row.default_declared_tools.length > 0) {
    return normalizeDeclaredToolNames(row.default_declared_tools);
  }
  return readDeclaredToolsFromMetadata(skill.metadata as Record<string, unknown>);
}

/**
 * Effective declared tool names for governance and validation.
 * Prefers `default_declared_tools` column when present; otherwise metadata `declared_tools`.
 * For **stepped** skills, returns the **union** of skill-wide defaults and each step’s non-empty
 * `declared_tools` override (steps with no override inherit defaults only). The result is still
 * intersected with org/mission policy in `buildLinktrendGovernancePayload` — this does not widen policy.
 */
export function getDeclaredToolsFromSkill(skill: SkillRecord): string[] {
  const base = getSkillWideDefaultDeclaredTools(skill);
  if (skill.skill_mode !== "stepped") {
    return base;
  }
  const fromSteps = readDeclaredToolsFromStepRecipe(skill.step_recipe);
  if (fromSteps.length === 0) {
    return base;
  }
  return normalizeDeclaredToolNames([...base, ...fromSteps]);
}

/** Product rule: approve requires a non-empty effective declared set (defaults ∪ stepped overrides). */
export const SKILL_APPROVE_REQUIRES_DECLARED_TOOLS =
  "Declare at least one effective tool: set skill-wide defaults and/or stepped per-step declared tools so the union is non-empty. On approve, every tool must exist in the catalog as approved and appear on the organization allowlist.";

export function validateEffectiveDeclaredToolsNonEmpty(skill: SkillRecord): string | null {
  if (getDeclaredToolsFromSkill(skill).length === 0) {
    return SKILL_APPROVE_REQUIRES_DECLARED_TOOLS;
  }
  return null;
}

/** PostgREST filter fragment helper (metadata contains declared_tools array). */
export function getDeclaredToolsFilterFromMetadata(): string {
  return `metadata->${SKILL_METADATA_DECLARED_TOOLS_KEY}`;
}

export function isToolPublishedApprovedCatalog(tool: ToolRecord): boolean {
  return tool.status === "approved";
}

export function validateDeclaredToolsForDraftSave(
  names: string[],
  catalogByName: Map<string, ToolRecord>,
): { ok: true } | { ok: false; error: string } {
  const norm = normalizeDeclaredToolNames(names);
  for (const n of norm) {
    const t = catalogByName.get(n);
    if (!t) {
      return { ok: false, error: `Unknown tool "${n}" (not in catalog).` };
    }
  }
  return { ok: true };
}

/**
 * Skill approve: every declared tool must exist as approved catalog row and appear on org allowlist.
 * Empty declared list: org check passes (mission may still constrain at runtime).
 */
export function validateDeclaredToolsForSkillApprove(
  declared: string[],
  catalogByName: Map<string, ToolRecord>,
  orgAllowedNames: Set<string>,
): { ok: true } | { ok: false; error: string } {
  const norm = normalizeDeclaredToolNames(declared);
  for (const n of norm) {
    const t = catalogByName.get(n);
    if (!t) {
      return { ok: false, error: `Declared tool "${n}" is not in the catalog.` };
    }
    if (!isToolPublishedApprovedCatalog(t)) {
      return { ok: false, error: `Tool "${n}" is not an approved catalog entry.` };
    }
    if (!orgAllowedNames.has(n)) {
      return {
        ok: false,
        error: `Tool "${n}" is not on the organization allowlist. Add it under Settings → Tools before approving this skill.`,
      };
    }
  }
  return { ok: true };
}
