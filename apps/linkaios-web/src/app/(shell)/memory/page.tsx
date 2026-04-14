import Link from "next/link";

import { listMemoryEntries } from "@linktrend/linklogic-sdk";

import { EntityTable } from "@/components/entity-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MemoryPage(props: {
  searchParams: Promise<{ mission?: string }>;
}) {
  const { mission: missionFilter } = await props.searchParams;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await listMemoryEntries(supabase, {
    missionId: missionFilter?.trim() || undefined,
    limit: 200,
  });

  if (error) {
    return (
      <main>
        <h1 className="text-xl font-semibold text-zinc-900">Memory</h1>
        <p className="mt-4 text-sm text-red-700">{error.message}</p>
      </main>
    );
  }

  return (
    <main>
      <h1 className="text-xl font-semibold text-zinc-900">LiNKbrain memory</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Working memory rows in <code className="text-xs">linkaios.memory_entries</code>. Append{" "}
        <code className="text-xs">?mission=&lt;uuid&gt;</code> to filter by mission.
      </p>
      {missionFilter ? (
        <p className="mt-2 text-sm text-zinc-700">
          Filtered to mission{" "}
          <Link href={`/missions/${missionFilter}`} className="font-mono text-xs underline">
            {missionFilter}
          </Link>{" "}
          ·{" "}
          <Link href="/memory" className="text-zinc-600 underline">
            clear
          </Link>
        </p>
      ) : null}
      <div className="mt-8">
        <EntityTable
          title="Entries"
          rows={(data ?? []) as Record<string, unknown>[]}
          columns={["mission_id", "classification", "body", "created_at"]}
        />
      </div>
    </main>
  );
}
