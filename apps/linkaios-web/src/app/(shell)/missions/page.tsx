import Link from "next/link";

import { listMissions } from "@linktrend/linklogic-sdk";

import { EntityTable } from "@/components/entity-table";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MissionsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await listMissions(supabase, { limit: 200 });

  if (error) {
    return (
      <main>
        <h1 className="text-xl font-semibold text-zinc-900">Missions</h1>
        <p className="mt-4 text-sm text-red-700">{error.message}</p>
      </main>
    );
  }

  return (
    <main>
      <h1 className="text-xl font-semibold text-zinc-900">Missions</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        Central mission records. Open a mission for manifests and scoped memory.
      </p>
      <div className="mt-8">
        <EntityTable
          title="All missions"
          rows={(data ?? []) as unknown as Record<string, unknown>[]}
          columns={["title", "status", "updated_at"]}
        />
      </div>
      <ul className="mt-6 space-y-2 text-sm">
        {data?.map((m) => (
          <li key={m.id}>
            <Link
              href={`/missions/${m.id}`}
              className="text-zinc-900 underline decoration-zinc-300 hover:decoration-zinc-700"
            >
              {m.title}
            </Link>
            <span className="ml-2 text-zinc-500">({m.status})</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
