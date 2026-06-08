import { notFound } from "next/navigation";

import { BrainDraftEditor } from "@/components/brain-draft-editor";
import { MemoryTabLink } from "@/components/linkbrain/memory-surface-links";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { publishBrainDraftFromForm } from "@/app/(shell)/memory/brain-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { getBrainFileVersionById } from "@linktrend/linklogic-sdk";

export const dynamic = "force-dynamic";

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

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <ShellPageHeaderClient
        title="Edit Inbox draft"
        subtitle={file?.logical_path ?? "Draft awaiting approval"}
       
      />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Scope: {file?.scope ?? "—"}
        {file?.mission_id ? (
          <>
            {" "}
            · project <span className="font-mono text-xs">{file.mission_id}</span>
          </>
        ) : null}
        {file?.agent_id ? (
          <>
            {" "}
            · LiNKbot <span className="font-mono text-xs">{file.agent_id}</span>
          </>
        ) : null}
      </p>

      <BrainDraftEditor versionId={versionId} initialBody={ver.body} />

      <form action={publishBrainDraftFromForm} className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <input type="hidden" name="versionId" value={versionId} />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Approving publishes this draft to LiNKbrain. The prior published version for this path is archived.
        </p>
        <button
          type="submit"
          className="mt-3 rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white dark:bg-violet-600"
        >
          Approve &amp; publish
        </button>
      </form>

      <p className="text-sm">
        <MemoryTabLink tab="inbox" className="text-sky-700 underline dark:text-sky-400">
          Back to Inbox
        </MemoryTabLink>
      </p>
    </main>
  );
}
