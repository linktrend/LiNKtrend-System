"use server";

import { revalidatePath } from "next/cache";

import {
  getDeclaredToolsFromSkill,
  listTools,
  loadOrgAllowedToolNames,
  normalizeDeclaredToolNames,
  parseStepRecipeEntries,
  syncSkillDerivedMetadata,
  validateDeclaredToolsForDraftSave,
  validateDeclaredToolsForSkillApprove,
  validateEffectiveDeclaredToolsNonEmpty,
} from "@linktrend/linklogic-sdk";
import { SKILL_METADATA_DECLARED_TOOLS_KEY, type SkillRecord, type ToolRecord } from "@linktrend/shared-types";

import { canWriteCommandCentre, getCommandCentreRoleForUser } from "@/lib/command-centre-access";
import { mergeSkillBodyMarkdown } from "@/lib/skill-markdown";
import {
  mergeSkillMetadata,
  readSkillAdminFlags,
  readSkillFileRows,
  readSkillScripts,
  type SkillAssetTableRow,
  type SkillReferenceTableRow,
  writeSkillAssets,
  writeSkillDeclaredTools,
  writeSkillReferences,
  writeSkillScripts,
  type SkillScriptRow,
} from "@/lib/skills-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const NAME_RE = /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$|^[a-z0-9]$/;

function slugifyCategoryLabel(label: string): string {
  const t = label.trim().toLowerCase();
  return t
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "general";
}

async function assertWriter() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return { supabase, ok: false as const, error: "Not signed in." };
  }
  const role = await getCommandCentreRoleForUser(supabase, { userId: user.id, email: user.email });
  if (!canWriteCommandCentre(role)) {
    return { supabase, ok: false as const, error: "Read-only: command centre writes are not allowed for your role." };
  }
  return { supabase, ok: true as const, error: undefined };
}

async function loadSkill(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, id: string) {
  const { data, error } = await supabase.schema("linkaios").from("skills").select("*").eq("id", id).maybeSingle();
  if (error) return { skill: null as SkillRecord | null, error: error.message };
  let skill = (data ?? null) as SkillRecord | null;
  if (!skill) return { skill: null, error: null as string | null };
  const { data: scriptRows, error: sErr } = await supabase
    .schema("linkaios")
    .from("skill_scripts")
    .select("id, filename, content")
    .eq("skill_id", id);
  if (!sErr && scriptRows?.length) {
    skill = {
      ...skill,
      metadata: writeSkillScripts(skill.metadata ?? {}, scriptRows as SkillScriptRow[]),
    };
  }
  return { skill, error: null as string | null };
}

async function toolsByNameMap(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data, error } = await listTools(supabase, { limit: 600 });
  if (error) return { map: null as Map<string, ToolRecord> | null, error: error.message };
  const map = new Map<string, ToolRecord>();
  for (const t of data ?? []) {
    map.set(t.name, t);
  }
  return { map, error: null as string | null };
}

export type SkillActionResult = { ok: true } | { ok: false; error: string };

export type CreateSkillResult = { ok: true; id: string } | { ok: false; error: string };

