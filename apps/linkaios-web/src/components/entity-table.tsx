export function EntityTable(props: {
  title: string;
  rows: Record<string, unknown>[];
  columns: string[];
}) {
  return (
    <section>
      <h2 className="text-lg font-medium text-zinc-800">{props.title}</h2>
      <p className="text-xs text-zinc-500">{props.rows.length} row(s)</p>
      <div className="mt-2 overflow-x-auto rounded-md border border-zinc-200 bg-white">
        <table className="w-full min-w-[240px] text-left text-xs">
          <thead className="border-b border-zinc-200 bg-zinc-100 text-zinc-600">
            <tr>
              {props.columns.map((c) => (
                <th key={c} className="px-2 py-2 font-medium">
                  {c}
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
                    <td key={c} className="px-2 py-2 text-zinc-800">
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
