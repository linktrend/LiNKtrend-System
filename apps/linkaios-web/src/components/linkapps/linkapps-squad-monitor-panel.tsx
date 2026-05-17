import type { SquadRoleRowFixture } from "@/lib/plugins/linkapps/types";

function roleStateLabel(state: SquadRoleRowFixture["state"]): string {
  return state;
}

function rowTone(state: SquadRoleRowFixture["state"]): string {
  if (state === "failed") return "border-l-red-500 bg-red-50/40 dark:bg-red-950/20";
  if (state === "active") return "border-l-sky-500 bg-sky-50/30 dark:bg-sky-950/25";
  if (state === "done") return "border-l-emerald-500 bg-emerald-50/25 dark:bg-emerald-950/15";
  return "border-l-zinc-200 bg-zinc-50/40 dark:border-l-zinc-700 dark:bg-zinc-900/40";
}

export function LinkappsSquadMonitorPanel(props: { rows: SquadRoleRowFixture[] }) {
  return (
    <section
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby="linkapps-squad-heading"
    >
      <h2 id="linkapps-squad-heading" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Squad monitor
      </h2>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
        Manifest <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">linkapps.squad_monitor</code> — kernel DAG order,
        LinkBot roles from WP-106.
      </p>
      <ul className="mt-4 space-y-2">
        {props.rows.map((row) => (
          <li
            key={row.roleId}
            className={
              "flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-100 px-3 py-2 text-xs dark:border-zinc-800 " +
              rowTone(row.state)
            }
          >
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-50">{row.label}</p>
              <p className="mt-0.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">{row.roleId}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300">{row.stageId}</p>
              <p className="mt-0.5 text-zinc-600 dark:text-zinc-400">{roleStateLabel(row.state)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