export async function createSkill(input: {
  name: string;
  category: string;
  description: string;
}): Promise<CreateSkillResult> {
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const name = input.name.trim().toLowerCase();
  if (!NAME_RE.test(name)) {
    return {
      ok: false,
      error: "Name must be lowercase letters, digits, hyphens; 1–64 chars; cannot start/end with hyphen.",
    };
  }
  const metadata = mergeSkillMetadata(
    { [SKILL_METADATA_DECLARED_TOOLS_KEY]: [] } as Record<string, unknown>,
    {
      category: input.category.trim() || "General",
      description: input.description.trim() || name.replace(/-/g, " "),
      published: false,
      runtime_enabled: false,
    },
  );
  const catSlug = slugifyCategoryLabel(input.category.trim() || "General");
  const { data: catMatch } = await gate.supabase
    .schema("linkaios")
    .from("skill_categories")
    .select("id")
    .eq("slug", catSlug)
    .maybeSingle();
  const { data: genCat } = await gate.supabase
    .schema("linkaios")
    .from("skill_categories")
    .select("id")
    .eq("slug", "general")
    .maybeSingle();
  const categoryId = (catMatch as { id?: string } | null)?.id ?? (genCat as { id?: string } | null)?.id ?? null;
  const insertRow: Record<string, unknown> = {
    name,
    version: 1,
    status: "draft",
    body_markdown: `# ${name}\n\n`,
    metadata,
    default_declared_tools: [] as string[],
  };
  if (categoryId) insertRow.category_id = categoryId;
  const { data, error } = await gate.supabase.schema("linkaios").from("skills").insert(insertRow).select("id").single();
  if (error) {
    if (error.code === "23505") return { ok: false, error: "A skill with this name already exists." };
    return { ok: false, error: error.message };
  }
  const id = String((data as { id: string }).id);
  const sync = await syncSkillDerivedMetadata(gate.supabase, id);
  if (sync.error) {
    return { ok: false, error: sync.error.message };
  }
  revalidatePath("/skills");
  revalidatePath("/skills/skills");
  return { ok: true, id };
}

export async function archiveSkill(skillId: string): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };
  if (skill.status !== "approved") return { ok: false, error: "Only approved skills can be archived (deprecated)." };
  const nextMeta = mergeSkillMetadata(skill.metadata ?? {}, { published: false, runtime_enabled: false });
  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("skills")
    .update({ status: "deprecated", metadata: nextMeta, updated_at: new Date().toISOString() })
    .eq("id", skillId);
  if (upErr) return { ok: false, error: upErr.message };
  revalidatePath("/skills");
  revalidatePath("/skills/skills");
  revalidatePath(`/skills/${skillId}`);
  return { ok: true };
}

export async function updateSkillPublishFlags(skillId: string, published: boolean, runtimeEnabled: boolean): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) {
    return { ok: false, error: "Invalid skill id." };
  }
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };

  let runtime = runtimeEnabled;
  if (!published) runtime = false;

  const nextMeta = mergeSkillMetadata(skill.metadata ?? {}, {
    published,
    runtime_enabled: runtime,
  });

  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("skills")
    .update({ metadata: nextMeta, updated_at: new Date().toISOString() })
    .eq("id", skillId);

  if (upErr) return { ok: false, error: upErr.message };
  revalidatePath("/skills");
  revalidatePath("/skills/skills");
  revalidatePath(`/skills/${skillId}`);
  return { ok: true };
}

export async function updateSkillCategoryDescription(
  skillId: string,
  input: { category?: string; description?: string },
): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };

  const patch: Record<string, unknown> = {};
  if (input.category != null) patch.category = input.category.trim();
  if (input.description != null) patch.description = input.description.trim();

  const nextMeta = mergeSkillMetadata(skill.metadata ?? {}, patch);
  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("skills")
    .update({ metadata: nextMeta, updated_at: new Date().toISOString() })
    .eq("id", skillId);
  if (upErr) return { ok: false, error: upErr.message };
  revalidatePath("/skills");
  revalidatePath("/skills/skills");
  revalidatePath(`/skills/${skillId}`);
  return { ok: true };
}

export async function saveSkillPrompt(skillId: string, promptMarkdown: string): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };

  /** Persist prose only; YAML frontmatter is not a supported source of truth (see structured metadata save). */
  const nextBody = mergeSkillBodyMarkdown("", promptMarkdown);

  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("skills")
    .update({ body_markdown: nextBody, updated_at: new Date().toISOString() })
    .eq("id", skillId);
  if (upErr) return { ok: false, error: upErr.message };
  const sync = await syncSkillDerivedMetadata(gate.supabase, skillId);
  if (sync.error) return { ok: false, error: sync.error.message };
  revalidatePath(`/skills/${skillId}`);
  revalidatePath("/skills");
  revalidatePath("/skills/skills");
  return { ok: true };
}

