"use server";

import { revalidatePath } from "next/cache";

import {
  getDeclaredToolsFromSkill,
  listTools,
  loadOrgAllowedToolNames,
  validateDeclaredToolsForDraftSave,
  validateDeclaredToolsForSkillApprove,
} from "@linktrend/linklogic-sdk";
import { SKILL_METADATA_DECLARED_TOOLS_KEY, type SkillRecord, type ToolRecord } from "@linktrend/shared-types";

import { canWriteCommandCentre, getCommandCentreRoleForUser } from "@/lib/command-centre-access";
import { mergeSkillBodyMarkdown, parseSkillBodyMarkdown } from "@/lib/skill-markdown";
import {
  mergeSkillMetadata,
  readSkillAdminFlags,
  readSkillFileRows,
  readSkillScripts,
  writeSkillAssets,
  writeSkillDeclaredTools,
  writeSkillReferences,
  writeSkillScripts,
  type SkillScriptRow,
} from "@/lib/skills-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const NAME_RE = /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$|^[a-z0-9]$/;

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
  return { skill: (data ?? null) as SkillRecord | null, error: null as string | null };
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
  const { data, error } = await gate.supabase
    .schema("linkaios")
    .from("skills")
    .insert({
      name,
      version: 1,
      status: "draft",
      body_markdown: `# ${name}\n\n`,
      metadata,
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { ok: false, error: "A skill with this name already exists." };
    return { ok: false, error: error.message };
  }
  const id = String((data as { id: string }).id);
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

export async function saveSkillFrontmatter(skillId: string, frontmatterYaml: string): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };

  const parsed = parseSkillBodyMarkdown(skill.body_markdown ?? "");
  const nextBody = mergeSkillBodyMarkdown(frontmatterYaml, parsed.promptMarkdown);

  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("skills")
    .update({ body_markdown: nextBody, updated_at: new Date().toISOString() })
    .eq("id", skillId);
  if (upErr) return { ok: false, error: upErr.message };
  revalidatePath(`/skills/${skillId}`);
  revalidatePath("/skills");
  revalidatePath("/skills/skills");
  return { ok: true };
}

export async function saveSkillPrompt(skillId: string, promptMarkdown: string): Promise<SkillActionResult> {
  if (!UUID_RE.test(skillId)) return { ok: false, error: "Invalid skill id." };
  const gate = await assertWriter();
  if (!gate.ok) return { ok: false, error: gate.error };
  const { skill, error } = await loadSkill(gate.supabase, skillId);
  if (error) return { ok: false, error };
  if (!skill) return { ok: false, error: "Skill not found." };

  const parsed = parseSkillBodyMarkdown(skill.body_markdown ?? "");
  const yaml = parsed.frontmatterYaml.trim() ? parsed.frontmatterYaml : "";
  const nextBody = mergeSkillBodyMarkdown(yaml, promptMarkdown);

  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("skills")
    .update({ body_markdown: nextBody, updated_at: new Date().toISOString() })
    .eq("id", skillId);
  if (upErr) return { ok: false, error: upErr.message };
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

  const nextMeta = writeSkillScripts(skill.metadata ?? {}, scripts);
  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("skills")
    .update({ metadata: nextMeta, updated_at: new Date().toISOString() })
    .eq("id", skillId);
  if (upErr) return { ok: false, error: upErr.message };
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
  const { error: upErr } = await gate.supabase
    .schema("linkaios")
    .from("skills")
    .update({ metadata: nextMeta, updated_at: new Date().toISOString() })
    .eq("id", skillId);
  if (upErr) return { ok: false, error: upErr.message };
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
  revalidatePath(`/skills/${skillId}`);
  revalidatePath("/skills");
  revalidatePath("/skills/skills");
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

export async function saveFrontmatterFormAction(_: SkillFormSaveState, formData: FormData): Promise<SkillFormSaveState> {
  const id = String(formData.get("skill_id") ?? "");
  const yaml = String(formData.get("frontmatter") ?? "");
  const r = await saveSkillFrontmatter(id, yaml);
  return r.ok ? { ok: true, message: "Saved." } : { ok: false, error: r.error };
}

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
