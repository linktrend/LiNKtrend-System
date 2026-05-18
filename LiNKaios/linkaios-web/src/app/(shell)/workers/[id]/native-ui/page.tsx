import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function WorkerNativeUiPlaceholderPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return (
    <main className="mx-auto max-w-lg space-y-6 px-6 py-16 text-center">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Native UI</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Reserved for the LiNKbot native shell. Set{" "}
        <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">NEXT_PUBLIC_LINKBOT_NATIVE_UI_BASE_URL</code> in the
        LiNKaios deployment so the <strong>Native UI</strong> tab opens your runtime instead of this placeholder.
      </p>
      <p className="font-mono text-xs text-zinc-500 dark:text-zinc-500">Agent id: {id}</p>
      <Link href={`/workers/${id}/sessions`} className="text-sm font-medium text-violet-800 underline dark:text-violet-300">
        ← Back to LiNKbot (this tab can be closed)
      </Link>
    </main>
  );
}