export async function saveSkillScripts(skillId: string, scripts: SkillScriptRow[]): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };

  const { error: delErr } = await gate.supabase.schema("linkaios").from("skill_scripts").delete().eq("skill_id", skillId);
  if (delErr) return { ok: false, error: delErr.message };
  if (scripts.length) {
    const { error: insErr } = await gate.supabase.schema("linkaios").from("skill_scripts").insert(
      scripts.map((s) => ({
        id: s.id,
        skill_id: skillId,
        filename: s.filename,
        content: s.content,
      })),
    );
    if (insErr) return { ok: false, error: insErr.message };
  }
  const meta = { ...(skill.metadata ?? {}) };
  delete (meta as Record<string, unknown>).linkaios_scripts;
  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("skills")
    .update({ metadata: meta, updated_at: new Date().toISOString() })
    .eq("id", skillId);
  if (upErr) return { ok: false, error: upErr.message };
  const sync = await syncSkillDerivedMetadata(gate.supabase, skillId);
  if (sync.error) return { ok: false, error: sync.error.message };
  revalidatePath(`/skills/${skillId}`);
  revalidatePath("/skills");
  revalidatePath("/skills/skills");
  return { ok: true };
}

export async function addSkillScript(skillId: string): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };

  const scripts = readSkillScripts(skill.metadata ?? {});
  const id = crypto.randomUUID();
  const next = [...scripts, { id, filename: "new-script.sh", content: "#!/usr/bin/env bash\nset -euo pipefail\n\necho \"Hello\"\n" }];
  return saveSkillScripts(skillId, next);
}

export async function deleteSkillScript(skillId: string, scriptId: string): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };
  const scripts = readSkillScripts(skill.metadata ?? {}).filter((s) => s.id !== scriptId);
  return saveSkillScripts(skillId, scripts);
}

export async function saveSkillDeclaredTools(skillId: string, toolNames: string[]): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };

  const { map, error: mapErr } = await toolsByNameMap(gate.supabase);
  if (mapErr || !map) return { ok: false, error: mapErr ?? "Failed to load tools catalog." };
  const v = validateDeclaredToolsForDraftSave(toolNames, map);
  if (!v.ok) return { ok: false, error: v.error };

  const nextMeta = writeSkillDeclaredTools(skill.metadata ?? {}, toolNames);
  const declared = normalizeDeclaredToolNames(toolNames);
  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("skills")
    .update({
      metadata: nextMeta,
      default_declared_tools: declared,
      updated_at: new Date().toISOString(),
    })
    .eq("id", skillId);
  if (upErr) return { ok: false, error: upErr.message };
  const sync = await syncSkillDerivedMetadata(gate.supabase, skillId);
  if (sync.error) return { ok: false, error: sync.error.message };
  revalidatePath(`/skills/${skillId}`);
  revalidatePath("/skills");
  revalidatePath("/skills/skills");
  return { ok: true };
}

/**
 * Draft → approved. Validates `declared_tools` against the catalog (published-approved rows) and
 * `linkaios.org_tool_allowlist` via `loadOrgAllowedToolNames` (no duplicated SQL in this module).
 */
