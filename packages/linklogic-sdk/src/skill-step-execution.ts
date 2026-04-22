import type { SkillRecord } from "@linktrend/shared-types";

import { getSkillWideDefaultDeclaredTools, normalizeDeclaredToolNames } from "./declared-tools.js";

export type SkillStepRecipeEntry = {
  ordinal: number;
  title?: string;
  model?: string | null;
  declared_tools?: string[];
  /** Subset of `skill_scripts.id` for this step; empty = all skill scripts apply. */
  script_ids?: string[];
  /** Subset of `skill_references.id` explicitly attached to the step (in addition to table `step_ordinal` matches). */
  reference_ids?: string[];
  /** Subset of `skill_assets.id` explicitly attached to the step (in addition to table `step_ordinal` matches). */
  asset_ids?: string[];
};

export type SkillScriptRowLite = { id: string; filename: string; content: string };
export type SkillReferenceRowLite = {
  id: string;
  label: string;
  kind: string;
  target: string;
  step_ordinal: number | null;
  extra: unknown;
};
export type SkillAssetRowLite = {
  id: string;
  name: string;
  storage_uri: string;
  byte_size: number | null;
  step_ordinal: number | null;
};

export type ResolvedSkillStepExecution = {
  ordinal: number;
  title: string;
  /** Model after applying step override then skill `default_model`. */
  model_effective: string | null;
  /** Union of skill-wide defaults and this step’s `declared_tools` (if any). */
  effective_declared_tools: string[];
  scripts: SkillScriptRowLite[];
  references: SkillReferenceRowLite[];
  assets: SkillAssetRowLite[];
};

function parseJsonArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const v = JSON.parse(raw) as unknown;
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Normalize `skills.step_recipe` JSON into typed step entries. */
export function parseStepRecipeEntries(stepRecipe: unknown): SkillStepRecipeEntry[] {
  const raw = parseJsonArray(stepRecipe);
  const out: SkillStepRecipeEntry[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const o = item as Record<string, unknown>;
    const ord = Number(o.ordinal);
    if (!Number.isFinite(ord)) continue;
    const refIdsRaw = o.reference_ids ?? o.reference_pointers;
    const refIds = Array.isArray(refIdsRaw) ? refIdsRaw.map((x) => String(x)) : [];
    out.push({
      ordinal: Math.floor(ord),
      title: typeof o.title === "string" ? o.title : undefined,
      model: o.model == null ? undefined : String(o.model),
      declared_tools: Array.isArray(o.declared_tools) ? o.declared_tools.map((x) => String(x)) : undefined,
      script_ids: Array.isArray(o.script_ids) ? o.script_ids.map((x) => String(x)) : undefined,
      reference_ids: refIds.length ? refIds : undefined,
      asset_ids: Array.isArray(o.asset_ids) ? o.asset_ids.map((x) => String(x)) : undefined,
    });
  }
  return out.slice().sort((a, b) => a.ordinal - b.ordinal);
}

export function effectiveDeclaredToolsForStep(skill: SkillRecord, step: SkillStepRecipeEntry): string[] {
  const base = getSkillWideDefaultDeclaredTools(skill);
  const extra = step.declared_tools?.length ? normalizeDeclaredToolNames(step.declared_tools) : [];
  return normalizeDeclaredToolNames([...base, ...extra]);
}

function pickScriptsForStep(all: SkillScriptRowLite[], step: SkillStepRecipeEntry): SkillScriptRowLite[] {
  const ids = (step.script_ids ?? []).map((x) => String(x).trim()).filter(Boolean);
  /** Empty / omitted `script_ids` ⇒ no restriction (all skill scripts). */
  if (ids.length === 0) {
    return [...all];
  }
  const set = new Set(ids);
  return all.filter((s) => set.has(s.id));
}

function mergeRefsForStep(all: SkillReferenceRowLite[], step: SkillStepRecipeEntry, ordinal: number): SkillReferenceRowLite[] {
  const explicit = new Set((step.reference_ids ?? []).map((x) => String(x).trim()).filter(Boolean));
  const byId = new Map<string, SkillReferenceRowLite>();
  for (const r of all) {
    if (explicit.has(r.id)) {
      byId.set(r.id, r);
      continue;
    }
    if (r.step_ordinal == null || r.step_ordinal === ordinal) {
      byId.set(r.id, r);
    }
  }
  return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function mergeAssetsForStep(all: SkillAssetRowLite[], step: SkillStepRecipeEntry, ordinal: number): SkillAssetRowLite[] {
  const explicit = new Set((step.asset_ids ?? []).map((x) => String(x).trim()).filter(Boolean));
  const byId = new Map<string, SkillAssetRowLite>();
  for (const a of all) {
    if (explicit.has(a.id)) {
      byId.set(a.id, a);
      continue;
    }
    if (a.step_ordinal == null || a.step_ordinal === ordinal) {
      byId.set(a.id, a);
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Per-step execution view: effective tools, scripts, references, and assets after merging skill-wide defaults,
 * `step_recipe` ids, and table `step_ordinal` scoping. Returns `null` for simple skills.
 */
export function buildResolvedStepExecution(params: {
  skill: SkillRecord;
  scripts: SkillScriptRowLite[];
  references: SkillReferenceRowLite[];
  assets: SkillAssetRowLite[];
}): ResolvedSkillStepExecution[] | null {
  const { skill, scripts, references, assets } = params;
  if (skill.skill_mode !== "stepped") {
    return null;
  }
  const steps = parseStepRecipeEntries(skill.step_recipe);
  if (steps.length === 0) {
    return [];
  }
  return steps.map((step) => {
    const ord = step.ordinal;
    const modelOverride = step.model != null && String(step.model).trim() !== "" ? String(step.model).trim() : null;
    const skillModel = skill.default_model != null && String(skill.default_model).trim() !== "" ? String(skill.default_model).trim() : null;
    return {
      ordinal: ord,
      title: (step.title != null && String(step.title).trim() !== "" ? String(step.title).trim() : null) ?? `Step ${ord}`,
      model_effective: modelOverride ?? skillModel,
      effective_declared_tools: effectiveDeclaredToolsForStep(skill, step),
      scripts: pickScriptsForStep(scripts, step),
      references: mergeRefsForStep(references, step, ord),
      assets: mergeAssetsForStep(assets, step, ord),
    };
  });
}
