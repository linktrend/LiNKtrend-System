import { listApprovedSkillsDeclaringTool } from "@linktrend/linklogic-sdk";
import { notFound } from "next/navigation";

import { getToolForEditor } from "@/app/(shell)/skills/tools/actions";
import { ToolWorkspace } from "@/components/tool-workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function ToolDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  if (!UUID_RE.test(id)) notFound();
  const { tool, error } = await getToolForEditor(id);
  if (error || !tool) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: declaringRows, error: declErr } = await listApprovedSkillsDeclaringTool(supabase, tool.name);
  if (declErr) {
    return (
      <main className="p-6">
        <p className="text-sm text-red-700">Could not load declaring skills: {declErr.message}</p>
      </main>
    );
  }

  return (
    <ToolWorkspace
      toolId={id}
      dataRevision={tool.updated_at}
      record={tool}
      declaringSkills={declaringRows ?? []}
    />
  );
}
