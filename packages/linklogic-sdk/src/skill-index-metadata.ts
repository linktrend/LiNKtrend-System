import type { SkillRecord } from "@linktrend/shared-types";
import { SKILL_METADATA_DECLARED_TOOLS_KEY } from "@linktrend/shared-types";

import { getDeclaredToolsFromSkill } from "./declared-tools.js";

export const SKILL_INDEX_METADATA_KEY = "linkaios_index" as const;

export type SkillScriptSlim = { id: string; filename: string };
export type SkillReferenceSlim = { id: string; label: string; kind: string; target: string; step_ordinal?: number | null };
export type SkillAssetSlim = { id: string; name: string; storage_uri: string; step_ordinal?: number | null };

export type SkillIndexMetadata = {
  skill_name: string;
  skill_version: number;
  skill_mode: string;
  category_id: string | null;
  default_model: string | null;
  declared_tools: string[];
  tags: string[];
  scripts: SkillScriptSlim[];
  references: SkillReferenceSlim[];
  assets: SkillAssetSlim[];
  step_titles: string[];
};

export function buildSkillIndexMetadata(params: {
  skill: SkillRecord;
  scripts: SkillScriptSlim[];
  references: SkillReferenceSlim[];
  assets: SkillAssetSlim[];
}): Record<string, unknown> {
  const { skill, scripts, references, assets } = params;
  let rawSteps: unknown = skill.step_recipe;
  if (typeof rawSteps === "string") {
    try {
      rawSteps = JSON.parse(rawSteps) as unknown;
    } catch {
      rawSteps = [];
    }
  }
  const steps = Array.isArray(rawSteps) ? (rawSteps as Array<{ ordinal?: number; title?: string }>) : [];
  const stepTitles = steps
    .slice()
    .sort((a, b) => (Number(a.ordinal) || 0) - (Number(b.ordinal) || 0))
    .map((s) => String(s.title ?? `Step ${s.ordinal ?? ""}`).trim())
    .filter(Boolean);

  const index: SkillIndexMetadata = {
    skill_name: skill.name,
    skill_version: skill.version,
    skill_mode: skill.skill_mode ?? "simple",
    category_id: skill.category_id ?? null,
    default_model: skill.default_model ?? null,
    declared_tools: getDeclaredToolsFromSkill(skill),
    tags: Array.isArray(skill.tags) ? skill.tags.map((t) => String(t)) : [],
    scripts,
    references,
    assets,
    step_titles: stepTitles,
  };
  return index as unknown as Record<string, unknown>;
}

/** Merge derived index into skill metadata (preserves other keys). */
export function mergeSkillIndexIntoMetadata(
  metadata: Record<string, unknown>,
  index: Record<string, unknown>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...metadata, [SKILL_INDEX_METADATA_KEY]: index };
  const tools = index["declared_tools"];
  if (Array.isArray(tools)) {
    next[SKILL_METADATA_DECLARED_TOOLS_KEY] = tools;
  }
  return next;
}
