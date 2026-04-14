import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getMissionById,
  listManifestsForMission,
  listMemoryEntries,
} from "@linktrend/linklogic-sdk";

import { EntityTable } from "@/components/entity-table";
import { canWriteCommandCentre, getCommandCentreRoleForUser } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { AppendMemoryForm } from "./append-memory-form";

export const dynamic = "force-dynamic";

export default async function MissionDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role =
    user?.id != null
      ? await getCommandCentreRoleForUser(supabase, { userId: user.id, email: user.email })
      : "operator";
  const canWrite = canWriteCommandCentre(role);

  const [{ data: mission, error: mErr }, manifests, memory] = await Promise.all([
    getMissionById(supabase, id),
    listManifestsForMission(supabase, id),
    listMemoryEntries(supabase, { missionId: id, limit: 100 }),
  ]);

  if (mErr || !mission) {
    notFound();
  }

  return (
    <main>
      <p className="text-sm text-zinc-500">
        <Link href="/missions" className="text-zinc-700 underline">
          Missions
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">{mission.title}</span>
      </p>
      <h1 className="mt-2 text-xl font-semibold text-zinc-900">{mission.title}</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Status <span className="font-mono text-xs">{mission.status}</span> · id{" "}
        <span className="font-mono text-xs">{mission.id}</span>
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-zinc-900">Manifests</h2>
        {manifests.error ? (
          <p className="mt-2 text-sm text-red-700">{manifests.error.message}</p>
        ) : (
          <div className="mt-4">
            <EntityTable
              title="Versions"
              rows={(manifests.data ?? []) as Record<string, unknown>[]}
              columns={["version", "created_at"]}
            />
          </div>
        )}
      </section>

      <p className="mt-4 text-sm">
        <Link href={`/memory?mission=${mission.id}`} className="text-zinc-700 underline">
          View all memory for this mission
        </Link>
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-zinc-900">Memory (LiNKbrain)</h2>
        <AppendMemoryForm missionId={mission.id} canWrite={canWrite} />
        {memory.error ? (
          <p className="mt-2 text-sm text-red-700">{memory.error.message}</p>
        ) : (
          <div className="mt-4">
            <EntityTable
              title="Entries"
              rows={(memory.data ?? []) as Record<string, unknown>[]}
              columns={["classification", "body", "created_at"]}
            />
          </div>
        )}
      </section>
    </main>
  );
}
