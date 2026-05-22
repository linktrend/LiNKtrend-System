import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { formatTableColumnLabel } from "@/lib/ui-standards";

function headerLabel(columnKey: string, headers: string[] | undefined, index: number): string {
  const h = headers?.[index];
  if (h) return h;
  return formatTableColumnLabel(columnKey);
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
      <DataTableShell className="mt-2">
        <DataTable size="sm">
          <DataTableHead bordered>
            <tr>
              {props.columns.map((c, idx) => (
                <th key={c} className={DT.thTextInset}>
                  {headerLabel(c, props.columnHeaders, idx)}
                </th>
              ))}
            </tr>
          </DataTableHead>
          <DataTableBody>
            {props.rows.length === 0 ? (
              <DataTableEmptyRow colSpan={props.columns.length}>No rows yet.</DataTableEmptyRow>
            ) : (
              props.rows.map((row, i) => (
                <DataTableRow key={i}>
                  {props.columns.map((c) => (
                    <td key={c} className={DT.tdClipInset}>
                      <span className={DT.tdTextSpan} title={formatCell(row[c])}>
                        {formatCell(row[c])}
                      </span>
                    </td>
                  ))}
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </DataTable>
      </DataTableShell>
    </section>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}
