import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addBrainIndexCardFromForm,
  appendBrainDailyLogFromForm,
  proposeEditFromPublishedForm,
  saveBrainFileOrgTagsFromForm,
} from "@/app/(shell)/memory/brain-actions";
import { PageIntro } from "@/components/page-intro";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  getBrainUploadByFileId,
  getBrainVirtualFileById,
  getPublishedVirtualFileBody,
  getPublishedVersionForFile,
  listBrainIndexCardsForFile,
  listBrainLegalEntities,
  listBrainOrgNodes,
  listOrgTagIdsForFile,
  parseDailyLogDateFromPath,
  type BrainScope,
} from "@linktrend/linklogic-sdk";

export const dynamic = "force-dynamic";

export default async function BrainFileDetailPage(props: {
  params: Promise<{ fileId: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  const { fileId } = await props.params;
  const sp = await props.searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: file, error: fErr } = await getBrainVirtualFileById(supabase, fileId);
  if (fErr || !file) notFound();

  const { data: pub } = await getPublishedVersionForFile(supabase, fileId);
  const { body: mergedPublishedBody } = await getPublishedVirtualFileBody(supabase, {
    scope: file.scope as BrainScope,
    logicalPath: file.logical_path,
    missionId: file.mission_id,
    agentId: file.agent_id,
  });
  const tagRes = await listOrgTagIdsForFile(supabase, fileId);
  const orgRes = await listBrainOrgNodes(supabase);
  const legalRes = await listBrainLegalEntities(supabase);
  const cardsRes = await listBrainIndexCardsForFile(supabase, fileId);
  const uploadRes = await getBrainUploadByFileId(supabase, fileId);

  const tagSet = new Set(tagRes.data ?? []);
  const legalName =
    legalRes.data?.find((l) => l.id === file.legal_entity_id)?.name ?? file.legal_entity_id.slice(0, 8);

  let signedDownloadUrl: string | null = null;
  if (uploadRes.data && file.file_kind === "upload") {
    const admin = getSupabaseAdmin();
    const { data: signed } = await admin.storage
      .from(uploadRes.data.bucket)
      .createSignedUrl(uploadRes.data.object_path, 600);
    signedDownloadUrl = signed?.signedUrl ?? null;
  }

  const logDate = parseDailyLogDateFromPath(file.logical_path);
  const showDailyAppend =
    file.file_kind === "daily_log" && file.scope === "agent" && file.agent_id && logDate !== null;

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Brain document</h1>
        <PageIntro className="mt-2">
          <span className="font-mono text-sm">{file.logical_path}</span>
          <span className="mx-2 text-zinc-400">·</span>
          <span>{file.scope}</span>
          <span className="mx-2 text-zinc-400">·</span>
          <span>{file.sensitivity}</span>
          <span className="mx-2 text-zinc-400">·</span>
          <span>{file.file_kind}</span>
        </PageIntro>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Legal entity: <span className="font-medium">{legalName}</span>
        </p>
      </div>

      {sp.err ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
          {decodeURIComponent(sp.err)}
        </p>
      ) : null}

      {signedDownloadUrl ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Binary attachment</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {uploadRes.data?.mime_type} · {uploadRes.data?.byte_size} bytes · scan: {uploadRes.data?.virus_scan_status}
          </p>
          <a
            href={signedDownloadUrl}
            className="mt-3 inline-block text-sm font-medium text-sky-700 underline dark:text-sky-400"
          >
            Download signed URL (10 min)
          </a>
        </section>
      ) : null}

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Published corpus view</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          For daily logs, append-only lines are merged after the published template (PRD §14.5).
        </p>
        {mergedPublishedBody.trim() || pub?.body ? (
          <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            {mergedPublishedBody}
          </pre>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">No published version yet — work from a draft in Inbox.</p>
        )}
      </section>

      {showDailyAppend ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Append log line</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            One line per submit; not a full markdown editor on the log body (PRD §14.6).
          </p>
          <form action={appendBrainDailyLogFromForm} className="mt-3 space-y-2">
            <input type="hidden" name="fileId" value={fileId} />
            <input type="hidden" name="agentId" value={file.agent_id ?? ""} />
            <input type="hidden" name="logDate" value={logDate ?? ""} />
            <textarea
              name="line"
              rows={3}
              required
              placeholder="Append-only line text"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Append line
            </button>
          </form>
        </section>
      ) : null}

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Governance</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Proposing an edit creates a <strong>new draft</strong> from the published body (concurrent drafts allowed).
        </p>
        <form action={proposeEditFromPublishedForm} className="mt-3">
          <input type="hidden" name="fileId" value={fileId} />
          <button
            type="submit"
            disabled={!pub?.id}
            className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-violet-600"
          >
            Propose edit (new draft)
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Index cards</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Catalog tier for Ask and progressive disclosure.</p>
        {cardsRes.error ? (
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">{cardsRes.error.message}</p>
        ) : null}
        <ul className="mt-3 space-y-2 text-sm">
          {(cardsRes.data ?? []).length === 0 ? (
            <li className="text-zinc-500">No index cards yet.</li>
          ) : (
            (cardsRes.data ?? []).map((c) => (
              <li key={c.card_key} className="rounded-lg border border-zinc-100 px-2 py-1 dark:border-zinc-800">
                <span className="font-mono text-xs text-zinc-500">{c.card_key}</span>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{c.title}</p>
                <p className="text-zinc-600 dark:text-zinc-400">{c.summary}</p>
              </li>
            ))
          )}
        </ul>
        <form action={addBrainIndexCardFromForm} className="mt-4 space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <input type="hidden" name="fileId" value={fileId} />
          <input
            name="cardKey"
            placeholder="card_key (slug)"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            name="cardTitle"
            placeholder="Title"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <textarea
            name="cardSummary"
            placeholder="Summary"
            rows={2}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Add card
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Organisation tags (M2M)</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Secondary discovery tags. Primary anchor stays this file&apos;s scope.
        </p>
        <form action={saveBrainFileOrgTagsFromForm} className="mt-4 space-y-2">
          <input type="hidden" name="fileId" value={fileId} />
          <ul className="max-h-56 space-y-2 overflow-y-auto text-sm">
            {(orgRes.data ?? []).map((n) => (
              <li key={n.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="orgNodeId"
                  value={n.id}
                  defaultChecked={tagSet.has(n.id)}
                  className="rounded border-zinc-300"
                />
                <span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{n.label}</span>
                  <span className="ml-2 text-xs text-zinc-500">({n.dimension})</span>
                </span>
              </li>
            ))}
          </ul>
          {(orgRes.data ?? []).length === 0 ? (
            <p className="text-sm text-zinc-500">No org nodes yet. Add them under Company structure.</p>
          ) : (
            <button
              type="submit"
              className="mt-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Save tags
            </button>
          )}
        </form>
      </section>

      <p className="text-sm">
        <Link href="/memory?tab=inbox" className="text-sky-700 underline dark:text-sky-400">
          Back to Inbox
        </Link>
        <span className="mx-2 text-zinc-300">·</span>
        <Link href="/memory?tab=project" className="text-sky-700 underline dark:text-sky-400">
          LiNKbrain home
        </Link>
      </p>
    </main>
  );
}
