import Link from "next/link";

import { BUTTON } from "@/lib/ui-standards";

export type CapabilitiesHubSliceStats = {
  total: number;
  approved: number;
  draft: number;
  sunset: number;
  sunsetLabel: string;
  publishedOn: number;
  runtimeOn: number;
  fixtures: number;
};

function StatLine(props: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 py-2 text-sm last:border-0 dark:border-zinc-800/80">
      <span className="text-zinc-600 dark:text-zinc-400">{props.label}</span>
      <span className="tabular-nums font-medium text-zinc-900 dark:text-zinc-100">{props.value}</span>
    </div>
  );
}

export function CapabilitiesHubCards(props: { skills: CapabilitiesHubSliceStats; tools: CapabilitiesHubSliceStats }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Skills</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Instruction-style capabilities agents can load at runtime.
        </p>
        <div className="mt-4 flex-1">
          <StatLine label="Total in catalogue" value={props.skills.total} />
          <StatLine label="Approved" value={props.skills.approved} />
          <StatLine label="Draft" value={props.skills.draft} />
          <StatLine label={props.skills.sunsetLabel} value={props.skills.sunset} />
          <StatLine label="Available (on)" value={props.skills.publishedOn} />
          <StatLine label="Runtime enabled (on)" value={props.skills.runtimeOn} />
          {props.skills.fixtures > 0 ? <StatLine label="Fixture rows (demo)" value={props.skills.fixtures} /> : null}
        </div>
        <Link href="/skills/skills" className={`${BUTTON.secondaryCardAction} mt-6`}>
          Open Skills catalogue
        </Link>
      </article>

      <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Tools</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Callable integrations and actions exposed to agents.
        </p>
        <div className="mt-4 flex-1">
          <StatLine label="Total in catalogue" value={props.tools.total} />
          <StatLine label="Approved" value={props.tools.approved} />
          <StatLine label="Draft" value={props.tools.draft} />
          <StatLine label={props.tools.sunsetLabel} value={props.tools.sunset} />
          <StatLine label="Available (on)" value={props.tools.publishedOn} />
          <StatLine label="Runtime enabled (on)" value={props.tools.runtimeOn} />
          {props.tools.fixtures > 0 ? <StatLine label="Fixture rows (demo)" value={props.tools.fixtures} /> : null}
        </div>
        <Link href="/skills/tools" className={`${BUTTON.secondaryCardAction} mt-6`}>
          Open Tools catalogue
        </Link>
      </article>
    </div>
  );
}
