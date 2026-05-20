import Link from "next/link";

import { buildDevtoolsMvoProof } from "@/lib/devtools-mvo-proof";

export const dynamic = "force-dynamic";

export default function DevtoolsMvoProofPage() {
  const proof = buildDevtoolsMvoProof();

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">MVO proof surfaces (dev only)</h2>
        <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
          Deterministic, no-side-effect proof snapshots for Browser QA. These references are local operator fixtures and
          do not execute live integrations.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">WebsiteFactory / LinkSites proof</h3>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Run: <span className="font-mono text-xs">{proof.websitefactory.run_id}</span> | Status: <span className="font-medium">{proof.websitefactory.status}</span>
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
          {proof.websitefactory.timeline.map((stage) => (
            <li key={stage.stage_id}>
              {stage.stage_id}: {stage.status}
            </li>
          ))}
        </ul>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Preview artifact: <span className="font-mono text-xs">{proof.websitefactory.preview.preview_artifact_ref}</span>
        </p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Preview URL: <span className="font-mono text-xs">{proof.websitefactory.preview.preview_url}</span>
        </p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Local proof route: <span className="font-mono text-xs">{proof.websitefactory.preview.preview_local_route}</span>
        </p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">Lease refs: {proof.websitefactory.lease_ids.join(", ")}</p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">Workflow refs: {proof.websitefactory.workflow_run_ids.join(", ")}</p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">Audit refs: {proof.websitefactory.audit_event_ids.join(", ")}</p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">Bot refs: {proof.websitefactory.bot_refs.join(", ")}</p>
      </section>

      <section className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">LEXOS proof</h3>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Matter intake: {proof.lexos.matter_intake.matter_id} ({proof.lexos.matter_intake.intake_status})
        </p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Evidence/research: {proof.lexos.evidence_research.evidence_status} / {proof.lexos.evidence_research.research_status}
        </p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">Task refs: {proof.lexos.tasks.map((t) => t.task_id).join(", ")}</p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">Trace lease refs: {proof.lexos.trace.lease_ids.join(", ")}</p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">Trace workflow refs: {proof.lexos.trace.workflow_run_ids.join(", ")}</p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">Trace audit refs: {proof.lexos.trace.audit_event_ids.join(", ")}</p>
      </section>

      <section className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">LiNKapps proof</h3>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          App brief: {proof.linkapps.app_brief.app_slug} ({proof.linkapps.app_brief.venture_id})
        </p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">Squad status: {proof.linkapps.squad_status.status}</p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Provider readiness: GitHub {proof.linkapps.provider_readiness.github}, Supabase {proof.linkapps.provider_readiness.supabase}, Plane {proof.linkapps.provider_readiness.plane}
        </p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">Task refs: {proof.linkapps.tasks.map((t) => t.task_id).join(", ")}</p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Handoff package ref: <span className="font-mono text-xs">{proof.linkapps.handoff_package.handoff_package_ref}</span>
        </p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">Trace lease refs: {proof.linkapps.trace.lease_ids.join(", ")}</p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">Trace audit refs: {proof.linkapps.trace.audit_event_ids.join(", ")}</p>
      </section>

      <section>
        <Link href="/settings/advanced" className="text-sm font-medium text-sky-700 underline dark:text-sky-400">
          Back to Advanced settings
        </Link>
      </section>
    </div>
  );
}
