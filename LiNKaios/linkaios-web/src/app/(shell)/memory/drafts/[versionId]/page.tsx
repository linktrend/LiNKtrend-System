import { notFound } from "next/navigation";

import { BrainDraftEditor } from "@/components/brain-draft-editor";
import { MemoryTabLink } from "@/components/linkbrain/memory-surface-links";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { publishBrainDraftFromForm, rejectBrainDraftFromForm } from "@/app/(shell)/memory/brain-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BUTTON } from "@/lib/ui-standards";

import { getBrainFileVersionById } from "@linktrend/linklogic-sdk";

export const dynamic = "force-dynamic";

function scopeLabel(scope: string | undefined): string {
  if (scope === "company") return "Company memory";
  if (scope === "mission") return "Project memory";
  if (scope === "agent") return "LiNKbot memory";
  return scope ?? "Unknown scope";
}

async function resolveScopeDetail(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  file: { scope: string; mission_id: string | null; agent_id: string | null } | null,
): Promise<string> {
  if (!file) return "Scope unavailable";
  const parts = [scopeLabel(file.scope)];
  if (file.mission_id) {
    const { data } = await supabase
      .schema("linkaios")
      .from("projects")
      .select("title")
      .eq("id", file.mission_id)
      .maybeSingle();
    parts.push(`Project: ${(data as { title?: string } | null)?.title ?? "Unknown project"}`);
  }
  if (file.agent_id) {
    const { data } = await supabase
      .schema("linkaios")
      .from("agents")
      .select("display_name")
      .eq("id", file.agent_id)
      .maybeSingle();
    parts.push(`LiNKbot: ${(data as { display_name?: string } | null)?.display_name ?? "Unknown LiNKbot"}`);
  }
  return parts.join(" · ");
}

export default async function BrainDraftEditPage(props: { params: Promise<{ versionId: string }> }) {
  const { versionId } = await props.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: ver, error } = await getBrainFileVersionById(supabase, versionId);
  if (error || !ver || ver.status !== "draft") notFound();

  const { data: fileRow } = await supabase
    .schema("linkaios")
    .from("brain_virtual_files")
    .select("logical_path, scope, project_id, agent_id")
    .eq("id", ver.file_id)
    .maybeSingle();
  const fileRowTyped = fileRow as
    | { logical_path: string; scope: string; project_id: string | null; agent_id: string | null }
    | null;
  const file = fileRowTyped
    ? {
        logical_path: fileRowTyped.logical_path,
        scope: fileRowTyped.scope,
        mission_id: fileRowTyped.project_id,
        agent_id: fileRowTyped.agent_id,
      }
    : null;

  const scopeDetail = await resolveScopeDetail(supabase, file);

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <ShellPageHeaderClient title="Edit Inbox Draft" subtitle="Review and moderate before publishing to LiNKbrain." />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">{scopeDetail}</p>

      <BrainDraftEditor versionId={versionId} initialBody={ver.body} />

      <div className="flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <form action={publishBrainDraftFromForm} className="inline">
          <input type="hidden" name="versionId" value={versionId} />
          <button type="submit" className={BUTTON.approveOutlineRow}>
            Approve
          </button>
        </form>
        <form action={rejectBrainDraftFromForm} className="inline">
          <input type="hidden" name="versionId" value={versionId} />
          <button type="submit" className={BUTTON.rejectOutlineRow}>
            Reject
          </button>
        </form>
        <MemoryTabLink tab="inbox" className={BUTTON.editRow}>
          Back to Inbox
        </MemoryTabLink>
      </div>
    </main>
  );
}
