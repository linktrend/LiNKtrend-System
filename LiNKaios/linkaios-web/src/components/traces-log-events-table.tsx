import {
  DataTable,
  DataTableBody,
  DataTableEmptyRow,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { TABLE_COLUMN } from "@/lib/ui-standards";

export type TracesLogEventRow = {
  event_type: string;
  project: string | null;
  created_at: string;
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function cellText(value: string | null | undefined): string {
  if (value == null || !String(value).trim()) return "—";
  return String(value);
}

export function TracesLogEventsTable(props: { rows: TracesLogEventRow[] }) {
  return (
    <section>
      <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">{TABLE_COLUMN.logEvents}</h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{props.rows.length} row(s)</p>
      <DataTableShell className="mt-2">
        <DataTable size="sm">
          <colgroup>
            <col className="w-[35%]" />
            <col className="w-[35%]" />
            <col className="w-[30%]" />
          </colgroup>
          <DataTableHead bordered>
            <tr>
              <th className={DT.thTextInset}>{TABLE_COLUMN.event}</th>
              <th className={DT.thTextInset}>{TABLE_COLUMN.project}</th>
              <th className={DT.thTextInset}>{TABLE_COLUMN.time}</th>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {props.rows.length === 0 ? (
              <DataTableEmptyRow colSpan={3}>No rows yet.</DataTableEmptyRow>
            ) : (
              props.rows.map((row, i) => {
                const when = formatWhen(row.created_at);
                const project = cellText(row.project);
                return (
                  <DataTableRow key={i}>
                    <td className={DT.tdClipInset}>
                      <span className={`${DT.tdTextSpan} font-mono`} title={row.event_type}>
                        {row.event_type}
                      </span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={DT.tdTextSpan} title={project}>
                        {project}
                      </span>
                    </td>
                    <td className={DT.tdClipInset}>
                      <span className={`${DT.tdTextSpan} whitespace-nowrap`} title={when}>
                        {when}
                      </span>
                    </td>
                  </DataTableRow>
                );
              })
            )}
          </DataTableBody>
        </DataTable>
      </DataTableShell>
    </section>
  );
}
