import { getSkillWideDefaultDeclaredTools, listTools, parseStepRecipeEntries } from "@linktrend/linklogic-sdk";
import { notFound } from "next/navigation";

import { getSkillForEditor } from "@/app/(shell)/skills/actions";
import { SkillWorkspace } from "@/components/skill-workspace";
import { applyDevTableRefAssetMocksIfEmpty } from "@/lib/skill-dev-table-mocks";
import { getSkillBodyPromptOnly } from "@/lib/skill-markdown";
import {
  readSkillAdminFlags,
  readSkillScripts,
  type SkillAssetTableRow,
  type SkillReferenceTableRow,
} from "@/lib/skills-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function SkillDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  if (!UUID_RE.test(id)) notFound();
  const { skill, error } = await getSkillForEditor(id);
  if (error || !skill) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: toolRows, error: toolsErr } = await listTools(supabase, { limit: 600 });
  if (toolsErr) {
    return (
      <main className="p-6">
        <p className="text-sm text-red-700">Could not load tools catalog: {toolsErr.message}</p>
      </main>
    );
  }
  const catalogToolNames = (toolRows ?? []).map((t) => t.name).sort((a, b) => a.localeCompare(b));
  const initialDeclaredTools = getSkillWideDefaultDeclaredTools(skill);

  const flags = readSkillAdminFlags(skill);
  const promptOnly = getSkillBodyPromptOnly(skill.body_markdown ?? "");
  const scripts = readSkillScripts(skill.metadata ?? {});

  const [{ data: categoryRows }, { data: refRows }, { data: assetRows }] = await Promise.all([
    supabase.schema("linkaios").from("skill_categories").select("id, title").order("sort_order", { ascending: true }),
    supabase
      .schema("linkaios")
      .from("skill_references")
      .select("id, label, kind, target, step_ordinal")
      .eq("skill_id", id)
      .order("label", { ascending: true }),
    supabase
      .schema("linkaios")
      .from("skill_assets")
      .select("id, name, storage_uri, byte_size, step_ordinal")
      .eq("skill_id", id)
      .order("name", { ascending: true }),
  ]);

  const categories = (categoryRows ?? []) as { id: string; title: string }[];
  const referencesRaw = (refRows ?? []) as SkillReferenceTableRow[];
  const assetsRaw = (assetRows ?? []) as SkillAssetTableRow[];
  const { assets: assetsForUi, references: referencesForUi, previewOnlyFileIds } = applyDevTableRefAssetMocksIfEmpty(
    referencesRaw,
    assetsRaw,
  );

  const initialSteps = parseStepRecipeEntries(skill.step_recipe);

  const initialTags = Array.isArray(skill.tags) ? skill.tags.map((t) => String(t)) : [];

  return (
    <SkillWorkspace
      dataRevision={skill.updated_at}
      skillId={id}
      name={skill.name}
      version={skill.version}
      categoryLabel={flags.category}
      description={flags.description}
      usageTrigger={flags.usageTrigger}
      skillStatus={skill.status}
      initialDeclaredTools={initialDeclaredTools}
      catalogToolNames={catalogToolNames}
      initialPromptMarkdown={promptOnly}
      initialScripts={scripts}
      initialAssets={assetsForUi}
      initialReferences={referencesForUi}
      previewOnlyFileIds={previewOnlyFileIds}
      categories={categories}
      skillCategoryId={skill.category_id ?? null}
      defaultModel={skill.default_model ?? ""}
      initialTags={initialTags}
      skillMode={(skill.skill_mode === "stepped" ? "stepped" : "simple") as "simple" | "stepped"}
      initialSteps={initialSteps}
    />
  );
}