export async function approveSkill(skillId: string): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };
  if (skill.status !== "draft") {
    return { ok: false, error: "Only draft skills can be approved from this action." };
  }

  const { map, error: mapErr } = await toolsByNameMap(gate.supabase);
  if (mapErr || !map) return { ok: false, error: mapErr ?? "Failed to load tools catalog." };

  let orgNames: string[];
  try {
    orgNames = await loadOrgAllowedToolNames(gate.supabase);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `Could not load organization tool allowlist: ${msg}` };
  }
  const orgAllowed = new Set(orgNames);

  const emptyErr = validateEffectiveDeclaredToolsNonEmpty(skill);
  if (emptyErr) return { ok: false, error: emptyErr };
  const declared = getDeclaredToolsFromSkill(skill);
  const v = validateDeclaredToolsForSkillApprove(declared, map, orgAllowed);
  if (!v.ok) return { ok: false, error: v.error };

  const nextMeta = mergeSkillMetadata(skill.metadata ?? {}, {
    published: true,
    runtime_enabled: false,
  });
  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("skills")
    .update({ status: "approved", metadata: nextMeta, updated_at: new Date().toISOString() })
    .eq("id", skillId);
  if (upErr) return { ok: false, error: upErr.message };
  const sync = await syncSkillDerivedMetadata(gate.supabase, skillId);
  if (sync.error) return { ok: false, error: sync.error.message };
  revalidatePath("/skills");
  revalidatePath("/skills/skills");
  revalidatePath(`/skills/${skillId}`);
  return { ok: true };
}

export async function archiveSkillFile(
  skillId: string,
  fileId: string,
  kind: "asset" | "reference",
): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };

  const table = kind === "asset" ? "skill_assets" : "skill_references";
  const { error: delErr } = await gate.supabase.schema("linkaios").from(table).delete().eq("skill_id", skillId).eq("id", fileId);
  if (delErr) return { ok: false, error: delErr.message };

  const { assets, references } = readSkillFileRows(skill.metadata ?? {});
  const nextMeta =
    kind === "asset"
      ? writeSkillAssets(skill.metadata ?? {}, assets.filter((a) => a.id !== fileId))
      : writeSkillReferences(skill.metadata ?? {}, references.filter((r) => r.id !== fileId));

  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("skills")
    .update({ metadata: nextMeta, updated_at: new Date().toISOString() })
    .eq("id", skillId);
  if (upErr) return { ok: false, error: upErr.message };
  const sync = await syncSkillDerivedMetadata(gate.supabase, skillId);
  if (sync.error) return { ok: false, error: sync.error.message };
  revalidatePath(`/skills/${skillId}`);
  revalidatePath("/skills");
  revalidatePath("/skills/skills");
  return { ok: true };
}

const REF_KINDS = new Set<SkillReferenceTableRow["kind"]>(["brain_path", "storage_uri", "tool_name"]);

function stepsForPersistence(mode: "simple" | "stepped", raw: unknown): unknown[] {
  if (mode !== "stepped") return [];
  return parseStepRecipeEntries(raw).map((s) => {
    const o: Record<string, unknown> = { ordinal: s.ordinal };
    if (s.title != null && String(s.title).trim() !== "") o.title = s.title;
    if (s.model != null && String(s.model).trim() !== "") o.model = s.model;
    if (s.declared_tools?.length) o.declared_tools = s.declared_tools;
    if (s.script_ids?.length) o.script_ids = s.script_ids;
    if (s.reference_ids?.length) o.reference_ids = s.reference_ids;
    if (s.asset_ids?.length) o.asset_ids = s.asset_ids;
    return o;
  });
}

async function assertStepRecipeChildIds(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  skillId: string,
  steps: ReturnType<typeof parseStepRecipeEntries>,
): Promise<string | null> {
  if (steps.length === 0) return null;
  const [{ data: scr }, { data: ref }, { data: ast }] = await Promise.all([
    supabase.schema("linkaios").from("skill_scripts").select("id").eq("skill_id", skillId),
    supabase.schema("linkaios").from("skill_references").select("id").eq("skill_id", skillId),
    supabase.schema("linkaios").from("skill_assets").select("id").eq("skill_id", skillId),
  ]);
  const scriptIds = new Set((scr ?? []).map((r: { id: string }) => r.id));
  const refIds = new Set((ref ?? []).map((r: { id: string }) => r.id));
  const assetIds = new Set((ast ?? []).map((r: { id: string }) => r.id));
  for (const st of steps) {
    for (const sid of st.script_ids ?? []) {
      if (!scriptIds.has(sid)) return `Step ${st.ordinal}: script id "${sid}" is not on this skill.`;
    }
    for (const rid of st.reference_ids ?? []) {
      if (!refIds.has(rid)) return `Step ${st.ordinal}: reference id "${rid}" is not on this skill.`;
    }
    for (const aid of st.asset_ids ?? []) {
      if (!assetIds.has(aid)) return `Step ${st.ordinal}: asset id "${aid}" is not on this skill.`;
    }
  }
  return null;
}

