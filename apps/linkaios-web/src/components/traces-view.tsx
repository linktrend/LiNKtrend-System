import Link from "next/link";

import { EntityTable } from "@/components/entity-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MISSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type TracesViewProps = {
  searchParams: Promise<{ project?: string; mission?: string; event?: string; event_prefix?: string }>;
  /** Base path for form action and clear link, e.g. "/settings/traces" */
  basePath: string;
};

export async function TracesView(props: TracesViewProps) {
  const sp = await props.searchParams;
  const missionFilter = (sp.project ?? sp.mission)?.trim() ?? "";
  const eventFilter = sp.event?.trim() ?? "";
  const eventPrefix = sp.event_prefix?.trim() ?? "";
  const { basePath } = props;

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
  } else if (eventPrefix === "tool") {
    q = q.like("event_type", "tool.%");
  }

  const { data, error } = await q;

  if (error) {
    return (
      <div>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">System logs could not be loaded.</p>
      </div>
    );
  }

  const tableRows = (data ?? []).map((row) => ({
    event_type: row.event_type,
    project: row.mission_id,
    created_at: row.created_at,
  }));

  return (
    <div>
      <form className="mt-6 flex max-w-2xl flex-wrap items-end gap-3" method="get" action={basePath}>
        <label className="block min-w-[14rem] flex-1 text-sm text-zinc-800 dark:text-zinc-200">
          Project
          <input
            name="project"
            type="text"
            defaultValue={missionFilter}
            placeholder="Project id"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <label className="block min-w-[12rem] flex-1 text-sm text-zinc-800 dark:text-zinc-200">
          Event type
          <input
            name="event"
            type="text"
            defaultValue={eventFilter}
            placeholder="e.g. session.started"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <label className="block min-w-[8rem] text-sm text-zinc-800 dark:text-zinc-200">
          Prefix
          <select
            name="event_prefix"
            defaultValue={eventPrefix}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <option value="">(none)</option>
            <option value="tool">tool.*</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Apply
        </button>
        <Link
          href={basePath}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Clear
        </Link>
      </form>

      <div className="mt-8">
        {!error && (data ?? []).length === 0 ? (
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">No rows match the current filters.</p>
        ) : null}
        <EntityTable
          title="Log events"
          rows={tableRows as Record<string, unknown>[]}
          columns={["event_type", "project", "created_at"]}
          columnHeaders={["Event", "Project", "Time"]}
        />
      </div>
    </div>
  );
}
