import { TABLE } from "@/lib/ui-standards";

function headerLabel(columnKey: string, headers: string[] | undefined, index: number): string {
  const h = headers?.[index];
  if (h) return h;
  return columnKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export function EntityTable(props: {
  title: string;
  rows: Record<string, unknown>[];
  columns: string[];
  /** Optional header labels aligned with `columns` (same length). */
  columnHeaders?: string[];
}) {
  return (
    <section>
      <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">{props.title}</h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{props.rows.length} row(s)</p>
      <div className="mt-2 overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full min-w-[240px] text-left text-xs">
          <thead className="border-b border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              {props.columns.map((c, idx) => (
                <th key={c} className={`px-2 py-2 font-medium ${TABLE.thText}`}>
                  {headerLabel(c, props.columnHeaders, idx)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.rows.length === 0 ? (
              <tr>
                <td className="px-2 py-3 text-zinc-500" colSpan={props.columns.length}>
                  No rows yet.
                </td>
              </tr>
            ) : (
              props.rows.map((row, i) => (
                <tr key={i} className="border-b border-zinc-100 last:border-0">
                  {props.columns.map((c) => (
                    <td key={c} className="px-2 py-2 text-zinc-800 dark:text-zinc-200">
                      {formatCell(row[c])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}
