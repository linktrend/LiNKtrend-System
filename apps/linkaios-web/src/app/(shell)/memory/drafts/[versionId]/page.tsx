import Link from "next/link";
import { notFound } from "next/navigation";

import { BrainDraftEditor } from "@/components/brain-draft-editor";
import { PageIntro } from "@/components/page-intro";
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
    .select("logical_path, scope, mission_id, agent_id")
    .eq("id", ver.file_id)
    .maybeSingle();
  const file = fileRow as
    | { logical_path: string; scope: string; mission_id: string | null; agent_id: string | null }
    | null;

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Edit draft</h1>
        <PageIntro className="mt-2">
          <span className="font-mono text-xs">{file?.logical_path ?? "unknown path"}</span>
          <span className="mx-2 text-zinc-400">·</span>
          <span>{file?.scope ?? ""}</span>
          {file?.mission_id ? (
            <>
              <span className="mx-2 text-zinc-400">·</span>
              <span className="font-mono text-xs">mission {file.mission_id}</span>
            </>
          ) : null}
          {file?.agent_id ? (
            <>
              <span className="mx-2 text-zinc-400">·</span>
              <span className="font-mono text-xs">agent {file.agent_id}</span>
            </>
          ) : null}
        </PageIntro>
      </div>

      <BrainDraftEditor versionId={versionId} initialBody={ver.body} />

      <form action={publishBrainDraftFromForm} className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <input type="hidden" name="versionId" value={versionId} />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Publishing archives the current published version for this file (if any) and promotes this draft.
        </p>
        <button
          type="submit"
          className="mt-3 rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white dark:bg-violet-600"
        >
          Publish
        </button>
      </form>

      <p className="text-sm">
        <Link href="/memory?tab=inbox" className="text-sky-700 underline dark:text-sky-400">
          Back to Inbox
        </Link>
      </p>
    </main>
  );
}