export async function saveSkillStructuredMetadata(
  skillId: string,
  input: {
    categoryId: string | null;
    description: string;
    usageTrigger: string;
    tags: string[];
    defaultModel: string;
    skillMode: "simple" | "stepped";
    stepRecipe: unknown;
  },
): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };

  const mode = input.skillMode === "stepped" ? "stepped" : "simple";
  const stepsPersisted = stepsForPersistence(mode, input.stepRecipe);
  const parsedSteps = parseStepRecipeEntries(stepsPersisted);
  const stepErr = await assertStepRecipeChildIds(gate.supabase, skillId, parsedSteps);
  if (stepErr) return { ok: false, error: stepErr };

  const tags = [...new Set(input.tags.map((t) => String(t).trim().toLowerCase()).filter((t) => t.length > 0))];

  const nextMeta = mergeSkillMetadata(skill.metadata ?? {}, {
    description: input.description.trim(),
    usage_trigger: input.usageTrigger.trim(),
  });

  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("skills")
    .update({
      category_id: input.categoryId,
      default_model: input.defaultModel.trim() ? input.defaultModel.trim() : null,
      tags,
      skill_mode: mode,
      step_recipe: mode === "stepped" ? stepsPersisted : [],
      metadata: nextMeta,
      updated_at: new Date().toISOString(),
    })
    .eq("id", skillId);
  if (upErr) return { ok: false, error: upErr.message };
  const sync = await syncSkillDerivedMetadata(gate.supabase, skillId);
  if (sync.error) return { ok: false, error: sync.error.message };
  revalidatePath(`/skills/${skillId}`);
  revalidatePath("/skills");
  revalidatePath("/skills/skills");
  return { ok: true };
}

export async function saveSkillReferences(skillId: string, rows: SkillReferenceTableRow[]): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };

  for (const r of rows) {
    if (!REF_KINDS.has(r.kind)) {
      return { ok: false, error: `Invalid reference kind for row "${r.label}".` };
    }
  }

  const { error: delErr } = await gate.supabase.schema("linkaios").from("skill_references").delete().eq("skill_id", skillId);
  if (delErr) return { ok: false, error: delErr.message };
  if (rows.length) {
    const { error: insErr } = await gate.supabase.schema("linkaios").from("skill_references").insert(
      rows.map((r) => ({
        id: r.id,
        skill_id: skillId,
        label: r.label.trim() || "reference",
        kind: r.kind,
        target: r.target.trim(),
        step_ordinal: r.step_ordinal == null || Number.isNaN(r.step_ordinal) ? null : Math.floor(r.step_ordinal),
        extra: {},
      })),
    );
    if (insErr) return { ok: false, error: insErr.message };
  }
  const sync = await syncSkillDerivedMetadata(gate.supabase, skillId);
  if (sync.error) return { ok: false, error: sync.error.message };
  revalidatePath(`/skills/${skillId}`);
  revalidatePath("/skills");
  revalidatePath("/skills/skills");
  return { ok: true };
}

