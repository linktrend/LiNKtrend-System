import type { ReleaseReadinessResponse } from "@/lib/admin/linkdeveloper/types";

type Props = {
  readiness: ReleaseReadinessResponse;
  productRunName?: string;
};

export function ReleaseReadinessPanel(props: Props) {
  const { readiness } = props;

  return (
    <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Release readiness</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {readiness.ready ? "Ready for launch review." : "Not ready — resolve blockers first."}
      </p>
      {readiness.blockers.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          {readiness.blockers.map((blocker) => (
            <li key={blocker}>{blocker}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
