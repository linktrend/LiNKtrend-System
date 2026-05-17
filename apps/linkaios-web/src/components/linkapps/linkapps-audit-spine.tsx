import type { AuditSpineFixture } from "@/lib/plugins/linkapps/types";

export function LinkappsAuditSpine(props: { entries: AuditSpineFixture[] }) {
  return (
    <section
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="linkapps-audit-heading"
    >
      <h2 id="linkapps-audit-heading" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Audit spine (fixture)
      </h2>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
        Id-only verbs — payloads remain refs in LiNKbrain / kernel records per squad orchestration spec.
      </p>
      <ol className="mt-4 space-y-2 border-l-2 border-sky-500/40 pl-4 dark:border-sky-400/35">
        {props.entries.map((e) => (
          <li key={e.id} className="text-xs">
            <span className="font-mono font-medium text-zinc-900 dark:text-zinc-50">{e.verb}</span>
            <span className="text-zinc-500 dark:text-zinc-500"> · </span>
            <span className="text-zinc-600 dark:text-zinc-400">{e.at}</span>
            <span className="text-zinc-500 dark:text-zinc-500"> · </span>
            <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400">{e.id}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[11px] text-zinc-500 dark:text-zinc-400">
        Trace deep-link placeholder (kernel wiring TBD):{" "}
        <span className="font-mono text-zinc-600 dark:text-zinc-400">/settings/traces</span>
      </p>
    </section>
  );
}