export async function saveSkillAssets(skillId: string, rows: SkillAssetTableRow[]): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };

  const { error: delErr } = await gate.supabase.schema("linkaios").from("skill_assets").delete().eq("skill_id", skillId);
  if (delErr) return { ok: false, error: delErr.message };
  if (rows.length) {
    const { error: insErr } = await gate.supabase.schema("linkaios").from("skill_assets").insert(
      rows.map((r) => ({
        id: r.id,
        skill_id: skillId,
        name: r.name.trim() || "asset",
        storage_uri: r.storage_uri.trim(),
        byte_size: r.byte_size == null || Number.isNaN(r.byte_size) ? null : Math.floor(Number(r.byte_size)),
        step_ordinal: r.step_ordinal == null || Number.isNaN(r.step_ordinal) ? null : Math.floor(r.step_ordinal),
      })),
    );
    if (insErr) return { ok: false, error: insErr.message };
  }
  const sync = await syncSkillDerivedMetadata(gate.supabase, skillId);
  if (sync.error) return { ok: false, error: sync.error.message };
  revalidatePath(`/skills/${skillId}`);
  revalidatePath("/skills");
  revalidatePath("/skills/skills");
  return { ok: true };
}

export async function addSkillReference(skillId: string): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const id = crypto.randomUUID();
  const { error } = await gate.supabase.schema("linkaios").from("skill_references").insert({
    id,
    skill_id: skillId,
    label: "New reference",
    kind: "brain_path",
    target: "",
    step_ordinal: null,
    extra: {},
  });
  if (error) return { ok: false, error: error.message };
  const sync = await syncSkillDerivedMetadata(gate.supabase, skillId);
  if (sync.error) return { ok: false, error: sync.error.message };
  revalidatePath(`/skills/${skillId}`);
  return { ok: true };
}

export async function addSkillAsset(skillId: string): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const id = crypto.randomUUID();
  const { error } = await gate.supabase.schema("linkaios").from("skill_assets").insert({
    id,
    skill_id: skillId,
    name: "New asset",
    storage_uri: "",
    byte_size: null,
    step_ordinal: null,
  });
  if (error) return { ok: false, error: error.message };
  const sync = await syncSkillDerivedMetadata(gate.supabase, skillId);
  if (sync.error) return { ok: false, error: sync.error.message };
  revalidatePath(`/skills/${skillId}`);
  return { ok: true };
}

/** Expose read for server pages */
export async function getSkillForEditor(skillId: string): Promise<{ skill: SkillRecord | null; error: string | null }> {
  if (!UUID_RE.test(skillId)) return { skill: null, error: "Invalid id" };
  const supabase = await createSupabaseServerClient();
  const { skill, error } = await loadSkill(supabase, skillId);
  return { skill, error };
}

export async function readSkillFlags(skillId: string) {
  const { skill, error } = await getSkillForEditor(skillId);
  if (error || !skill) return null;
  return readSkillAdminFlags(skill);
}

export type SkillFormSaveState = { ok: boolean; message?: string; error?: string } | null;

export async function savePromptFormAction(_: SkillFormSaveState, formData: FormData): Promise<SkillFormSaveState> {
  const id = String(formData.get("skill_id") ?? "");
  const prompt = String(formData.get("prompt") ?? "");
  const r = await saveSkillPrompt(id, prompt);
  return r.ok ? { ok: true, message: "Saved." } : { ok: false, error: r.error };
}

export async function saveScriptFormAction(_: SkillFormSaveState, formData: FormData): Promise<SkillFormSaveState> {
  const skillId = String(formData.get("skill_id") ?? "");
  const scriptId = String(formData.get("script_id") ?? "");
  const filename = String(formData.get("filename") ?? "");
  const content = String(formData.get("content") ?? "");
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };
  const scripts = readSkillScripts(skill.metadata ?? {}).map((s) =>
    s.id === scriptId ? { ...s, filename: filename || s.filename, content } : s,
  );
  const r = await saveSkillScripts(skillId, scripts);
  return r.ok ? { ok: true, message: "Saved." } : { ok: false, error: r.error };
}
