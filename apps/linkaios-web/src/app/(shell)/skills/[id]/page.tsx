import { getDeclaredToolsFromSkill, listTools } from "@linktrend/linklogic-sdk";
import { notFound } from "next/navigation";

import { getSkillForEditor } from "@/app/(shell)/skills/actions";
import { SkillWorkspace } from "@/components/skill-workspace";
import { applyDevFileMocksIfEmpty } from "@/lib/skill-dev-file-mocks";
import { parseSkillBodyMarkdown } from "@/lib/skill-markdown";
import { readSkillAdminFlags, readSkillFileRows, readSkillScripts } from "@/lib/skills-admin";
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
  const initialDeclaredTools = getDeclaredToolsFromSkill(skill);

  const flags = readSkillAdminFlags(skill);
  const parsed = parseSkillBodyMarkdown(skill.body_markdown ?? "");
  const scripts = readSkillScripts(skill.metadata ?? {});
  const { assets, references } = readSkillFileRows(skill.metadata ?? {});
  const { assets: assetsForUi, references: referencesForUi, previewOnlyFileIds } = applyDevFileMocksIfEmpty(
    assets,
    references,
  );

  return (
    <SkillWorkspace
      dataRevision={skill.updated_at}
      skillId={id}
      name={skill.name}
      version={skill.version}
      category={flags.category}
      description={flags.description}
      skillStatus={skill.status}
      initialDeclaredTools={initialDeclaredTools}
      catalogToolNames={catalogToolNames}
      initialFrontmatterYaml={parsed.frontmatterYaml}
      initialPromptMarkdown={parsed.promptMarkdown}
      initialScripts={scripts}
      initialAssets={assetsForUi}
      initialReferences={referencesForUi}
      previewOnlyFileIds={previewOnlyFileIds}
    />
  );
}
