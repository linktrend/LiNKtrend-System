import { EntityTable } from "@/components/entity-table";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function TracesPage() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .schema("linkaios")
    .from("traces")
    .select("event_type, mission_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

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
        Recent rows from <code className="text-xs">linkaios.traces</code>.
      </p>
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
