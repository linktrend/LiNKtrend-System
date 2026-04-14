import Link from "next/link";

import { EntityTable } from "@/components/entity-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MISSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function TracesPage(props: {
  searchParams: Promise<{ mission?: string; event?: string }>;
}) {
  const sp = await props.searchParams;
  const missionFilter = sp.mission?.trim() ?? "";
  const eventFilter = sp.event?.trim() ?? "";

  const supabase = await createSupabaseServerClient();
  let q = supabase
    .schema("linkaios")
    .from("traces")
    .select("event_type, mission_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (MISSION_ID_RE.test(missionFilter)) {
    q = q.eq("mission_id", missionFilter);
  }
  if (eventFilter) {
    q = q.eq("event_type", eventFilter);
  }

  const { data, error } = await q;

  if (error) {
    return (
      <main>
        <h1 className="text-xl font-semibold text-zinc-900">Traces</h1>
        <p className="mt-4 text-sm text-red-700">{error.message}</p>
      </main>
    );
  }

  return (
    <main>
      <h1 className="text-xl font-semibold text-zinc-900">Traces</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Recent rows from <code className="text-xs">linkaios.traces</code>. Filters use exact{" "}
        <code className="text-xs">mission_id</code> (UUID) and <code className="text-xs">event_type</code>.
      </p>

      <form className="mt-6 flex max-w-2xl flex-wrap items-end gap-3" method="get" action="/traces">
        <label className="block min-w-[14rem] flex-1 text-sm text-zinc-800">
          Mission id
          <input
            name="mission"
            type="text"
            defaultValue={missionFilter}
            placeholder="00000000-0000-…"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm"
          />
        </label>
        <label className="block min-w-[12rem] flex-1 text-sm text-zinc-800">
          Event type
          <input
            name="event"
            type="text"
            defaultValue={eventFilter}
            placeholder="gateway.message_linked"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Apply
        </button>
        <Link
          href="/traces"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Clear
        </Link>
      </form>

      <div className="mt-8">
        <EntityTable
          title="Trace events"
          rows={(data ?? []) as Record<string, unknown>[]}
          columns={["event_type", "mission_id", "created_at"]}
        />
      </div>
    </main>
  );
}
