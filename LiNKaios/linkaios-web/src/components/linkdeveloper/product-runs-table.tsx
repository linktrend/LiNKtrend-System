import Link from "next/link";

import type { ProductRunSummary } from "@/lib/admin/linkdeveloper/types";

type Props = {
  runs: ProductRunSummary[];
  detailHref?: (id: string) => string;
};

export function ProductRunsTable(props: Props) {
  const hrefFor = props.detailHref ?? ((id: string) => `/suites/linkdeveloper/product-runs/${id}`);

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {props.runs.map((run) => (
            <tr key={run.id} className="border-t border-zinc-200 dark:border-zinc-800">
              <td className="px-4 py-3">
                <Link href={hrefFor(run.id)} className="font-medium text-sky-700 hover:underline dark:text-sky-300">
                  {run.name}
                </Link>
              </td>
              <td className="px-4 py-3">{run.status}</td>
              <td className="px-4 py-3 text-zinc-500">{new Date(run.updated_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
