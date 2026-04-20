import { notFound } from "next/navigation";

import { isDemoAgentId } from "@/lib/ui-mocks/entities";
import { DEMO_AGENT_PERSONA, MOCK_UI_AGENT_PERSONA_LAYERS } from "@/lib/ui-mocks/worker-ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TABLE } from "@/lib/ui-standards";

export const dynamic = "force-dynamic";

export default async function WorkerBrainPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  if (isDemoAgentId(id)) {
    const layers = DEMO_AGENT_PERSONA[id] ?? [];
    return (
      <div className="space-y-8">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Persona stack</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            LiNKbrain layers scoped to this agent — base persona, soul, identity, agent runtime, etc.
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className={`px-4 py-3 ${TABLE.thText}`}>Layer</th>
                  <th className={`px-4 py-3 ${TABLE.thText}`}>Summary</th>
                  <th className={`px-4 py-3 ${TABLE.thText}`}>Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {layers.map((row) => (
                  <tr key={row.layer}>
                    <td className="px-4 py-3 font-medium text-zinc-900">{row.layer}</td>
                    <td className="max-w-lg px-4 py-3 text-zinc-600">{row.summary}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500">{row.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Entries</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-sm">
            Agent-scoped journal and memory entries (UI fixture — not from LiNKbrain storage).
          </p>
          <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white text-sm">
            <li className="px-4 py-3 text-zinc-600">Stakeholder readout — Q3 priorities (pinned)</li>
            <li className="px-4 py-3 text-zinc-600">Operating principles — escalation ladder</li>
            <li className="px-4 py-3 text-zinc-600">Last governance review notes</li>
          </ul>
        </section>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: agent, error } = await supabase.schema("linkaios").from("agents").select("id").eq("id", id).maybeSingle();
  if (error || !agent) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Persona stack</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          LiNKbrain layers for this LiNKbot (preview rows for layout review).
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className={`px-4 py-3 ${TABLE.thText}`}>Layer</th>
                <th className={`px-4 py-3 ${TABLE.thText}`}>Summary</th>
                <th className={`px-4 py-3 ${TABLE.thText}`}>Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {MOCK_UI_AGENT_PERSONA_LAYERS.map((row) => (
                <tr key={row.layer}>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{row.layer}</td>
                  <td className="max-w-lg px-4 py-3 text-zinc-600 dark:text-zinc-400">{row.summary}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-500">{row.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Entries</h2>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-sm">
          Recent memory-style entries (preview copy for layout review).
        </p>
        <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white text-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          <li className="px-4 py-3 text-zinc-600 dark:text-zinc-400">Project brief — Acme rollout risks</li>
          <li className="px-4 py-3 text-zinc-600 dark:text-zinc-400">Customer notes — preferred escalation path</li>
          <li className="px-4 py-3 text-zinc-600 dark:text-zinc-400">Weekly digest — open actions</li>
        </ul>
      </section>
    </div>
  );
}
