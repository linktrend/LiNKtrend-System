import type { ReactNode } from "react";

export function splitCatalogueRows<T extends { isFixture?: boolean }>(rows: T[]) {
  return {
    fixtures: rows.filter((r) => r.isFixture),
    live: rows.filter((r) => !r.isFixture),
  };
}

export function CatalogueSplitSections(props: {
  fixtures: ReactNode;
  live: ReactNode;
  empty: ReactNode;
  hasFixtures: boolean;
  hasLive: boolean;
}) {
  if (!props.hasFixtures && !props.hasLive) return <>{props.empty}</>;
  return (
    <div className="space-y-8">
      {props.hasFixtures ? (
        <section>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Sample rows (layout review)</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Demo fixtures — not stored in the live catalogue.</p>
          <div className="mt-3">{props.fixtures}</div>
        </section>
      ) : null}
      {props.hasLive ? (
        <section>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Live catalogue</h2>
          <div className="mt-3">{props.live}</div>
        </section>
      ) : null}
    </div>
  );
}
