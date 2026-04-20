import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WorkerProjectsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createSupabaseServerClient();
  const { data: agent, error: agentErr } = await supabase
    .schema("linkaios")
    .from("agents")
    .select("id, display_name")
    .eq("id", id)
    .maybeSingle();

  if (agentErr || !agent) {
    notFound();
  }

  const { data, error } = await supabase
    .schema("linkaios")
    .from("missions")
    .select("id, title, status, updated_at")
    .eq("primary_agent_id", id)
    .order("updated_at", { ascending: false })
    .limit(40);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Projects</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Projects where {String((agent as { display_name: string }).display_name)} is the primary LiNKbot.
        </p>
        <div className="mt-4">
          {error ? (
            <p className="text-sm text-amber-800 dark:text-amber-200">Project list could not be loaded.</p>
          ) : !data?.length ? (
            <p className="text-sm text-zinc-500">No primary projects assigned.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {data.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <Link href={`/projects/${m.id}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-100">
                    {m.title}
                  </Link>
                  <span className="text-xs capitalize text-zinc-500">{String(m.status).replace(/_/g, " ")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
